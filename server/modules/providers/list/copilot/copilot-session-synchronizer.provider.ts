import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { COPILOT_SESSION_ROOT, copilotEventsFile } from '@/modules/providers/list/copilot/copilot-sessions.provider.js';
import { sessionsDb } from '@/modules/database/index.js';
import type { IProviderSessionSynchronizer } from '@/shared/interfaces.js';
import { normalizeSessionName, readObjectRecord } from '@/shared/utils.js';

/**
 * Indexes GitHub Copilot CLI sessions into the shared sessions DB.
 *
 * Copilot stores each conversation as `<root>/<session-id>/events.jsonl`. We
 * scan those directories, derive the working directory and a title from the
 * event log, and upsert lightweight session metadata; the heavy event data is
 * loaded on demand by `CopilotSessionsProvider.fetchHistory`.
 *
 * TODO(copilot): the per-session `workspace.yaml` would be a more reliable
 * source for the project directory than scraping events. Parse it once the YAML
 * layout is confirmed against a pinned CLI version.
 */
export class CopilotSessionSynchronizer implements IProviderSessionSynchronizer {
  private readonly provider = 'githubcopilot' as const;

  async synchronize(_since?: Date): Promise<number> {
    let entries: string[];
    try {
      entries = await readdir(COPILOT_SESSION_ROOT);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      // ENOENT is normal — Copilot CLI just isn't installed/used on this host.
      if (code !== 'ENOENT') {
        console.warn('[CopilotSync] failed to read session root:', error instanceof Error ? error.message : error);
      }
      return 0;
    }

    let processed = 0;
    for (const sessionId of entries) {
      const indexed = await this.synchronizeFile(copilotEventsFile(sessionId));
      if (indexed) {
        processed += 1;
      }
    }
    return processed;
  }

  /**
   * Indexes a single Copilot `events.jsonl` file. Also used by the filesystem
   * watcher when an event log changes.
   */
  async synchronizeFile(filePath: string): Promise<string | null> {
    if (!filePath.endsWith('events.jsonl')) {
      return null;
    }

    const sessionId = path.basename(path.dirname(filePath));
    if (!sessionId) {
      return null;
    }

    let content: string;
    let fileStat: Awaited<ReturnType<typeof stat>>;
    try {
      fileStat = await stat(filePath);
      content = await readFile(filePath, 'utf8');
    } catch {
      return null;
    }

    let directory: string | null = null;
    let title: string | null = null;
    let firstTimestamp: string | null = null;

    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      let raw: ReturnType<typeof readObjectRecord>;
      try {
        raw = readObjectRecord(JSON.parse(line));
      } catch {
        continue;
      }
      if (!raw) continue;

      if (!directory) {
        const cwd = raw.cwd ?? raw.working_directory ?? raw.workingDirectory ?? raw.directory;
        if (typeof cwd === 'string' && cwd.trim()) {
          directory = cwd;
        }
      }
      if (!title && typeof raw.text === 'string' && raw.role === 'user' && raw.text.trim()) {
        title = raw.text.trim().slice(0, 120);
      }
      if (!firstTimestamp && typeof raw.timestamp === 'string') {
        firstTimestamp = raw.timestamp;
      }
    }

    // Without a resolvable project directory the sidebar can't place the
    // session under a project, so skip rather than register an orphan.
    if (!directory) {
      return null;
    }

    const createdAt = firstTimestamp ?? fileStat.birthtime.toISOString();
    const updatedAt = fileStat.mtime.toISOString();

    sessionsDb.createSession(
      sessionId,
      this.provider,
      directory,
      normalizeSessionName(title ?? undefined, 'Untitled Copilot Session'),
      createdAt,
      updatedAt,
      // Heavy data lives in events.jsonl; fetchHistory reads it directly.
      filePath,
    );

    return sessionId;
  }
}
