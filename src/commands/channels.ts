import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerChannelCommands(program: Command): void {
  program
    .command("channels [channel-id]")
    .description("Get channel details (omit ID for authenticated user's channel)")
    .option("--part <parts>", "Parts to include", "snippet,statistics,contentDetails")
    .action(async (channelId: string | undefined, opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
        };
        const requireOAuth = !channelId;
        if (channelId) {
          params.id = channelId;
        } else {
          params.mine = "true";
        }
        const data = await callApi("/channels", { creds, params, requireOAuth });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
