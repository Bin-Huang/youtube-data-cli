import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { uploadFileSimple } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerChannelBannerCommands(program: Command): void {
  program
    .command("channel-banners-insert")
    .description("Upload a channel banner image (OAuth required)")
    .requiredOption("--file <path>", "Path to image file (JPEG, PNG, max 6MB)")
    .option("--content-type <type>", "Image MIME type", "image/jpeg")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await uploadFileSimple({
          creds,
          endpoint: "/channelBanners/insert",
          filePath: opts.file,
          contentType: opts.contentType,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
