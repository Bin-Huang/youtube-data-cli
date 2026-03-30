import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerI18nCommands(program: Command): void {
  program
    .command("i18n-languages")
    .description("List supported languages")
    .option("--hl <lang>", "Language for localized text (ISO 639-1)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = { part: "snippet" };
        if (opts.hl) params.hl = opts.hl;
        const data = await callApi("/i18nLanguages", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("i18n-regions")
    .description("List supported regions")
    .option("--hl <lang>", "Language for localized text (ISO 639-1)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = { part: "snippet" };
        if (opts.hl) params.hl = opts.hl;
        const data = await callApi("/i18nRegions", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
