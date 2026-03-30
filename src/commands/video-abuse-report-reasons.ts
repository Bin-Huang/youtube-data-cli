import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerVideoAbuseReportReasonCommands(program: Command): void {
  program
    .command("video-abuse-report-reasons")
    .description("List video abuse report reasons")
    .option("--hl <lang>", "Language for localized text (ISO 639-1)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = { part: "snippet" };
        if (opts.hl) params.hl = opts.hl;
        const data = await callApi("/videoAbuseReportReasons", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
