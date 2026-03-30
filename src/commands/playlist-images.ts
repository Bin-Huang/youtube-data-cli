import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi, uploadFile } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerPlaylistImageCommands(program: Command): void {
  program
    .command("playlist-images")
    .description("List playlist images")
    .requiredOption("--parent <id>", "Playlist ID")
    .option("--max-results <n>", "Max results", "25")
    .option("--page-token <token>", "Pagination token")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: "snippet",
          parent: opts.parent,
          maxResults: opts.maxResults,
        };
        if (opts.pageToken) params.pageToken = opts.pageToken;
        const data = await callApi("/playlistImages", { creds, params, requireOAuth: true });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("playlist-images-insert")
    .description("Upload a playlist image (OAuth required)")
    .requiredOption("--playlist-id <id>", "Playlist ID")
    .requiredOption("--file <path>", "Path to image file")
    .option("--content-type <type>", "Image MIME type", "image/jpeg")
    .option("--type <type>", "Image type", "hero")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await uploadFile({
          creds,
          endpoint: "/playlistImages",
          params: { part: "snippet" },
          filePath: opts.file,
          contentType: opts.contentType,
          body: {
            snippet: {
              playlistId: opts.playlistId,
              type: opts.type,
            },
          },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("playlist-images-update")
    .description("Update a playlist image (OAuth required)")
    .requiredOption("--id <id>", "Playlist image ID")
    .requiredOption("--playlist-id <id>", "Playlist ID")
    .requiredOption("--file <path>", "Path to image file")
    .option("--content-type <type>", "Image MIME type", "image/jpeg")
    .option("--type <type>", "Image type", "hero")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await uploadFile({
          creds,
          endpoint: "/playlistImages",
          params: { part: "snippet" },
          method: "PUT",
          filePath: opts.file,
          contentType: opts.contentType,
          body: {
            id: opts.id,
            snippet: {
              playlistId: opts.playlistId,
              type: opts.type,
            },
          },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("playlist-images-delete")
    .description("Delete a playlist image (OAuth required)")
    .requiredOption("--id <id>", "Playlist image ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/playlistImages", {
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
