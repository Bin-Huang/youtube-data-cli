# youtube-data-cli

YouTube Data API CLI for AI agents (and humans). Full coverage of the YouTube Data API v3: search, channels, videos, playlists, comments, subscriptions, captions, thumbnails, and more.

**Works with:** OpenClaw, Claude Code, Cursor, Codex, and any agent that can run shell commands.

## Installation

Tell your AI agent (e.g. OpenClaw):

> Install this CLI and skills from https://github.com/Bin-Huang/youtube-data-cli

Or install manually:

```bash
npm install -g youtube-data-cli

# Add skills for AI agents (Claude Code, Cursor, Codex, etc.)
npx skills add Bin-Huang/youtube-data-cli
```

Or run directly: `npx youtube-data-cli --help`

## How it works

Built on the official [YouTube Data API v3](https://developers.google.com/youtube/v3). Uses native `fetch` with no external dependencies beyond `commander`. Every command outputs structured JSON to stdout, ready for agents to parse without extra processing.

All 20 YouTube Data API v3 resources covered:

- **[Search](https://developers.google.com/youtube/v3/docs/search/list)** -- search for videos, channels, and playlists
- **[Channels](https://developers.google.com/youtube/v3/docs/channels)** -- get and update channel details
- **[Videos](https://developers.google.com/youtube/v3/docs/videos)** -- get, upload, update, delete, rate videos
- **[Playlists](https://developers.google.com/youtube/v3/docs/playlists)** -- CRUD playlists
- **[PlaylistItems](https://developers.google.com/youtube/v3/docs/playlistItems)** -- manage videos in playlists
- **[PlaylistImages](https://developers.google.com/youtube/v3/docs/playlistImages)** -- manage playlist cover images
- **[CommentThreads](https://developers.google.com/youtube/v3/docs/commentThreads)** -- list and post top-level comments
- **[Comments](https://developers.google.com/youtube/v3/docs/comments)** -- CRUD comments, set moderation status
- **[Subscriptions](https://developers.google.com/youtube/v3/docs/subscriptions)** -- list, subscribe, and unsubscribe
- **[Activities](https://developers.google.com/youtube/v3/docs/activities)** -- list channel activities
- **[Captions](https://developers.google.com/youtube/v3/docs/captions)** -- list, upload, download, update, delete captions
- **[ChannelBanners](https://developers.google.com/youtube/v3/docs/channelBanners)** -- upload channel banner images
- **[ChannelSections](https://developers.google.com/youtube/v3/docs/channelSections)** -- CRUD channel sections
- **[I18nLanguages](https://developers.google.com/youtube/v3/docs/i18nLanguages)** -- list supported languages
- **[I18nRegions](https://developers.google.com/youtube/v3/docs/i18nRegions)** -- list supported regions
- **[Members](https://developers.google.com/youtube/v3/docs/members)** -- list channel members
- **[MembershipsLevels](https://developers.google.com/youtube/v3/docs/membershipsLevels)** -- list membership levels
- **[Thumbnails](https://developers.google.com/youtube/v3/docs/thumbnails)** -- upload video thumbnails
- **[VideoCategories](https://developers.google.com/youtube/v3/docs/videoCategories)** -- list video categories
- **[VideoAbuseReportReasons](https://developers.google.com/youtube/v3/docs/videoAbuseReportReasons)** -- list abuse report reasons
- **[Watermarks](https://developers.google.com/youtube/v3/docs/watermarks)** -- set and unset channel watermarks

## Setup

### Authentication

This CLI supports two authentication methods:

| Method | Use case | Commands |
|--------|----------|----------|
| **API key** | Public data (search, channels, videos, playlists, comments) | Read-only commands |
| **OAuth 2.0** | Private data + write operations | All commands (required for `*-insert`, `*-update`, `*-delete`, `mine` queries) |

### Option 1: API key only (public data)

For read-only access to public data:

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **YouTube Data API v3**.
3. Create an API key under "Credentials".

### Option 2: OAuth 2.0 (full access)

For write operations and private data:

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable the **YouTube Data API v3**.
3. Create an **OAuth 2.0 Client ID** (Desktop app type) under "Credentials".
4. Use the [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) or your own flow to obtain a refresh token with the required scopes:
   - `https://www.googleapis.com/auth/youtube` -- recommended, covers all operations
   - `https://www.googleapis.com/auth/youtube.upload` -- add this if using a narrower scope but need video uploads

   Narrower scopes (if you don't need full access):
   - `https://www.googleapis.com/auth/youtube.readonly` -- read-only access (no write operations)
   - `https://www.googleapis.com/auth/youtube.force-ssl` -- videos, comments, captions, ratings (read + write)

> **Note:** Service accounts do NOT work with YouTube APIs. You must use OAuth 2.0 with a refresh token.

### Place credentials

Choose one of these options:

```bash
# Option A: Default path (recommended)
mkdir -p ~/.config/youtube-data-cli
cat > ~/.config/youtube-data-cli/credentials.json << EOF
{
  "api_key": "YOUR_API_KEY",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
EOF

# Option B: Environment variables
export YOUTUBE_API_KEY=your_api_key
export YOUTUBE_CLIENT_ID=your_client_id
export YOUTUBE_CLIENT_SECRET=your_client_secret
export YOUTUBE_REFRESH_TOKEN=your_refresh_token

# Option C: Pass per command
youtube-data-cli --credentials /path/to/credentials.json search --q "test"
```

Credentials are resolved in this order:
1. `--credentials <path>` flag
2. `YOUTUBE_API_KEY`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` env vars
3. `~/.config/youtube-data-cli/credentials.json` (auto-detected)

> **Tip:** If you also use [youtube-analytics-cli](https://github.com/Bin-Huang/youtube-analytics-cli), the environment variable names are the same, so credentials set via env vars are shared automatically between both CLIs.

## Usage

All commands output pretty-printed JSON by default. Use `--format compact` for compact single-line JSON.

### search

Search YouTube for videos, channels, and playlists.

```bash
youtube-data-cli search --q "node.js tutorial"
youtube-data-cli search --q "cooking" --type video --max-results 10
youtube-data-cli search --q "live coding" --event-type live --type video
youtube-data-cli search --q "music" --order viewCount --published-after 2026-01-01T00:00:00Z
youtube-data-cli search --q "tech" --region-code US --relevance-language en
```

Options:
- `--q <query>` -- search query (required)
- `--type <type>` -- resource type: `video`, `channel`, `playlist` (default: `video,channel,playlist`)
- `--max-results <n>` -- max results 1-50 (default: `5`)
- `--order <order>` -- sort: `relevance`, `date`, `rating`, `title`, `videoCount`, `viewCount`
- `--channel-id <id>` -- limit to a specific channel
- `--page-token <token>` -- pagination token
- `--published-after <datetime>` -- filter by publish date (RFC 3339)
- `--published-before <datetime>` -- filter by publish date (RFC 3339)
- `--region-code <code>` -- country code (ISO 3166-1 alpha-2)
- `--relevance-language <lang>` -- language code (ISO 639-1)
- `--safe-search <level>` -- `none`, `moderate`, `strict`
- `--video-duration <duration>` -- `any`, `short`, `medium`, `long`
- `--video-definition <def>` -- `any`, `high`, `standard`
- `--video-type <type>` -- `any`, `episode`, `movie`
- `--event-type <type>` -- `completed`, `live`, `upcoming`
- `--topic-id <id>` -- Freebase topic ID
- `--video-category-id <id>` -- video category ID

### channels

Get channel details. Omit ID to get the authenticated user's channel (requires OAuth).

```bash
youtube-data-cli channels UCxxxxxxxxxxxxxx
youtube-data-cli channels                    # your own channel (OAuth required)
youtube-data-cli channels UCxxxxxxxxxxxxxx --part snippet,statistics,brandingSettings
```

Options:
- `--part <parts>` -- parts to include (default: `snippet,statistics,contentDetails`)

### videos

Get video details by IDs (comma-separated).

```bash
youtube-data-cli videos dQw4w9WgXcQ
youtube-data-cli videos dQw4w9WgXcQ,jNQXAC9IVRw --part snippet,statistics,contentDetails
```

Options:
- `--part <parts>` -- parts to include (default: `snippet,statistics,contentDetails`)

### playlists

List playlists by ID, channel, or authenticated user.

```bash
youtube-data-cli playlists --channel-id UCxxxxxxxxxxxxxx
youtube-data-cli playlists --mine              # your playlists (OAuth required)
youtube-data-cli playlists --id PLxxxxxxxxxxxxxx
```

Options:
- `--id <id>` -- playlist ID(s), comma-separated
- `--channel-id <id>` -- channel ID
- `--mine` -- list your playlists (OAuth required)
- `--part <parts>` -- parts to include (default: `snippet,contentDetails`)
- `--max-results <n>` -- max results 1-50 (default: `25`)
- `--page-token <token>` -- pagination token

### playlists-insert

Create a new playlist (OAuth required).

```bash
youtube-data-cli playlists-insert --title "My Playlist"
youtube-data-cli playlists-insert --title "Public Playlist" --description "A great playlist" --privacy public
```

Options:
- `--title <title>` -- playlist title (required)
- `--description <desc>` -- playlist description
- `--privacy <status>` -- `public`, `private`, `unlisted` (default: `private`)
- `--default-language <lang>` -- default language (ISO 639-1)

### playlists-update

Update a playlist (OAuth required).

```bash
youtube-data-cli playlists-update --id PLxxxxxxxxxxxxxx --title "Updated Title"
youtube-data-cli playlists-update --id PLxxxxxxxxxxxxxx --title "New Title" --privacy public
```

Options:
- `--id <id>` -- playlist ID (required)
- `--title <title>` -- playlist title (required)
- `--description <desc>` -- playlist description
- `--privacy <status>` -- `public`, `private`, `unlisted`
- `--default-language <lang>` -- default language (ISO 639-1)

### playlists-delete

Delete a playlist (OAuth required).

```bash
youtube-data-cli playlists-delete --id PLxxxxxxxxxxxxxx
```

Options:
- `--id <id>` -- playlist ID (required)

### playlist-items

List items in a playlist.

```bash
youtube-data-cli playlist-items --playlist-id PLxxxxxxxxxxxxxx
youtube-data-cli playlist-items --playlist-id PLxxxxxxxxxxxxxx --max-results 50
```

Options:
- `--playlist-id <id>` -- playlist ID (required)
- `--part <parts>` -- parts to include (default: `snippet,contentDetails`)
- `--max-results <n>` -- max results 1-50 (default: `25`)
- `--page-token <token>` -- pagination token
- `--video-id <id>` -- filter by video ID

### playlist-items-insert

Add a video to a playlist (OAuth required).

```bash
youtube-data-cli playlist-items-insert --playlist-id PLxxxxxxxxxxxxxx --video-id dQw4w9WgXcQ
youtube-data-cli playlist-items-insert --playlist-id PLxxxxxxxxxxxxxx --video-id dQw4w9WgXcQ --position 0
```

Options:
- `--playlist-id <id>` -- playlist ID (required)
- `--video-id <id>` -- video ID to add (required)
- `--position <n>` -- position in the playlist (0-based)

### playlist-items-update

Update a playlist item position (OAuth required).

```bash
youtube-data-cli playlist-items-update --id ITEM_ID --playlist-id PLxxxxxxxxxxxxxx --video-id dQw4w9WgXcQ --position 3
```

Options:
- `--id <id>` -- playlist item ID (required)
- `--playlist-id <id>` -- playlist ID (required)
- `--video-id <id>` -- video ID (required)
- `--position <n>` -- new position (0-based)

### playlist-items-delete

Remove an item from a playlist (OAuth required).

```bash
youtube-data-cli playlist-items-delete --id ITEM_ID
```

Options:
- `--id <id>` -- playlist item ID (required)

### comment-threads

List comment threads for a video, channel, or by ID.

```bash
youtube-data-cli comment-threads --video-id dQw4w9WgXcQ
youtube-data-cli comment-threads --video-id dQw4w9WgXcQ --order time --max-results 50
youtube-data-cli comment-threads --channel-id UCxxxxxxxxxxxxxx
youtube-data-cli comment-threads --video-id dQw4w9WgXcQ --search-terms "great video"
```

Options:
- `--video-id <id>` -- video ID
- `--channel-id <id>` -- channel ID
- `--id <id>` -- comment thread ID(s), comma-separated
- `--part <parts>` -- parts to include (default: `snippet,replies`)
- `--max-results <n>` -- max results 1-100 (default: `20`)
- `--page-token <token>` -- pagination token
- `--order <order>` -- `time` or `relevance` (default: `relevance`)
- `--search-terms <q>` -- filter by search terms

### comment-threads-insert

Post a top-level comment on a video (OAuth required).

```bash
youtube-data-cli comment-threads-insert --video-id dQw4w9WgXcQ --text "Great video!"
```

Options:
- `--video-id <id>` -- video ID (required)
- `--text <text>` -- comment text (required)

### comments

List replies to a comment thread.

```bash
youtube-data-cli comments --parent-id COMMENT_ID
```

Options:
- `--parent-id <id>` -- parent comment ID (required)
- `--part <parts>` -- parts to include (default: `snippet`)
- `--max-results <n>` -- max results 1-100 (default: `20`)
- `--page-token <token>` -- pagination token

### comments-insert

Reply to a comment (OAuth required).

```bash
youtube-data-cli comments-insert --parent-id COMMENT_ID --text "Thanks for the feedback!"
```

Options:
- `--parent-id <id>` -- parent comment ID (required)
- `--text <text>` -- reply text (required)

### comments-update

Update a comment (OAuth required).

```bash
youtube-data-cli comments-update --id COMMENT_ID --text "Updated comment text"
```

Options:
- `--id <id>` -- comment ID (required)
- `--text <text>` -- updated text (required)

### comments-delete

Delete a comment (OAuth required).

```bash
youtube-data-cli comments-delete --id COMMENT_ID
```

Options:
- `--id <id>` -- comment ID (required)

### subscriptions

List subscriptions.

```bash
youtube-data-cli subscriptions --mine                   # your subscriptions (OAuth required)
youtube-data-cli subscriptions --channel-id UCxxxxxxxxxxxxxx
youtube-data-cli subscriptions --mine --order alphabetical --max-results 50
youtube-data-cli subscriptions --mine --for-channel-id UCxxxxxxxxxxxxxx
```

Options:
- `--channel-id <id>` -- list subscriptions for a channel
- `--id <id>` -- subscription ID(s), comma-separated
- `--mine` -- list your subscriptions (OAuth required)
- `--part <parts>` -- parts to include (default: `snippet,contentDetails`)
- `--max-results <n>` -- max results 1-50 (default: `25`)
- `--page-token <token>` -- pagination token
- `--order <order>` -- `alphabetical`, `relevance`, `unread`
- `--for-channel-id <id>` -- filter by subscribed channel ID(s)

### subscriptions-insert

Subscribe to a channel (OAuth required).

```bash
youtube-data-cli subscriptions-insert --channel-id UCxxxxxxxxxxxxxx
```

Options:
- `--channel-id <id>` -- channel ID to subscribe to (required)

### subscriptions-delete

Unsubscribe (OAuth required).

```bash
youtube-data-cli subscriptions-delete --id SUBSCRIPTION_ID
```

Options:
- `--id <id>` -- subscription ID (required)

### channels-update

Update a channel's metadata (OAuth required).

```bash
youtube-data-cli channels-update --id UCxxxxxxxxxxxxxx --description "New description"
youtube-data-cli channels-update --id UCxxxxxxxxxxxxxx --country US --keywords "tech,coding"
```

Options:
- `--id <id>` -- channel ID (required)
- `--description <desc>` -- channel description
- `--keywords <kw>` -- channel keywords
- `--default-language <lang>` -- default language (ISO 639-1)
- `--country <code>` -- country (ISO 3166-1 alpha-2)
- `--made-for-kids <bool>` -- self-declared made for kids (true/false)

### videos-insert

Upload a video (OAuth required).

```bash
youtube-data-cli videos-insert --file video.mp4 --title "My Video"
youtube-data-cli videos-insert --file video.mp4 --title "My Video" --description "About this" --tags "tag1,tag2" --privacy public
```

Options:
- `--file <path>` -- path to video file (required)
- `--title <title>` -- video title (required)
- `--description <desc>` -- video description
- `--tags <tags>` -- comma-separated tags
- `--category-id <id>` -- video category ID (default: `22`)
- `--privacy <status>` -- `public`, `private`, `unlisted` (default: `private`)
- `--content-type <type>` -- video MIME type (default: `video/mp4`)

### videos-update

Update video metadata (OAuth required).

```bash
youtube-data-cli videos-update --id VIDEO_ID --title "Updated Title"
youtube-data-cli videos-update --id VIDEO_ID --title "Title" --description "Desc" --tags "a,b" --privacy public
```

Options:
- `--id <id>` -- video ID (required)
- `--title <title>` -- video title (required)
- `--description <desc>` -- video description
- `--tags <tags>` -- comma-separated tags
- `--category-id <id>` -- video category ID
- `--privacy <status>` -- `public`, `private`, `unlisted`
- `--default-language <lang>` -- default language (ISO 639-1)

### videos-delete

Delete a video (OAuth required).

```bash
youtube-data-cli videos-delete --id VIDEO_ID
```

### videos-rate

Rate a video (OAuth required).

```bash
youtube-data-cli videos-rate --id VIDEO_ID --rating like
youtube-data-cli videos-rate --id VIDEO_ID --rating none    # remove rating
```

Options:
- `--id <id>` -- video ID (required)
- `--rating <rating>` -- `like`, `dislike`, or `none` (required)

### videos-get-rating

Get your rating on videos (OAuth required).

```bash
youtube-data-cli videos-get-rating --id VIDEO_ID
youtube-data-cli videos-get-rating --id VIDEO_ID1,VIDEO_ID2
```

### videos-report-abuse

Report a video for abuse (OAuth required).

```bash
youtube-data-cli videos-report-abuse --video-id VIDEO_ID --reason-id REASON_ID
```

Options:
- `--video-id <id>` -- video ID (required)
- `--reason-id <id>` -- abuse reason ID (required)
- `--secondary-reason-id <id>` -- secondary reason ID
- `--comments <text>` -- additional comments

### comments-set-moderation-status

Set moderation status of comments (OAuth required).

```bash
youtube-data-cli comments-set-moderation-status --id COMMENT_ID --moderation-status published
youtube-data-cli comments-set-moderation-status --id COMMENT_ID --moderation-status rejected --ban-author
```

Options:
- `--id <ids>` -- comment ID(s), comma-separated (required)
- `--moderation-status <status>` -- `published`, `heldForReview`, `rejected` (required)
- `--ban-author` -- ban the author from future comments

### activities

List channel activities.

```bash
youtube-data-cli activities --channel-id UCxxxxxxxxxxxxxx
youtube-data-cli activities --mine    # your activities (OAuth required)
```

Options:
- `--channel-id <id>` -- channel ID
- `--mine` -- list your activities (OAuth required)
- `--part <parts>` -- parts to include (default: `snippet,contentDetails`)
- `--max-results <n>` -- max results 1-50 (default: `25`)
- `--page-token <token>` -- pagination token
- `--published-after <datetime>` -- filter after date (RFC 3339)
- `--published-before <datetime>` -- filter before date (RFC 3339)

### captions

List caption tracks for a video.

```bash
youtube-data-cli captions --video-id VIDEO_ID
```

### captions-insert

Upload a caption track (OAuth required).

```bash
youtube-data-cli captions-insert --video-id VIDEO_ID --file subs.srt --language en --name "English"
```

Options:
- `--video-id <id>` -- video ID (required)
- `--file <path>` -- path to caption file (required)
- `--language <lang>` -- caption language BCP-47 (required)
- `--name <name>` -- caption track name (required)
- `--content-type <type>` -- MIME type (default: `application/octet-stream`)
- `--is-draft` -- mark as draft

### captions-update

Update a caption track (OAuth required).

```bash
youtube-data-cli captions-update --id CAPTION_ID --file new-subs.srt
youtube-data-cli captions-update --id CAPTION_ID --is-draft false
```

### captions-download

Download a caption track (OAuth required).

```bash
youtube-data-cli captions-download --id CAPTION_ID
youtube-data-cli captions-download --id CAPTION_ID --tfmt srt --output subs.srt
youtube-data-cli captions-download --id CAPTION_ID --tlang fr    # translated
```

Options:
- `--id <id>` -- caption track ID (required)
- `--tfmt <format>` -- format: `sbv`, `scc`, `srt`, `ttml`, `vtt`
- `--tlang <lang>` -- translation language (BCP-47)
- `--output <path>` -- save to file (default: stdout)

### captions-delete

Delete a caption track (OAuth required).

```bash
youtube-data-cli captions-delete --id CAPTION_ID
```

### channel-banners-insert

Upload a channel banner image (OAuth required). Returns a URL to use with channels-update.

```bash
youtube-data-cli channel-banners-insert --file banner.jpg
```

Options:
- `--file <path>` -- path to image file (required, max 6MB)
- `--content-type <type>` -- MIME type (default: `image/jpeg`)

### channel-sections / channel-sections-insert / channel-sections-update / channel-sections-delete

Manage channel sections.

```bash
# List
youtube-data-cli channel-sections --channel-id UCxxxxxxxxxxxxxx
youtube-data-cli channel-sections --mine

# Create (OAuth)
youtube-data-cli channel-sections-insert --type singlePlaylist --title "Featured" --playlist-ids PLxxxxxxxxxxxxxx

# Update (OAuth)
youtube-data-cli channel-sections-update --id SECTION_ID --type singlePlaylist --title "Updated"

# Delete (OAuth)
youtube-data-cli channel-sections-delete --id SECTION_ID
```

### i18n-languages / i18n-regions

List supported languages and regions.

```bash
youtube-data-cli i18n-languages
youtube-data-cli i18n-languages --hl en
youtube-data-cli i18n-regions
youtube-data-cli i18n-regions --hl en
```

### members / memberships-levels

List channel members and membership levels (OAuth required).

```bash
youtube-data-cli members
youtube-data-cli members --max-results 100
youtube-data-cli memberships-levels
```

### playlist-images / playlist-images-insert / playlist-images-update / playlist-images-delete

Manage playlist cover images.

```bash
# List
youtube-data-cli playlist-images --parent PLxxxxxxxxxxxxxx

# Upload (OAuth)
youtube-data-cli playlist-images-insert --playlist-id PLxxxxxxxxxxxxxx --file cover.jpg

# Update (OAuth)
youtube-data-cli playlist-images-update --id IMAGE_ID --playlist-id PLxxxxxxxxxxxxxx --file new-cover.jpg

# Delete (OAuth)
youtube-data-cli playlist-images-delete --id IMAGE_ID
```

### thumbnails-set

Upload a custom thumbnail for a video (OAuth required).

```bash
youtube-data-cli thumbnails-set --video-id VIDEO_ID --file thumb.jpg
```

Options:
- `--video-id <id>` -- video ID (required)
- `--file <path>` -- path to image file (required)
- `--content-type <type>` -- MIME type (default: `image/jpeg`)

### video-categories

List video categories.

```bash
youtube-data-cli video-categories
youtube-data-cli video-categories --region-code JP --hl ja
youtube-data-cli video-categories --id 1,2,10
```

### video-abuse-report-reasons

List video abuse report reasons.

```bash
youtube-data-cli video-abuse-report-reasons
youtube-data-cli video-abuse-report-reasons --hl en
```

### watermarks-set / watermarks-unset

Manage channel watermarks (OAuth required).

```bash
youtube-data-cli watermarks-set --channel-id UCxxxxxxxxxxxxxx --file watermark.png
youtube-data-cli watermarks-unset --channel-id UCxxxxxxxxxxxxxx
```

## Error output

Errors are written to stderr as JSON with an `error` field and a non-zero exit code:

```json
{"error": "OAuth credentials required (client_id, client_secret, refresh_token). API key alone is not sufficient for this command."}
```

## API Reference

- YouTube Data API v3: https://developers.google.com/youtube/v3

## Related

- [youtube-analytics-cli](https://github.com/Bin-Huang/youtube-analytics-cli) -- YouTube Analytics CLI for AI agents (and humans)
- [google-analytics-cli](https://github.com/Bin-Huang/google-analytics-cli) -- Google Analytics CLI for AI agents (and humans)
- [google-search-console-cli](https://github.com/Bin-Huang/google-search-console-cli) -- Google Search Console CLI for AI agents (and humans)
- [x-analytics-cli](https://github.com/Bin-Huang/x-analytics-cli) -- X Analytics CLI for AI agents (and humans)

## License

Apache-2.0
