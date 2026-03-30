import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
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
}
