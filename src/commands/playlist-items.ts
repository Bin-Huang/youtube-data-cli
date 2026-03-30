import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerPlaylistItemCommands(program: Command): void {
  program
    .command("playlist-items")
    .description("List items in a playlist")
    .requiredOption("--playlist-id <id>", "Playlist ID")
    .option("--part <parts>", "Parts to include", "snippet,contentDetails")
    .option("--max-results <n>", "Max results (1-50)", "25")
    .option("--page-token <token>", "Pagination token")
    .option("--video-id <id>", "Filter by specific video ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
          playlistId: opts.playlistId,
          maxResults: opts.maxResults,
        };
        if (opts.pageToken) params.pageToken = opts.pageToken;
        if (opts.videoId) params.videoId = opts.videoId;
        const data = await callApi("/playlistItems", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("playlist-items-insert")
    .description("Add a video to a playlist (OAuth required)")
    .requiredOption("--playlist-id <id>", "Playlist ID")
    .requiredOption("--video-id <id>", "Video ID to add")
    .option("--position <n>", "Position in the playlist (0-based)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const snippet: Record<string, unknown> = {
          playlistId: opts.playlistId,
          resourceId: {
            kind: "youtube#video",
            videoId: opts.videoId,
          },
        };
        if (opts.position !== undefined) {
          snippet.position = parseInt(opts.position, 10);
        }
        const data = await callApi("/playlistItems", {
          creds,
          params: { part: "snippet" },
          method: "POST",
          body: { snippet },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("playlist-items-update")
    .description("Update a playlist item (OAuth required)")
    .requiredOption("--id <id>", "Playlist item ID")
    .requiredOption("--playlist-id <id>", "Playlist ID")
    .requiredOption("--video-id <id>", "Video ID")
    .option("--position <n>", "New position in the playlist (0-based)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const snippet: Record<string, unknown> = {
          playlistId: opts.playlistId,
          resourceId: {
            kind: "youtube#video",
            videoId: opts.videoId,
          },
        };
        if (opts.position !== undefined) {
          snippet.position = parseInt(opts.position, 10);
        }
        const data = await callApi("/playlistItems", {
          creds,
          params: { part: "snippet" },
          method: "PUT",
          body: { id: opts.id, snippet },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("playlist-items-delete")
    .description("Remove an item from a playlist (OAuth required)")
    .requiredOption("--id <id>", "Playlist item ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/playlistItems", {
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
