import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerSubscriptionCommands(program: Command): void {
  program
    .command("subscriptions")
    .description("List subscriptions (OAuth required)")
    .option("--channel-id <id>", "List subscriptions for a channel")
    .option("--id <id>", "Subscription ID(s), comma-separated")
    .option("--mine", "List authenticated user's subscriptions")
    .option("--part <parts>", "Parts to include", "snippet,contentDetails")
    .option("--max-results <n>", "Max results (1-50)", "25")
    .option("--page-token <token>", "Pagination token")
    .option("--order <order>", "Sort order (alphabetical, relevance, unread)")
    .option("--for-channel-id <id>", "Filter by subscribed channel ID(s)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
          maxResults: opts.maxResults,
        };
        const requireOAuth = !!opts.mine || (!opts.channelId && !opts.id);
        if (opts.id) {
          params.id = opts.id;
        } else if (opts.channelId) {
          params.channelId = opts.channelId;
        } else {
          params.mine = "true";
        }
        if (opts.pageToken) params.pageToken = opts.pageToken;
        if (opts.order) params.order = opts.order;
        if (opts.forChannelId) params.forChannelId = opts.forChannelId;
        const data = await callApi("/subscriptions", { creds, params, requireOAuth });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("subscriptions-insert")
    .description("Subscribe to a channel (OAuth required)")
    .requiredOption("--channel-id <id>", "Channel ID to subscribe to")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/subscriptions", {
          creds,
          params: { part: "snippet" },
          method: "POST",
          body: {
            snippet: {
              resourceId: {
                kind: "youtube#channel",
                channelId: opts.channelId,
              },
            },
          },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("subscriptions-delete")
    .description("Unsubscribe (OAuth required)")
    .requiredOption("--id <id>", "Subscription ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/subscriptions", {
          creds,
          params: { id: opts.id },
          method: "DELETE",
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
