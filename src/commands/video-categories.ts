import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerVideoCategoryCommands(program: Command): void {
  program
    .command("video-categories")
    .description("List video categories")
    .option("--region-code <code>", "ISO 3166-1 alpha-2 country code", "US")
    .option("--id <id>", "Category ID(s), comma-separated")
    .option("--hl <lang>", "Language for localized text (ISO 639-1)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: "snippet",
        };
        if (opts.id) {
          params.id = opts.id;
        } else {
          params.regionCode = opts.regionCode;
        }
        if (opts.hl) params.hl = opts.hl;
        const data = await callApi("/videoCategories", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
