# WOW NEXA YouTube Publisher

This directory contains the GitHub Actions publishing pipeline for the existing
Spring Creation / @springcreation1 channel after it is rebranded as WOW NEXA.

## Flow

1. Put a finished MP4 at a stable HTTPS URL.
2. Put its metadata in `queue.json`.
3. Change `status` from `draft` to `ready`.
4. GitHub Actions runs the publisher.
5. The publisher downloads the MP4, authenticates with YouTube OAuth, uploads it,
   optionally uploads a thumbnail, records the YouTube video ID, and marks the
   queue item as published.

GitHub stores the automation code and metadata. Large video binaries should not
normally be committed to Git.

## Required GitHub Actions secrets

Create these repository secrets manually:

- `YOUTUBE_CLIENT_ID`
- `YOUTUBE_CLIENT_SECRET`
- `YOUTUBE_REFRESH_TOKEN`

Never commit these values to Git.

## First upload

Keep the first automated upload as `private`. Verify title, description,
thumbnail, audience setting and channel before changing the queue item to
`public` for a later upload.

## Queue fields

- `queue_id`: unique identifier
- `status`: `draft`, `ready`, or `published`
- `title`: YouTube title
- `description`: YouTube description
- `tags`: array of tags
- `category_id`: YouTube category; 24 is Entertainment
- `privacy`: private/unlisted/public
- `made_for_kids`: must accurately reflect the video's audience
- `video_url`: HTTPS URL to the MP4
- `thumbnail_url`: optional HTTPS image URL

## Important

YouTube's API may restrict uploads from unverified API projects to private
viewing until the project passes Google's required audit. Treat the first
automated upload as a validation step rather than assuming it will publish
publicly immediately.
