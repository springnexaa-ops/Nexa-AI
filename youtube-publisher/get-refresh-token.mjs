import http from "node:http";
import { google } from "googleapis";

const clientId = process.env.YOUTUBE_CLIENT_ID;
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  throw new Error("Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET before running this script.");
}

const port = 53682;
const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const scopes = ["https://www.googleapis.com/auth/youtube.upload"];
const authUrl = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: scopes
});

console.log("\nOpen this URL in the same computer's browser:\n");
console.log(authUrl);
console.log("\nWaiting for Google OAuth callback...\n");

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, redirectUri);
  if (requestUrl.pathname !== "/oauth2callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const error = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end(`Google OAuth error: ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400);
    res.end("Missing authorization code.");
    return;
  }

  try {
    const { tokens } = await oauth2.getToken(code);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h2>Authorization complete.</h2><p>You can close this browser tab.</p>");
    console.log("\nREFRESH TOKEN (store it as a GitHub Actions secret; do not post it in chat):\n");
    console.log(tokens.refresh_token || "No refresh token returned. Revoke the grant and run again with prompt=consent.");
    server.close();
  } catch (err) {
    res.writeHead(500);
    res.end("Token exchange failed.");
    console.error(err);
    server.close();
    process.exit(1);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Listening on ${redirectUri}`);
});
