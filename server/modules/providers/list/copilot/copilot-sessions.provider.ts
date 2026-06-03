import os from 'node:os';
import path from 'node:path';

import type { IProviderSessions } from '@/shared/interfaces.js';
import type { AnyRecord, FetchHistoryOptions, FetchHistoryResult, NormalizedMessage } from '@/shared/types.js';
import { createNormalizedMessage, generateMessageId, readObjectRecord } from '@/shared/utils.js';

const PROVIDER = 'githubcopilot';

/**
 * Root of the GitHub Copilot CLI session store. Each session lives in
 * `<root>/<session-id>/events.jsonl` (a streaming event log) plus a
 * `workspace.yaml` metadata file.
 *
 * TODO(copilot): confirm this path against a pinned `@github/copilot` version —
 * the CLI is young and the on-disk layout has shifted between releases. The
 * synchronizer treats a missing directory as "not used on this host", so an
 * incorrect path degrades gracefully (no sessions indexed) rather than crashing.
 */
export const COPILOT_SESSION_ROOT = path.join(os.homedir(), '.copilot', 'session-state');

export function copilotEventsFile(sessionId: string): string {
  return path.join(COPILOT_SESSION_ROOT, sessionId, 'events.jsonl');
}

/**
 * Normalizes one Copilot CLI event (a parsed line from `--output-format json`,
 * which emits JSONL — one object per line) into the app's shared message shape.
 *
 * The exact event envelope is still evolving, so this is intentionally
 * tolerant: it recognizes the common shapes (assistant/user text, tool calls
 * and results, errors, session id) and otherwise surfaces any text payload it
 * can find rather than dropping content silently.
 */
function normalizeEvent(raw: AnyRecord, sessionId: string | null): NormalizedMessage[] {
  const type = typeof raw.type === 'string' ? raw.type : '';
  const eventSessionId = typeof raw.session_id === 'string'
    ? raw.session_id
    : typeof raw.sessionId === 'string'
      ? raw.sessionId
      : sessionId;
  const role: 'user' | 'assistant' = raw.role === 'user' ? 'user' : 'assistant';

  const base = {
    sessionId: eventSessionId,
    provider: PROVIDER,
  } as const;

  // Session/thread id announcements let the chat capture the resumable id.
  if ((type === 'session' || type === 'session_created' || type === 'init') && eventSessionId) {
    return [createNormalizedMessage({ ...base, kind: 'session_created', newSessionId: eventSessionId })];
  }

  if (type === 'error' || raw.error) {
    const errRecord = readObjectRecord(raw.error);
    const message = typeof raw.error === 'string'
      ? raw.error
      : typeof errRecord?.message === 'string'
        ? errRecord.message
        : 'GitHub Copilot error';
    return [createNormalizedMessage({ ...base, kind: 'error', content: message })];
  }

  // Tool invocation + result (field names vary; accept the common ones).
  if (type === 'tool_call' || type === 'tool_use' || raw.tool_name || raw.toolName) {
    const toolName = typeof raw.tool_name === 'string'
      ? raw.tool_name
      : typeof raw.toolName === 'string'
        ? raw.toolName
        : 'tool';
    const toolId = typeof raw.tool_call_id === 'string'
      ? raw.tool_call_id
      : typeof raw.id === 'string'
        ? raw.id
        : generateMessageId(PROVIDER);
    return [createNormalizedMessage({
      ...base,
      kind: 'tool_use',
      toolName,
      toolInput: raw.arguments ?? raw.input ?? raw.parameters,
      toolId,
    })];
  }

  if (type === 'tool_result') {
    const toolId = typeof raw.tool_call_id === 'string' ? raw.tool_call_id : undefined;
    const output = typeof raw.output === 'string'
      ? raw.output
      : raw.output != null
        ? JSON.stringify(raw.output)
        : typeof raw.content === 'string'
          ? raw.content
          : '';
    return [createNormalizedMessage({
      ...base,
      kind: 'tool_result',
      toolId,
      content: output,
      isError: raw.is_error === true,
    })];
  }

  if (type === 'reasoning' || type === 'thinking') {
    const text = typeof raw.text === 'string' ? raw.text : '';
    return text.trim() ? [createNormalizedMessage({ ...base, kind: 'thinking', content: text })] : [];
  }

  // Plain assistant/user message text. Copilot may stream deltas or send a
  // single message object with a `content`/`text` field.
  const text = typeof raw.text === 'string'
    ? raw.text
    : typeof raw.content === 'string'
      ? raw.content
      : typeof raw.delta === 'string'
        ? raw.delta
        : '';
  if (!text.trim()) {
    return [];
  }
  return [createNormalizedMessage({ ...base, kind: 'text', role, content: text })];
}

export class CopilotSessionsProvider implements IProviderSessions {
  /**
   * Normalizes a live Copilot CLI event line (object) or a raw stdout chunk.
   */
  normalizeMessage(rawMessage: unknown, sessionId: string | null): NormalizedMessage[] {
    if (typeof rawMessage === 'string' && rawMessage.trim()) {
      return [createNormalizedMessage({
        id: generateMessageId(PROVIDER),
        kind: 'stream_delta',
        content: rawMessage,
        sessionId,
        provider: PROVIDER,
      })];
    }

    const raw = readObjectRecord(rawMessage);
    if (!raw) {
      return [];
    }

    return normalizeEvent(raw, sessionId);
  }

  /**
   * Loads persisted history for one Copilot session from its `events.jsonl`.
   * Pagination matches the other providers' "page from the end" semantics so
   * the chat UI's "load earlier" affordance behaves identically.
   */
  async fetchHistory(
    sessionId: string,
    options: FetchHistoryOptions = {},
  ): Promise<FetchHistoryResult> {
    const { limit = null, offset = 0 } = options;

    let lines: string[];
    try {
      const { readFile } = await import('node:fs/promises');
      const content = await readFile(copilotEventsFile(sessionId), 'utf8');
      lines = content.split('\n').filter((line) => line.trim());
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') {
        console.warn(`[CopilotProvider] Failed to load session ${sessionId}:`, error instanceof Error ? error.message : error);
      }
      return { messages: [], total: 0, hasMore: false, offset: 0, limit: null };
    }

    const normalized: NormalizedMessage[] = [];
    const toolUseMap = new Map<string, NormalizedMessage>();
    for (const line of lines) {
      let raw: AnyRecord | null;
      try {
        raw = readObjectRecord(JSON.parse(line));
      } catch {
        continue;
      }
      if (!raw) continue;

      for (const msg of normalizeEvent(raw, sessionId)) {
        if (msg.kind === 'session_created') continue;
        if (msg.kind === 'tool_use' && msg.toolId) {
          toolUseMap.set(msg.toolId, msg);
        }
        normalized.push(msg);
      }
    }

    // Pair tool_results onto their tool_use so the renderer shows output inline.
    for (const msg of normalized) {
      if (msg.kind === 'tool_result' && msg.toolId && toolUseMap.has(msg.toolId)) {
        const toolUse = toolUseMap.get(msg.toolId);
        if (toolUse) {
          toolUse.toolResult = { content: msg.content, isError: msg.isError };
        }
      }
    }

    const total = normalized.length;
    if (limit !== null) {
      const startIndex = Math.max(0, total - offset - limit);
      const endIndex = total - offset;
      return { messages: normalized.slice(startIndex, endIndex), total, hasMore: startIndex > 0, offset, limit };
    }

    return { messages: normalized, total, hasMore: false, offset: 0, limit: null };
  }
}
