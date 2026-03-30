#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };
import { registerSearchCommands } from "./commands/search.js";
import { registerChannelCommands } from "./commands/channels.js";
import { registerVideoCommands } from "./commands/videos.js";
import { registerPlaylistCommands } from "./commands/playlists.js";
import { registerPlaylistItemCommands } from "./commands/playlist-items.js";
import { registerCommentThreadCommands } from "./commands/comment-threads.js";
import { registerCommentCommands } from "./commands/comments.js";
import { registerSubscriptionCommands } from "./commands/subscriptions.js";

const program = new Command();

program
  .name("youtube-data-cli")
  .description("YouTube Data API CLI for AI agents")
  .version(version)
  .option("--format <format>", "Output format", "json")
  .option("--credentials <path>", "Path to credentials JSON file")
  .addHelpText(
    "after",
    "\nDocs: https://github.com/Bin-Huang/youtube-data-cli"
  );

program.configureOutput({
  writeErr: (str: string) => {
    const msg = str.replace(/^error: /i, "").trim();
    if (msg) process.stderr.write(JSON.stringify({ error: msg }) + "\n");
  },
  writeOut: (str: string) => {
    process.stdout.write(str);
  },
});

program.showHelpAfterError(false);

program.hook("preAction", () => {
  const format = program.opts().format;
  if (format !== "json" && format !== "compact") {
    process.stderr.write(
      JSON.stringify({ error: "Format must be 'json' or 'compact'." }) + "\n"
    );
    process.exit(1);
  }
});

registerSearchCommands(program);
registerChannelCommands(program);
registerVideoCommands(program);
registerPlaylistCommands(program);
registerPlaylistItemCommands(program);
registerCommentThreadCommands(program);
registerCommentCommands(program);
registerSubscriptionCommands(program);

program.on("command:*", (operands) => {
  process.stderr.write(
    JSON.stringify({ error: `Unknown command: ${operands[0]}. Run --help for available commands.` }) + "\n"
  );
  process.exit(1);
});
if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
