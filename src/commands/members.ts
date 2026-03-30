import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerMemberCommands(program: Command): void {
  program
    .command("members")
    .description("List channel members (OAuth required)")
    .option("--mode <mode>", "Filter mode (listMembers, updates)", "listMembers")
    .option("--max-results <n>", "Max results (1-1000)", "25")
    .option("--page-token <token>", "Pagination token")
    .option("--has-access-to-level <id>", "Filter by membership level ID")
    .option("--filter-by-member-channel-id <ids>", "Filter by member channel ID(s)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: "snippet",
          mode: opts.mode,
          maxResults: opts.maxResults,
        };
        if (opts.pageToken) params.pageToken = opts.pageToken;
        if (opts.hasAccessToLevel) params.hasAccessToLevel = opts.hasAccessToLevel;
        if (opts.filterByMemberChannelId) params.filterByMemberChannelId = opts.filterByMemberChannelId;
        const data = await callApi("/members", { creds, params, requireOAuth: true });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("memberships-levels")
    .description("List channel membership levels (OAuth required)")
    .action(async () => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/membershipsLevels", {
          creds,
          params: { part: "snippet,id" },
          requireOAuth: true,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
