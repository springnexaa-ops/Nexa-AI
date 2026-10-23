# Nexa AI Self-Hosted Model Provider

Nexa's medical knowledge retrieval is designed to work without hosted embeddings. This document covers the separate model-inference switch.

## Runtime configuration

Set these as server-side Worker secrets/variables (never expose them in browser code):

- `NEXA_MODEL_PROVIDER=self-hosted` — require the self-hosted endpoint. If the endpoint is absent or fails, the request fails closed; it does not silently switch providers.
- `NEXA_MODEL_BASE_URL=https://your-controlled-host.example` — HTTPS base URL, a URL ending in `/v1`, or the full `/v1/chat/completions` endpoint.
- `NEXA_MODEL_NAME=your-served-model-id` — exact model ID expected by your inference server.
- `NEXA_MODEL_API_KEY` — optional bearer token, configured as a secret if the endpoint requires it.

With `NEXA_MODEL_PROVIDER=auto`, Nexa prefers the self-hosted endpoint when `NEXA_MODEL_BASE_URL` is configured. If no endpoint is configured, it retains the existing Cloudflare model path for backward compatibility. Set the provider to `self-hosted` after the model server has been deployed and tested to prevent fallback.

The endpoint must be reachable from the Worker over HTTPS, implement OpenAI-compatible `POST /v1/chat/completions`, accept `model`, `messages`, `max_tokens` and `temperature`, and return `choices[0].message.content` (or a compatible `response` field). Restrict ingress, use authentication, rate-limit requests, redact logs, and never log patient payloads or API keys.

## What is independent now

- Medical chunk retrieval uses transparent, deterministic lexical matching. It does not invoke a Cloudflare embedding model.
- Private text ingestion and approved dataset promotion no longer require hosted embeddings.
- The model layer has a self-hosted OpenAI-compatible provider adapter and can require it explicitly.

## What is not independent yet

- The default hosting environment and Medical Evidence database are still Cloudflare Workers/Durable Objects.
- The compatibility default remains Cloudflare inference until a self-hosted endpoint is configured.
- This repository does not provision a model server, download model weights, or migrate the existing corpus/database to SpringNexa-owned infrastructure.
- A self-hosted model does not become medically reliable simply because it is local. Evaluate it on representative, held-out neurodiagnostic cases, with clinician adjudication, citation checks, privacy/security tests and a rollback plan.

## Hardware note

The previously reported desktop (Intel Core i3-2100, approximately 12 GB RAM and NVIDIA GT 610) is not suitable for fast inference of a capable modern medical LLM. It can be used for document extraction, corpus preparation and lexical retrieval development. For dependable self-hosted inference, use a separate server with adequate RAM/compute, or a controlled hosted GPU server owned/managed by SpringNexa. Do not describe the current desktop as an adequate clinical inference server.

## Deployment gate

Do not set production to `self-hosted` until:
1. the endpoint is deployed and reachable from the Worker;
2. authentication, TLS, network access controls, request limits and secret storage are verified;
3. timeouts, malformed responses, unavailable model and prompt-injection cases fail safely;
4. sequential clinical workflow tests and medical safety checks pass; and
5. clinical validation and applicable regulatory review are complete.
