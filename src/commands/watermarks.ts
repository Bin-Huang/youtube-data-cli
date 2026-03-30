import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi, uploadFile } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerWatermarkCommands(program: Command): void {
  program
    .command("watermarks-set")
    .description("Upload a channel watermark image (OAuth required)")
    .requiredOption("--channel-id <id>", "Channel ID")
    .requiredOption("--file <path>", "Path to image file (PNG, JPEG)")
    .option("--content-type <type>", "Image MIME type", "image/png")
    .option("--timing-type <type>", "Timing type (offsetFromStart, offsetFromEnd)", "offsetFromEnd")
    .option("--offset-ms <ms>", "Offset in milliseconds", "0")
    .option("--duration-ms <ms>", "Duration in milliseconds")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const timing: Record<string, unknown> = {
          type: opts.timingType,
          offsetMs: opts.offsetMs,
        };
        if (opts.durationMs) timing.durationMs = opts.durationMs;

        const data = await uploadFile({
          creds,
          endpoint: "/watermarks/set",
          params: { channelId: opts.channelId },
          filePath: opts.file,
          contentType: opts.contentType,
          body: { timing },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("watermarks-unset")
    .description("Remove a channel watermark (OAuth required)")
    .requiredOption("--channel-id <id>", "Channel ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/watermarks/unset", {
          creds,
          params: { channelId: opts.channelId },
          method: "POST",
          requireOAuth: true,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
