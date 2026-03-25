import { Container } from "@cloudflare/containers";
import { env } from "cloudflare:workers";

const SECRET_KEYS = [
  "NEXTAUTH_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "AUTH_APPLE_ID",
  "AUTH_APPLE_SECRET",
  "OPENAI_API_KEY",
  "SENTRY_AUTH_TOKEN",
  "DO_SPACES_ACCESS_KEY_ID",
  "DO_SPACES_SECRET_ACCESS_KEY",
  "HF_API_TOKEN",
  "FAL_API_KEY",
  "WIRO_API_KEY",
  "CRON_SECRET",
];

function getSecretEnvVars() {
  const vars = {};
  for (const key of SECRET_KEYS) {
    if (env[key]) vars[key] = env[key];
  }
  return vars;
}

export class PromptsChatContainer extends Container {
  defaultPort = 3000;
  sleepAfter = "5m";
  envVars = {
    NODE_ENV: "production",
    DATABASE_URL: env.DATABASE_URL || "",
    NEXTAUTH_URL: env.NEXTAUTH_URL,
    OPENAI_BASE_URL: env.OPENAI_BASE_URL,
    OPENAI_EMBEDDING_MODEL: env.OPENAI_EMBEDDING_MODEL,
    OPENAI_GENERATIVE_MODEL: env.OPENAI_GENERATIVE_MODEL,
    GOOGLE_ANALYTICS_ID: env.GOOGLE_ANALYTICS_ID,
    ENABLED_STORAGE: env.ENABLED_STORAGE,
    DO_SPACES_BUCKET: env.DO_SPACES_BUCKET,
    DO_SPACES_REGION: env.DO_SPACES_REGION,
    FAL_IMAGE_MODELS: env.FAL_IMAGE_MODELS,
    FAL_VIDEO_MODELS: env.FAL_VIDEO_MODELS,
    FAL_AUDIO_MODELS: env.FAL_AUDIO_MODELS,
    WIRO_IMAGE_MODELS: env.WIRO_IMAGE_MODELS,
    WIRO_VIDEO_MODELS: env.WIRO_VIDEO_MODELS,
    EZOIC_SITE_DOMAIN: env.EZOIC_SITE_DOMAIN,
    NEXT_PUBLIC_EZOIC_ENABLED: env.NEXT_PUBLIC_EZOIC_ENABLED,
    GOOGLE_ADSENSE_ACCOUNT: env.GOOGLE_ADSENSE_ACCOUNT,
    ...getSecretEnvVars(),
  };

  onStart() {
    console.log("prompts.chat container started");
  }

  onStop() {
    console.log("prompts.chat container stopped");
  }

  onError(error) {
    console.error("prompts.chat container error:", error);
  }
}

export default {
  async fetch(request, env) {
    const container = env.PROMPTS_CHAT.getByName("main");
    return container.fetch(request);
  },
};
