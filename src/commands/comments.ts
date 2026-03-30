import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerCommentCommands(program: Command): void {
  program
    .command("comments")
    .description("List replies to a comment thread")
    .requiredOption("--parent-id <id>", "Parent comment ID to list replies for")
    .option("--part <parts>", "Parts to include", "snippet")
    .option("--max-results <n>", "Max results (1-100)", "20")
    .option("--page-token <token>", "Pagination token")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
          parentId: opts.parentId,
          maxResults: opts.maxResults,
        };
        if (opts.pageToken) params.pageToken = opts.pageToken;
        const data = await callApi("/comments", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("comments-insert")
    .description("Reply to a comment (OAuth required)")
    .requiredOption("--parent-id <id>", "Parent comment ID to reply to")
    .requiredOption("--text <text>", "Reply text")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/comments", {
          creds,
          params: { part: "snippet" },
          method: "POST",
          body: {
            snippet: {
              parentId: opts.parentId,
              textOriginal: opts.text,
            },
          },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("comments-update")
    .description("Update a comment (OAuth required)")
    .requiredOption("--id <id>", "Comment ID")
    .requiredOption("--text <text>", "Updated comment text")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/comments", {
          creds,
          params: { part: "snippet" },
          method: "PUT",
          body: {
            id: opts.id,
            snippet: {
              textOriginal: opts.text,
            },
          },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("comments-delete")
    .description("Delete a comment (OAuth required)")
    .requiredOption("--id <id>", "Comment ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/comments", {
          creds,
          params: { id: opts.id },
          method: "DELETE",
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("comments-set-moderation-status")
    .description("Set moderation status of comments (OAuth required)")
    .requiredOption("--id <ids>", "Comment ID(s), comma-separated")
    .requiredOption("--moderation-status <status>", "Status: published, heldForReview, rejected")
    .option("--ban-author", "Ban the comment author from making future comments")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          id: opts.id,
          moderationStatus: opts.moderationStatus,
        };
        if (opts.banAuthor) params.banAuthor = "true";
        const data = await callApi("/comments/setModerationStatus", {
          creds,
          params,
          method: "POST",
          requireOAuth: true,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
