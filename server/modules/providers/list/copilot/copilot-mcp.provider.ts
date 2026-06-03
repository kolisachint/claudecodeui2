import os from 'node:os';
import path from 'node:path';

import { McpProvider } from '@/modules/providers/shared/mcp/mcp.provider.js';
import type { McpScope, ProviderMcpServer, UpsertProviderMcpServerInput } from '@/shared/types.js';
import {
  AppError,
  readJsonConfig,
  readObjectRecord,
  readOptionalString,
  readStringArray,
  readStringRecord,
  writeJsonConfig,
} from '@/shared/utils.js';

/**
 * GitHub Copilot CLI reads MCP servers from a JSON config under its home dir,
 * keyed by `mcpServers` (the same shape Claude/Cursor use): each entry is
 * either a stdio server (`command` + `args`) or an http server (`url`).
 *
 * Phase 1: user scope only (`~/.copilot/mcp-config.json`). Workspace `.mcp.json`
 * overrides exist but the stable on-disk location is still settling, so revisit
 * once confirmed against a pinned CLI version.
 */
export class CopilotMcpProvider extends McpProvider {
  constructor() {
    super('githubcopilot', ['user'], ['stdio', 'http']);
  }

  private configPath(): string {
    return path.join(os.homedir(), '.copilot', 'mcp-config.json');
  }

  protected async readScopedServers(_scope: McpScope, _workspacePath: string): Promise<Record<string, unknown>> {
    const config = await readJsonConfig(this.configPath());
    return readObjectRecord(config.mcpServers) ?? {};
  }

  protected async writeScopedServers(
    _scope: McpScope,
    _workspacePath: string,
    servers: Record<string, unknown>,
  ): Promise<void> {
    const filePath = this.configPath();
    const config = await readJsonConfig(filePath);
    config.mcpServers = servers;
    await writeJsonConfig(filePath, config);
  }

  protected buildServerConfig(input: UpsertProviderMcpServerInput): Record<string, unknown> {
    if (input.transport === 'stdio') {
      if (!input.command?.trim()) {
        throw new AppError('command is required for stdio MCP servers.', {
          code: 'MCP_COMMAND_REQUIRED',
          statusCode: 400,
        });
      }

      return {
        type: 'local',
        command: input.command,
        args: input.args ?? [],
        env: input.env ?? {},
      };
    }

    if (!input.url?.trim()) {
      throw new AppError('url is required for http MCP servers.', {
        code: 'MCP_URL_REQUIRED',
        statusCode: 400,
      });
    }

    return {
      type: 'http',
      url: input.url,
      headers: input.headers ?? {},
    };
  }

  protected normalizeServerConfig(
    scope: McpScope,
    name: string,
    rawConfig: unknown,
  ): ProviderMcpServer | null {
    const config = readObjectRecord(rawConfig);
    if (!config) {
      return null;
    }

    const type = readOptionalString(config.type);

    if (type === 'http' || typeof config.url === 'string') {
      return {
        provider: 'githubcopilot',
        name,
        scope,
        transport: 'http',
        url: readOptionalString(config.url) ?? '',
        headers: readStringRecord(config.headers),
      };
    }

    return {
      provider: 'githubcopilot',
      name,
      scope,
      transport: 'stdio',
      command: readOptionalString(config.command) ?? '',
      args: readStringArray(config.args),
      env: readStringRecord(config.env),
    };
  }
}
