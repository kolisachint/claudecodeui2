import { spawn } from 'child_process';
import fs from 'fs';

import crossSpawn from 'cross-spawn';

import { notifyRunFailed, notifyRunStopped } from './services/notification-orchestrator.js';
import { sessionsService } from './modules/providers/services/sessions.service.js';
import { providerAuthService } from './modules/providers/services/provider-auth.service.js';
import { createNormalizedMessage } from './shared/utils.js';

const spawnFunction = process.platform === 'win32' ? crossSpawn : spawn;

const activeCopilotProcesses = new Map();

/**
 * Send a normalized message through whichever transport `ws` represents.
 * Mirrors the other CLI adapters: the chat WS writer already JSON.stringifies,
 * so only the raw-ws fallback stringifies here.
 */
function sendCopilotMessage(ws, message) {
  try {
    if (ws && (ws.isWebSocketWriter || ws.isSSEStreamWriter)) {
      ws.send(message);
      return;
    }
    if (ws && typeof ws.send === 'function') {
      ws.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error('[Copilot CLI] failed to send message:', error?.message || error);
  }
}

/**
 * Spawns the GitHub Copilot CLI (`@github/copilot`, binary `copilot`) in
 * non-interactive mode and streams its JSONL output back to the chat.
 *
 * Flags (per the Copilot CLI programmatic reference):
 *  -p / --prompt         single-shot prompt, then exit
 *  --output-format json  emit JSONL (one event object per line)
 *  --model <id>          model selection (omitted to use the CLI default)
 *  --resume <id>         continue a previous session
 *  --allow-all           auto-approve tool use (required for headless runs)
 *
 * Auth is taken from the environment (COPILOT_GITHUB_TOKEN / GH_TOKEN /
 * GITHUB_TOKEN) or the CLI's stored login; nothing extra is injected here.
 *
 * TODO(copilot): the JSON event field names are normalized defensively in
 * CopilotSessionsProvider.normalizeMessage; tighten them once validated against
 * a pinned CLI version.
 */
async function spawnCopilot(command, options = {}, ws) {
  return new Promise((resolve, reject) => {
    const { sessionId, projectPath, cwd, model } = options;
    let capturedSessionId = sessionId;
    let sessionCreatedSent = false;
    let settled = false;

    const workingDir = cwd || projectPath || process.cwd();
    let processKey = capturedSessionId || `copilot-${Date.now()}`;

    const settleOnce = (callback) => {
      if (settled) return;
      settled = true;
      activeCopilotProcesses.delete(processKey);
      callback();
    };

    try {
      const stat = fs.statSync(workingDir);
      if (!stat.isDirectory()) {
        throw new Error('not a directory');
      }
    } catch {
      sendCopilotMessage(ws, createNormalizedMessage({
        kind: 'error',
        content: `Copilot working directory not found on disk: ${workingDir}.`,
        sessionId: capturedSessionId,
        provider: 'githubcopilot',
      }));
      sendCopilotMessage(ws, createNormalizedMessage({
        kind: 'complete',
        exitCode: 1,
        sessionId: capturedSessionId,
        provider: 'githubcopilot',
      }));
      settleOnce(() => resolve({ exitCode: 1 }));
      return;
    }

    const args = ['--output-format', 'json', '--allow-all'];

    if (model && model !== 'auto') {
      args.push('--model', model);
    }

    if (capturedSessionId) {
      args.push('--resume', capturedSessionId);
    }

    if (command && command.trim()) {
      args.push('-p', command);
    }

    const start = async () => {
      try {
        const authStatus = await providerAuthService.getProviderAuthStatus('githubcopilot');
        if (!authStatus.installed) {
          sendCopilotMessage(ws, createNormalizedMessage({
            kind: 'error',
            content: 'GitHub Copilot CLI is not installed. Run `npm install -g @github/copilot`.',
            sessionId: capturedSessionId,
            provider: 'githubcopilot',
          }));
          settleOnce(() => resolve({ exitCode: 1 }));
          return;
        }
      } catch {
        // Continue anyway — spawn will fail naturally if it isn't installed.
      }

      console.log('[Copilot CLI] spawn args:', args.join(' '), 'cwd=', workingDir);
      const copilotProcess = spawnFunction('copilot', args, {
        cwd: workingDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      });

      activeCopilotProcesses.set(processKey, copilotProcess);

      let buffer = '';
      let stderrBuffer = '';
      let producedAnyJson = false;

      const handleLine = (line) => {
        if (!line.trim()) return;
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          return; // skip non-JSON lines
        }
        producedAnyJson = true;
        const normalized = sessionsService.normalizeMessage('githubcopilot', event, capturedSessionId);
        for (const msg of normalized) {
          if (msg.kind === 'session_created' && msg.newSessionId && !capturedSessionId) {
            capturedSessionId = msg.newSessionId;
            activeCopilotProcesses.delete(processKey);
            processKey = capturedSessionId;
            activeCopilotProcesses.set(processKey, copilotProcess);
            if (!sessionCreatedSent) {
              sessionCreatedSent = true;
              sendCopilotMessage(ws, msg);
              continue;
            }
          }
          sendCopilotMessage(ws, msg);
        }
      };

      copilotProcess.stdout.on('data', (data) => {
        buffer += data.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          handleLine(line);
        }
      });

      copilotProcess.stderr.on('data', (data) => {
        const text = data.toString();
        stderrBuffer += text;
        const trimmed = text.trim();
        if (!trimmed) return;
        sendCopilotMessage(ws, createNormalizedMessage({
          kind: 'status',
          content: trimmed,
          sessionId: capturedSessionId,
          provider: 'githubcopilot',
        }));
      });

      copilotProcess.on('error', (error) => {
        const isMissing = error?.code === 'ENOENT';
        if (!isMissing) {
          console.error('[Copilot CLI] Process error:', error);
        }
        sendCopilotMessage(ws, createNormalizedMessage({
          kind: 'error',
          content: isMissing
            ? 'GitHub Copilot CLI is not installed. Run `npm install -g @github/copilot`.'
            : `Copilot process error: ${error.message}`,
          sessionId: capturedSessionId,
          provider: 'githubcopilot',
        }));
        if (isMissing) {
          settleOnce(() => resolve({ exitCode: 127 }));
        } else {
          settleOnce(() => reject(error));
        }
      });

      copilotProcess.on('close', (exitCode) => {
        if (buffer.trim()) {
          handleLine(buffer.trim());
        }

        if (!producedAnyJson) {
          const detail = stderrBuffer.trim() || `copilot exited with code ${exitCode ?? 0} and produced no output`;
          console.warn('[Copilot CLI] no JSON output. stderr:', detail.slice(0, 500));
          sendCopilotMessage(ws, createNormalizedMessage({
            kind: 'error',
            content: detail,
            sessionId: capturedSessionId,
            provider: 'githubcopilot',
          }));
        }

        sendCopilotMessage(ws, createNormalizedMessage({
          kind: 'complete',
          exitCode: exitCode ?? 0,
          sessionId: capturedSessionId,
          provider: 'githubcopilot',
        }));

        if (exitCode !== 0 && exitCode !== null) {
          notifyRunFailed({ provider: 'githubcopilot', sessionId: capturedSessionId, error: `Copilot exited with code ${exitCode}` });
        } else {
          notifyRunStopped({ provider: 'githubcopilot', sessionId: capturedSessionId });
        }

        settleOnce(() => resolve({ exitCode: exitCode ?? 0 }));
      });
    };

    start();
  });
}

function abortCopilotSession(sessionId) {
  const proc = activeCopilotProcesses.get(sessionId);
  if (!proc) {
    return false;
  }
  try {
    proc.kill('SIGTERM');
    activeCopilotProcesses.delete(sessionId);
    return true;
  } catch {
    return false;
  }
}

function isCopilotSessionActive(sessionId) {
  return activeCopilotProcesses.has(sessionId);
}

function getActiveCopilotSessions() {
  return Array.from(activeCopilotProcesses.keys());
}

export {
  spawnCopilot,
  abortCopilotSession,
  isCopilotSessionActive,
  getActiveCopilotSessions,
};
