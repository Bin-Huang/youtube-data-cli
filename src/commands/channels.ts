import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerChannelCommands(program: Command): void {
  program
    .command("channels [channel-id]")
    .description("Get channel details (omit ID for authenticated user's channel)")
    .option("--part <parts>", "Parts to include", "snippet,statistics,contentDetails")
    .action(async (channelId: string | undefined, opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
        };
        const requireOAuth = !channelId;
        if (channelId) {
          params.id = channelId;
        } else {
          params.mine = "true";
        }
        const data = await callApi("/channels", { creds, params, requireOAuth });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("channels-update")
    .description("Update a channel's metadata (OAuth required)")
    .requiredOption("--id <id>", "Channel ID")
    .option("--description <desc>", "Channel description")
    .option("--keywords <kw>", "Channel keywords")
    .option("--default-language <lang>", "Default language (ISO 639-1)")
    .option("--country <code>", "Channel country (ISO 3166-1 alpha-2)")
    .option("--made-for-kids <bool>", "Self-declared made for kids (true/false)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const body: Record<string, unknown> = { id: opts.id };
        const parts: string[] = [];

        const brandingChannel: Record<string, unknown> = {};
        if (opts.description !== undefined) brandingChannel.description = opts.description;
        if (opts.keywords !== undefined) brandingChannel.keywords = opts.keywords;
        if (opts.defaultLanguage) brandingChannel.defaultLanguage = opts.defaultLanguage;
        if (opts.country) brandingChannel.country = opts.country;
        if (Object.keys(brandingChannel).length > 0) {
          body.brandingSettings = { channel: brandingChannel };
          parts.push("brandingSettings");
        }

        if (opts.madeForKids !== undefined) {
          body.status = { selfDeclaredMadeForKids: opts.madeForKids === "true" };
          parts.push("status");
        }

        if (parts.length === 0) {
          fatal("At least one field to update is required.");
        }

        const data = await callApi("/channels", {
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
}
