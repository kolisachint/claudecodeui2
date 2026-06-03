import { AbstractProvider } from '@/modules/providers/shared/base/abstract.provider.js';
import { CopilotProviderAuth } from '@/modules/providers/list/copilot/copilot-auth.provider.js';
import { CopilotMcpProvider } from '@/modules/providers/list/copilot/copilot-mcp.provider.js';
import { CopilotSessionSynchronizer } from '@/modules/providers/list/copilot/copilot-session-synchronizer.provider.js';
import { CopilotSessionsProvider } from '@/modules/providers/list/copilot/copilot-sessions.provider.js';
import type { IProviderAuth, IProviderSessionSynchronizer, IProviderSessions } from '@/shared/interfaces.js';

export class CopilotProvider extends AbstractProvider {
  readonly mcp = new CopilotMcpProvider();
  readonly auth: IProviderAuth = new CopilotProviderAuth();
  readonly sessions: IProviderSessions = new CopilotSessionsProvider();
  readonly sessionSynchronizer: IProviderSessionSynchronizer = new CopilotSessionSynchronizer();

  constructor() {
    super('githubcopilot');
  }
}
