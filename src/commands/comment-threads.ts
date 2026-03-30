import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerCommentThreadCommands(program: Command): void {
  program
    .command("comment-threads")
    .description("List comment threads for a video, channel, or by ID")
    .option("--video-id <id>", "Video ID to list comments for")
    .option("--channel-id <id>", "Channel ID to list comments for")
    .option("--id <id>", "Comment thread ID(s), comma-separated")
    .option("--part <parts>", "Parts to include", "snippet,replies")
    .option("--max-results <n>", "Max results (1-100)", "20")
    .option("--page-token <token>", "Pagination token")
    .option("--order <order>", "Sort order (time, relevance)", "relevance")
    .option("--search-terms <q>", "Filter by search terms")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
          maxResults: opts.maxResults,
          order: opts.order,
        };
        if (opts.videoId) params.videoId = opts.videoId;
        else if (opts.channelId) params.channelId = opts.channelId;
        else if (opts.id) params.id = opts.id;
        else {
          fatal("One of --video-id, --channel-id, or --id is required.");
        }
        if (opts.pageToken) params.pageToken = opts.pageToken;
        if (opts.searchTerms) params.searchTerms = opts.searchTerms;
        const data = await callApi("/commentThreads", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("comment-threads-insert")
    .description("Post a top-level comment on a video (OAuth required)")
    .requiredOption("--video-id <id>", "Video ID to comment on")
    .requiredOption("--text <text>", "Comment text")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/commentThreads", {
          creds,
          params: { part: "snippet" },
          method: "POST",
          body: {
            snippet: {
              videoId: opts.videoId,
              topLevelComment: {
                snippet: {
                  textOriginal: opts.text,
                },
              },
            },
          },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
