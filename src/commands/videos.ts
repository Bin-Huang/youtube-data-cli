import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi, uploadFile } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerVideoCommands(program: Command): void {
  program
    .command("videos <ids>")
    .description("Get video details by IDs (comma-separated)")
    .option("--part <parts>", "Parts to include", "snippet,statistics,contentDetails")
    .action(async (ids: string, opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          id: ids,
          part: opts.part,
        };
        const data = await callApi("/videos", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("videos-insert")
    .description("Upload a video (OAuth required)")
    .requiredOption("--file <path>", "Path to video file")
    .requiredOption("--title <title>", "Video title")
    .option("--description <desc>", "Video description")
    .option("--tags <tags>", "Comma-separated tags")
    .option("--category-id <id>", "Video category ID", "22")
    .option("--privacy <status>", "Privacy status (public, private, unlisted)", "private")
    .option("--content-type <type>", "Video MIME type", "video/mp4")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const snippet: Record<string, unknown> = {
          title: opts.title,
          categoryId: opts.categoryId,
        };
        if (opts.description) snippet.description = opts.description;
        if (opts.tags) snippet.tags = opts.tags.split(",").map((t: string) => t.trim());

        const data = await uploadFile({
          creds,
          endpoint: "/videos",
          params: { part: "snippet,status" },
          filePath: opts.file,
          contentType: opts.contentType,
          body: {
            snippet,
            status: { privacyStatus: opts.privacy },
          },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("videos-update")
    .description("Update video metadata (OAuth required)")
    .requiredOption("--id <id>", "Video ID")
    .requiredOption("--title <title>", "Video title")
    .requiredOption("--category-id <id>", "Video category ID (required by YouTube API when updating snippet)")
    .option("--description <desc>", "Video description")
    .option("--tags <tags>", "Comma-separated tags")
    .option("--privacy <status>", "Privacy status (public, private, unlisted)")
    .option("--default-language <lang>", "Default language (ISO 639-1)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const snippet: Record<string, unknown> = {
          title: opts.title,
          categoryId: opts.categoryId,
        };
        if (opts.description !== undefined) snippet.description = opts.description;
        if (opts.tags) snippet.tags = opts.tags.split(",").map((t: string) => t.trim());
        if (opts.defaultLanguage) snippet.defaultLanguage = opts.defaultLanguage;

        const body: Record<string, unknown> = { id: opts.id, snippet };
        const parts = ["snippet"];

        if (opts.privacy) {
          body.status = { privacyStatus: opts.privacy };
          parts.push("status");
        }

        const data = await callApi("/videos", {
          creds,
          params: { part: parts.join(",") },
          method: "PUT",
          body,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("videos-delete")
    .description("Delete a video (OAuth required)")
    .requiredOption("--id <id>", "Video ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/videos", {
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
    .command("videos-rate")
    .description("Rate a video (OAuth required)")
    .requiredOption("--id <id>", "Video ID")
    .requiredOption("--rating <rating>", "Rating: like, dislike, or none")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/videos/rate", {
          creds,
          params: { id: opts.id, rating: opts.rating },
          method: "POST",
          requireOAuth: true,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("videos-get-rating")
    .description("Get your rating on videos (OAuth required)")
    .requiredOption("--id <ids>", "Video ID(s), comma-separated")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/videos/getRating", {
          creds,
          params: { id: opts.id },
          requireOAuth: true,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("videos-report-abuse")
    .description("Report a video for abuse (OAuth required)")
    .requiredOption("--video-id <id>", "Video ID")
    .requiredOption("--reason-id <id>", "Abuse reason ID")
    .option("--secondary-reason-id <id>", "Secondary reason ID")
    .option("--comments <text>", "Additional comments")
    .option("--language <lang>", "Language the comment is written in")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const body: Record<string, unknown> = {
          videoId: opts.videoId,
          reasonId: opts.reasonId,
        };
        if (opts.secondaryReasonId) body.secondaryReasonId = opts.secondaryReasonId;
        if (opts.comments) body.comments = opts.comments;
        if (opts.language) body.language = opts.language;
        const data = await callApi("/videos/reportAbuse", {
          creds,
          method: "POST",
          body,
          requireOAuth: true,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
