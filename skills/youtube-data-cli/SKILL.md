---
name: youtube-data-cli
description: >
  YouTube Data API v3 CLI for searching videos, managing playlists, reading and posting comments,
  and handling subscriptions. Use when the user wants to search YouTube, manage playlists,
  read or post comments, or manage subscriptions.
  Triggers: "YouTube", "YouTube search", "YouTube playlists", "YouTube comments",
  "YouTube subscriptions", "search videos", "playlist management", "video comments".
---

# YouTube Data CLI Skill

You have access to `youtube-data-cli`, a CLI for the YouTube Data API v3. Use it to search YouTube, get channel/video details, manage playlists and playlist items, read/post comments, and manage subscriptions.

## Quick start

```bash
# Check if the CLI is available
youtube-data-cli --help

# Search for videos
youtube-data-cli search --q "node.js tutorial" --type video --max-results 5

# Get a channel's public data
youtube-data-cli channels UCxxxxxxxxxxxxxx
```

If the CLI is not installed, install it:

```bash
npm install -g youtube-data-cli
```

## Authentication

| Method | Use case | Commands |
|--------|----------|----------|
| **API key** | Public data (search, channels, videos, playlists, comments) | Read-only commands |
| **OAuth 2.0** | Private data + write operations | All `*-insert`, `*-update`, `*-delete` commands, `--mine` queries |

Credentials are resolved in this order:

1. `--credentials <path>` flag (per-command)
2. `YOUTUBE_API_KEY`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` env vars
3. `~/.config/youtube-data-cli/credentials.json` (auto-detected)

**Important:** Service accounts do NOT work with YouTube APIs. You must use OAuth 2.0 with a refresh token.

## Output format

All commands output pretty-printed JSON by default. Use `--format compact` for single-line JSON.

Global options:
- `--format <format>` -- `json` (default, pretty-printed) or `compact` (single-line)
- `--credentials <path>` -- path to credentials JSON file

Errors are written to stderr as JSON with an `error` field and a non-zero exit code.

## Commands reference

### search

Search YouTube for videos, channels, and playlists.

```bash
youtube-data-cli search --q "query" [--type video] [--max-results 10] [--order viewCount]
```

Key options: `--q` (required), `--type`, `--max-results`, `--order`, `--channel-id`, `--page-token`, `--published-after`, `--published-before`, `--region-code`, `--relevance-language`, `--safe-search`, `--video-duration`, `--event-type`

### channels

Get channel details. Omit ID for the authenticated user's channel (OAuth required).

```bash
youtube-data-cli channels UCxxxxxxxxxxxxxx
youtube-data-cli channels                    # your own channel (OAuth)
youtube-data-cli channels UCxxxxxxxxxxxxxx --part snippet,statistics,brandingSettings
```

### videos

Get video details by IDs (comma-separated).

```bash
youtube-data-cli videos dQw4w9WgXcQ
youtube-data-cli videos dQw4w9WgXcQ,jNQXAC9IVRw
```

### playlists / playlists-insert / playlists-update / playlists-delete

Manage playlists.

```bash
# List playlists
youtube-data-cli playlists --channel-id UCxxxxxxxxxxxxxx
youtube-data-cli playlists --mine

# Create a playlist (OAuth)
youtube-data-cli playlists-insert --title "My Playlist" --privacy public

# Update a playlist (OAuth)
youtube-data-cli playlists-update --id PLxxxxxxxxxxxxxx --title "New Title"

# Delete a playlist (OAuth)
youtube-data-cli playlists-delete --id PLxxxxxxxxxxxxxx
```

### playlist-items / playlist-items-insert / playlist-items-update / playlist-items-delete

Manage videos in playlists.

```bash
# List items
youtube-data-cli playlist-items --playlist-id PLxxxxxxxxxxxxxx

# Add a video (OAuth)
youtube-data-cli playlist-items-insert --playlist-id PLxxxxxxxxxxxxxx --video-id dQw4w9WgXcQ

# Reorder a video (OAuth)
youtube-data-cli playlist-items-update --id ITEM_ID --playlist-id PLxxxxxxxxxxxxxx --video-id dQw4w9WgXcQ --position 0

# Remove a video (OAuth)
youtube-data-cli playlist-items-delete --id ITEM_ID
```

### comment-threads / comment-threads-insert

List and post top-level comments.

```bash
# List comments on a video
youtube-data-cli comment-threads --video-id dQw4w9WgXcQ

# Post a comment (OAuth)
youtube-data-cli comment-threads-insert --video-id dQw4w9WgXcQ --text "Great video!"
```

Key options for listing: `--video-id`, `--channel-id`, `--id`, `--order`, `--search-terms`, `--max-results`, `--page-token`

### comments / comments-insert / comments-update / comments-delete

Manage comment replies.

```bash
# List replies
youtube-data-cli comments --parent-id COMMENT_ID

# Reply (OAuth)
youtube-data-cli comments-insert --parent-id COMMENT_ID --text "Thanks!"

# Update (OAuth)
youtube-data-cli comments-update --id COMMENT_ID --text "Updated text"

# Delete (OAuth)
youtube-data-cli comments-delete --id COMMENT_ID
```

### subscriptions / subscriptions-insert / subscriptions-delete

Manage subscriptions.

```bash
# List your subscriptions (OAuth)
youtube-data-cli subscriptions --mine

# Subscribe (OAuth)
youtube-data-cli subscriptions-insert --channel-id UCxxxxxxxxxxxxxx

# Unsubscribe (OAuth)
youtube-data-cli subscriptions-delete --id SUBSCRIPTION_ID
```

## Workflow guidance

### Discover content

1. Search for videos: `youtube-data-cli search --q "topic" --type video --max-results 10`
2. Get video details: `youtube-data-cli videos VIDEO_ID`
3. Read comments: `youtube-data-cli comment-threads --video-id VIDEO_ID`

### Manage playlists

1. List your playlists: `youtube-data-cli playlists --mine`
2. Create a new one: `youtube-data-cli playlists-insert --title "Favorites" --privacy private`
3. Add videos: `youtube-data-cli playlist-items-insert --playlist-id PL_ID --video-id VID`
4. Reorder: `youtube-data-cli playlist-items-update --id ITEM_ID --playlist-id PL_ID --video-id VID --position 0`

### Comment management

1. List comments on a video: `youtube-data-cli comment-threads --video-id VID --order time`
2. Post a comment: `youtube-data-cli comment-threads-insert --video-id VID --text "..."`
3. Reply to a comment: `youtube-data-cli comments-insert --parent-id COMMENT_ID --text "..."`
4. Get all replies: `youtube-data-cli comments --parent-id COMMENT_ID`

## Error handling

- **OAuth credentials required** -- write operations need `client_id`, `client_secret`, `refresh_token`
- **Token refresh failed** -- refresh token may be expired, user needs to re-authorize
- **No credentials found** -- provide credentials via `--credentials`, env vars, or default file
- **HTTP 403 Forbidden** -- insufficient scopes or API not enabled

## API documentation

- [youtube-data-cli documentation](https://github.com/Bin-Huang/youtube-data-cli)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
