import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { uploadFileSimple } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerThumbnailCommands(program: Command): void {
  program
    .command("thumbnails-set")
    .description("Upload a custom thumbnail for a video (OAuth required)")
    .requiredOption("--video-id <id>", "Video ID")
    .requiredOption("--file <path>", "Path to image file (JPEG, PNG, GIF, BMP, WebP)")
    .option("--content-type <type>", "Image MIME type", "image/jpeg")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await uploadFileSimple({
          creds,
          endpoint: "/thumbnails/set",
          params: { videoId: opts.videoId },
          filePath: opts.file,
          contentType: opts.contentType,
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
