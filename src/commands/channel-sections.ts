import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerChannelSectionCommands(program: Command): void {
  program
    .command("channel-sections")
    .description("List channel sections")
    .option("--channel-id <id>", "Channel ID")
    .option("--id <id>", "Section ID(s), comma-separated")
    .option("--mine", "List authenticated user's sections (OAuth required)")
    .option("--part <parts>", "Parts to include", "snippet,contentDetails")
    .option("--hl <lang>", "Language for localized text (ISO 639-1)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
        };
        const requireOAuth = !!opts.mine;
        if (opts.id) {
          params.id = opts.id;
        } else if (opts.channelId) {
          params.channelId = opts.channelId;
        } else {
          params.mine = "true";
        }
        if (opts.hl) params.hl = opts.hl;
        const data = await callApi("/channelSections", { creds, params, requireOAuth });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("channel-sections-insert")
    .description("Add a channel section (OAuth required)")
    .requiredOption("--type <type>", "Section type (singlePlaylist, multiplePlaylists, allPlaylists, recentActivity, etc.)")
    .option("--title <title>", "Section title")
    .option("--position <n>", "Section position (0-based)")
    .option("--playlist-ids <ids>", "Playlist ID(s), comma-separated")
    .option("--channel-ids <ids>", "Channel ID(s), comma-separated")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const snippet: Record<string, unknown> = {
          type: opts.type,
        };
        if (opts.title) snippet.title = opts.title;
        if (opts.position !== undefined) snippet.position = parseInt(opts.position, 10);

        const body: Record<string, unknown> = { snippet };
        const parts = ["snippet"];

        if (opts.playlistIds || opts.channelIds) {
          const contentDetails: Record<string, unknown> = {};
          if (opts.playlistIds) contentDetails.playlists = opts.playlistIds.split(",");
          if (opts.channelIds) contentDetails.channels = opts.channelIds.split(",");
          body.contentDetails = contentDetails;
          parts.push("contentDetails");
        }

        const data = await callApi("/channelSections", {
          creds,
          params: { part: parts.join(",") },
          method: "POST",
          body,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("channel-sections-update")
    .description("Update a channel section (OAuth required)")
    .requiredOption("--id <id>", "Section ID")
    .requiredOption("--type <type>", "Section type")
    .option("--title <title>", "Section title")
    .option("--position <n>", "Section position (0-based)")
    .option("--playlist-ids <ids>", "Playlist ID(s), comma-separated")
    .option("--channel-ids <ids>", "Channel ID(s), comma-separated")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const snippet: Record<string, unknown> = {
          type: opts.type,
        };
        if (opts.title) snippet.title = opts.title;
        if (opts.position !== undefined) snippet.position = parseInt(opts.position, 10);

        const body: Record<string, unknown> = { id: opts.id, snippet };
        const parts = ["snippet"];

        if (opts.playlistIds || opts.channelIds) {
          const contentDetails: Record<string, unknown> = {};
          if (opts.playlistIds) contentDetails.playlists = opts.playlistIds.split(",");
          if (opts.channelIds) contentDetails.channels = opts.channelIds.split(",");
          body.contentDetails = contentDetails;
          parts.push("contentDetails");
        }

        const data = await callApi("/channelSections", {
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
    .command("channel-sections-delete")
    .description("Delete a channel section (OAuth required)")
    .requiredOption("--id <id>", "Section ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/channelSections", {
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
