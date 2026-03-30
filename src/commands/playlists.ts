import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerPlaylistCommands(program: Command): void {
  program
    .command("playlists")
    .description("List playlists by ID, channel, or authenticated user")
    .option("--id <id>", "Playlist ID(s), comma-separated")
    .option("--channel-id <id>", "Channel ID to list playlists for")
    .option("--mine", "List authenticated user's playlists (OAuth required)")
    .option("--part <parts>", "Parts to include", "snippet,contentDetails")
    .option("--max-results <n>", "Max results (1-50)", "25")
    .option("--page-token <token>", "Pagination token")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
          maxResults: opts.maxResults,
        };
        const requireOAuth = !!opts.mine;
        if (opts.id) {
          params.id = opts.id;
        } else if (opts.channelId) {
          params.channelId = opts.channelId;
        } else {
          params.mine = "true";
        }
        if (opts.pageToken) params.pageToken = opts.pageToken;
        const data = await callApi("/playlists", { creds, params, requireOAuth });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("playlists-insert")
    .description("Create a new playlist (OAuth required)")
    .requiredOption("--title <title>", "Playlist title")
    .option("--description <desc>", "Playlist description")
    .option("--privacy <status>", "Privacy status (public, private, unlisted)", "private")
    .option("--default-language <lang>", "Default language (ISO 639-1)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const body: Record<string, unknown> = {
          snippet: {
            title: opts.title,
            ...(opts.description && { description: opts.description }),
            ...(opts.defaultLanguage && { defaultLanguage: opts.defaultLanguage }),
          },
          status: {
            privacyStatus: opts.privacy,
          },
        };
        const data = await callApi("/playlists", {
          creds,
          params: { part: "snippet,status" },
          method: "POST",
          body,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("playlists-update")
    .description("Update a playlist (OAuth required)")
    .requiredOption("--id <id>", "Playlist ID")
    .requiredOption("--title <title>", "Playlist title")
    .option("--description <desc>", "Playlist description")
    .option("--privacy <status>", "Privacy status (public, private, unlisted)")
    .option("--default-language <lang>", "Default language (ISO 639-1)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const body: Record<string, unknown> = {
          id: opts.id,
          snippet: {
            title: opts.title,
            ...(opts.description && { description: opts.description }),
            ...(opts.defaultLanguage && { defaultLanguage: opts.defaultLanguage }),
          },
        };
        const parts = ["snippet"];
        if (opts.privacy) {
          body.status = { privacyStatus: opts.privacy };
          parts.push("status");
        }
        const data = await callApi("/playlists", {
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
    .command("playlists-delete")
    .description("Delete a playlist (OAuth required)")
    .requiredOption("--id <id>", "Playlist ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/playlists", {
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
