import spawn from 'cross-spawn';

import type { IProviderAuth } from '@/shared/interfaces.js';
import type { ProviderAuthStatus } from '@/shared/types.js';

/**
 * Token env vars the GitHub Copilot CLI checks, in the documented precedence
 * order. Any one of these (or a keychain/`gh auth` login) authenticates the CLI;
 * we treat presence of a token as "authenticated" since that is what enables
 * non-interactive (`-p`) runs in headless/server contexts.
 */
const COPILOT_TOKEN_ENV_VARS = ['COPILOT_GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_TOKEN'] as const;

export class CopilotProviderAuth implements IProviderAuth {
  /**
   * Checks whether the `copilot` CLI (npm `@github/copilot`) is on PATH.
   */
  private checkInstalled(): boolean {
    try {
      const result = spawn.sync('copilot', ['--version'], { stdio: 'ignore', timeout: 5000 });
      return result.status === 0;
    } catch {
      return false;
    }
  }

  private resolveTokenEnvVar(): string | null {
    for (const name of COPILOT_TOKEN_ENV_VARS) {
      if (process.env[name]?.trim()) {
        return name;
      }
    }
    return null;
  }

  /**
   * Returns Copilot CLI installation and credential status.
   *
   * Note: we can only detect token-based auth here without prompting. An
   * interactive `/login` (OAuth token in the system keychain) or a `gh auth`
   * fallback will still let the CLI run; in that case this reports
   * authenticated=false but the spawn will succeed. Token env is the reliable
   * signal for headless servers, which is the common deployment for this UI.
   */
  async getStatus(): Promise<ProviderAuthStatus> {
    const installed = this.checkInstalled();

    if (!installed) {
      return {
        installed,
        provider: 'githubcopilot',
        authenticated: false,
        email: null,
        method: null,
        error: 'GitHub Copilot CLI is not installed. Run `npm install -g @github/copilot`.',
      };
    }

    const tokenEnvVar = this.resolveTokenEnvVar();
    if (tokenEnvVar) {
      return {
        installed,
        provider: 'githubcopilot',
        authenticated: true,
        email: `Token via ${tokenEnvVar}`,
        method: 'token',
      };
    }

    return {
      installed,
      provider: 'githubcopilot',
      authenticated: false,
      email: null,
      method: null,
      error: 'No GitHub token found. Set GITHUB_TOKEN/GH_TOKEN/COPILOT_GITHUB_TOKEN, or run `copilot` and use /login.',
    };
  }
}
