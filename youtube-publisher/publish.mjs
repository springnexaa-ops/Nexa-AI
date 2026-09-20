import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const queuePath = process.env.QUEUE_PATH || "youtube-publisher/queue.json";
const statePath = process.env.STATE_PATH || "youtube-publisher/published.json";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function readJson(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

const queue = readJson(queuePath);
const published = readJson(statePath);
const publishedIds = new Set(published.map((x) => x.queue_id));

const item = queue.find((x) =>
  x.status === "ready" &&
  x.queue_id &&
  !publishedIds.has(x.queue_id)
);

if (!item) {
  console.log("No ready unpublished YouTube item found.");
  process.exit(0);
}

if (!item.video_url) throw new Error(`video_url is required for ${item.queue_id}`);
if (!item.title) throw new Error(`title is required for ${item.queue_id}`);

const client = new google.auth.OAuth2(
  required("YOUTUBE_CLIENT_ID"),
  required("YOUTUBE_CLIENT_SECRET")
);
client.setCredentials({ refresh_token: required("YOUTUBE_REFRESH_TOKEN") });

const youtube = google.youtube({ version: "v3", auth: client });

console.log(`Downloading ${item.video_url}`);
const videoResponse = await fetch(item.video_url);
if (!videoResponse.ok) {
  throw new Error(`Video download failed: HTTP ${videoResponse.status}`);
}
const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
const tempDir = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP || "/tmp", "youtube-"));
const videoPath = path.join(tempDir, "video.mp4");
fs.writeFileSync(videoPath, videoBuffer);

const privacy = item.privacy || "private";
const body = {
  snippet: {
    title: item.title,
    description: item.description || "",
    tags: item.tags || [],
    categoryId: item.category_id || "24",
    defaultLanguage: item.default_language || "en",
    defaultAudioLanguage: item.default_audio_language || "en"
  },
  status: {
    privacyStatus: privacy,
    selfDeclaredMadeForKids: Boolean(item.made_for_kids)
  }
};

console.log(`Uploading: ${item.title}`);
const upload = await youtube.videos.insert({
  part: ["snippet", "status"],
  requestBody: body,
  media: { body: fs.createReadStream(videoPath) }
});

const videoId = upload.data.id;
if (!videoId) throw new Error("YouTube did not return a video ID.");

if (item.thumbnail_url) {
  console.log("Downloading thumbnail...");
  const thumbnailResponse = await fetch(item.thumbnail_url);
  if (!thumbnailResponse.ok) {
    throw new Error(`Thumbnail download failed: HTTP ${thumbnailResponse.status}`);
  }
  const thumbnailBuffer = Buffer.from(await thumbnailResponse.arrayBuffer());
  const thumbnailPath = path.join(tempDir, "thumbnail");
  fs.writeFileSync(thumbnailPath, thumbnailBuffer);
  await youtube.thumbnails.set({
    videoId,
    media: { body: fs.createReadStream(thumbnailPath) }
  });
}

const record = {
  queue_id: item.queue_id,
  video_id: videoId,
  url: `https://youtu.be/${videoId}`,
  title: item.title,
  privacy,
  uploaded_at: new Date().toISOString()
};

published.push(record);
writeJson(statePath, published);

const updatedQueue = queue.map((x) =>
  x.queue_id === item.queue_id
    ? { ...x, status: "published", video_id: videoId, published_at: record.uploaded_at }
    : x
);
writeJson(queuePath, updatedQueue);

console.log(JSON.stringify(record, null, 2));
