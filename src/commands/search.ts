import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerSearchCommands(program: Command): void {
  program
    .command("search")
    .description("Search YouTube for videos, channels, and playlists")
    .requiredOption("--q <query>", "Search query")
    .option("--type <type>", "Resource type filter (video, channel, playlist)", "video,channel,playlist")
    .option("--max-results <n>", "Max results (1-50)", "5")
    .option("--order <order>", "Sort order (relevance, date, rating, title, videoCount, viewCount)", "relevance")
    .option("--channel-id <id>", "Limit results to a specific channel")
    .option("--page-token <token>", "Pagination token")
    .option("--published-after <datetime>", "Filter results published after this date (RFC 3339)")
    .option("--published-before <datetime>", "Filter results published before this date (RFC 3339)")
    .option("--region-code <code>", "ISO 3166-1 alpha-2 country code")
    .option("--relevance-language <lang>", "ISO 639-1 language code")
    .option("--safe-search <level>", "Safe search filtering (none, moderate, strict)")
    .option("--video-duration <duration>", "Video duration filter (any, short, medium, long)")
    .option("--video-definition <def>", "Video definition filter (any, high, standard)")
    .option("--video-type <type>", "Video type filter (any, episode, movie)")
    .option("--event-type <type>", "Event type filter (completed, live, upcoming)")
    .option("--topic-id <id>", "Freebase topic ID filter")
    .option("--video-category-id <id>", "Video category ID filter")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: "snippet",
          q: opts.q,
          type: opts.type,
          maxResults: opts.maxResults,
          order: opts.order,
        };
        if (opts.channelId) params.channelId = opts.channelId;
        if (opts.pageToken) params.pageToken = opts.pageToken;
        if (opts.publishedAfter) params.publishedAfter = opts.publishedAfter;
        if (opts.publishedBefore) params.publishedBefore = opts.publishedBefore;
        if (opts.regionCode) params.regionCode = opts.regionCode;
        if (opts.relevanceLanguage) params.relevanceLanguage = opts.relevanceLanguage;
        if (opts.safeSearch) params.safeSearch = opts.safeSearch;
        if (opts.videoDuration) params.videoDuration = opts.videoDuration;
        if (opts.videoDefinition) params.videoDefinition = opts.videoDefinition;
        if (opts.videoType) params.videoType = opts.videoType;
        if (opts.eventType) params.eventType = opts.eventType;
        if (opts.topicId) params.topicId = opts.topicId;
        if (opts.videoCategoryId) params.videoCategoryId = opts.videoCategoryId;
        const data = await callApi("/search", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
