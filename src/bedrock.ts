type Message = { role: "system" | "user" | "assistant"; content: string };

type BedrockEnv = {
  AWS_BEARER_TOKEN_BEDROCK?: string;
  AWS_REGION?: string;
  BEDROCK_MODEL_ID?: string;
};

const DEFAULT_REGION = "us-east-1";
const DEFAULT_MODEL = "us.anthropic.claude-sonnet-4-6";
const TIMEOUT_MS = 12000;

export function bedrockConfigured(env: BedrockEnv): boolean {
  return !!(env.AWS_BEARER_TOKEN_BEDROCK && (env.AWS_REGION || DEFAULT_REGION) && (env.BEDROCK_MODEL_ID || DEFAULT_MODEL));
}

export function bedrockModel(env: BedrockEnv): string {
  return env.BEDROCK_MODEL_ID || DEFAULT_MODEL;
}

export function bedrockRegion(env: BedrockEnv): string {
  return env.AWS_REGION || DEFAULT_REGION;
}

export async function bedrockChat(env: BedrockEnv, messages: Message[]): Promise<{ content: string; provider: string; model: string }> {
  if (!env.AWS_BEARER_TOKEN_BEDROCK) throw new Error("bedrock:not_configured");

  const region = bedrockRegion(env);
  const model = bedrockModel(env);
  const system = messages.filter(m => m.role === "system").map(m => ({ text: m.content }));
  const conversation = messages
    .filter(m => m.role !== "system")
    .map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: [{ text: m.content }] }));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(model)}/converse`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.AWS_BEARER_TOKEN_BEDROCK}`,
      },
      body: JSON.stringify({
        ...(system.length ? { system } : {}),
        messages: conversation,
        inferenceConfig: { maxTokens: 700, temperature: 0.15 },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300).replace(/\s+/g, " ");
      throw new Error(`bedrock:${response.status}${detail ? `:${detail}` : ""}`);
    }

    const data: any = await response.json();
    const content = data?.output?.message?.content?.map((part: any) => part?.text || "").join("").trim();
    if (!content) throw new Error("bedrock:invalid_response");
    return { content, provider: "bedrock", model };
  } finally {
    clearTimeout(timer);
  }
}
