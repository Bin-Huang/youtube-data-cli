import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerActivityCommands(program: Command): void {
  program
    .command("activities")
    .description("List channel activities")
    .option("--channel-id <id>", "Channel ID")
    .option("--mine", "List authenticated user's activities (OAuth required)")
    .option("--part <parts>", "Parts to include", "snippet,contentDetails")
    .option("--max-results <n>", "Max results (1-50)", "25")
    .option("--page-token <token>", "Pagination token")
    .option("--published-after <datetime>", "Filter after date (RFC 3339)")
    .option("--published-before <datetime>", "Filter before date (RFC 3339)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
          maxResults: opts.maxResults,
        };
        const requireOAuth = !!opts.mine || !opts.channelId;
        if (opts.channelId) {
          params.channelId = opts.channelId;
        } else {
          params.mine = "true";
        }
        if (opts.pageToken) params.pageToken = opts.pageToken;
        if (opts.publishedAfter) params.publishedAfter = opts.publishedAfter;
        if (opts.publishedBefore) params.publishedBefore = opts.publishedBefore;
        const data = await callApi("/activities", { creds, params, requireOAuth });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
