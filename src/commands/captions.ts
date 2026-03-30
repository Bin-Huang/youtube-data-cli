import { writeFileSync } from "fs";
import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi, uploadFile } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerCaptionCommands(program: Command): void {
  program
    .command("captions")
    .description("List caption tracks for a video")
    .requiredOption("--video-id <id>", "Video ID")
    .option("--id <id>", "Caption track ID(s), comma-separated")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: "snippet",
          videoId: opts.videoId,
        };
        if (opts.id) params.id = opts.id;
        const data = await callApi("/captions", { creds, params, requireOAuth: true });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("captions-insert")
    .description("Upload a caption track (OAuth required)")
    .requiredOption("--video-id <id>", "Video ID")
    .requiredOption("--file <path>", "Path to caption file (SRT, VTT, etc.)")
    .requiredOption("--language <lang>", "Caption language (BCP-47)")
    .requiredOption("--name <name>", "Caption track name")
    .option("--content-type <type>", "Caption file MIME type", "application/octet-stream")
    .option("--is-draft", "Mark as draft")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const snippet: Record<string, unknown> = {
          videoId: opts.videoId,
          language: opts.language,
          name: opts.name,
        };
        if (opts.isDraft) snippet.isDraft = true;

        const data = await uploadFile({
          creds,
          endpoint: "/captions",
          params: { part: "snippet" },
          filePath: opts.file,
          contentType: opts.contentType,
          body: { snippet },
        });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("captions-update")
    .description("Update a caption track (OAuth required)")
    .requiredOption("--id <id>", "Caption track ID")
    .option("--file <path>", "Path to new caption file")
    .option("--content-type <type>", "Caption file MIME type", "application/octet-stream")
    .option("--is-draft <bool>", "Mark as draft (true/false)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const body: Record<string, unknown> = { id: opts.id };
        if (opts.isDraft !== undefined) {
          body.snippet = { isDraft: opts.isDraft === "true" };
        }

        if (opts.file) {
          const data = await uploadFile({
            creds,
            endpoint: "/captions",
            params: { part: "snippet" },
            method: "PUT",
            filePath: opts.file,
            contentType: opts.contentType,
            body,
          });
          output(data, program.opts().format);
        } else {
          const data = await callApi("/captions", {
            creds,
            params: { part: "snippet" },
            method: "PUT",
            body,
          });
          output(data, program.opts().format);
        }
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("captions-download")
    .description("Download a caption track (OAuth required)")
    .requiredOption("--id <id>", "Caption track ID")
    .option("--tfmt <format>", "Caption format (sbv, scc, srt, ttml, vtt)")
    .option("--tlang <lang>", "Translation language (BCP-47)")
    .option("--output <path>", "Output file path (default: stdout)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {};
        if (opts.tfmt) params.tfmt = opts.tfmt;
        if (opts.tlang) params.tlang = opts.tlang;
        const res = await callApi(`/captions/${opts.id}`, {
          creds,
          params,
          requireOAuth: true,
          rawResponse: true,
        }) as Response;
        const text = await res.text();
        if (opts.output) {
          writeFileSync(opts.output, text);
          output({ downloaded: opts.output }, program.opts().format);
        } else {
          process.stdout.write(text);
        }
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("captions-delete")
    .description("Delete a caption track (OAuth required)")
    .requiredOption("--id <id>", "Caption track ID")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const data = await callApi("/captions", {
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
