import { createHash } from "crypto";
import { env } from "../config/env";

type UploadResult = {
  publicId: string;
  url: string;
};

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

const parseCloudinaryUrl = (value: string): CloudinaryConfig | null => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) return null;
  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3],
  };
};

const resolveCloudinaryConfig = (): CloudinaryConfig | null => {
  const fromUrl = parseCloudinaryUrl(env.cloudinaryUrl);
  if (fromUrl) return fromUrl;
  if (env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
    return {
      cloudName: env.cloudinaryCloudName,
      apiKey: env.cloudinaryApiKey,
      apiSecret: env.cloudinaryApiSecret,
    };
  }
  return null;
};

const signParams = (params: Record<string, string>, secret: string): string => {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + secret).digest("hex");
};

export async function uploadChatImage(input: {
  dataUrl: string;
  fileName: string;
}): Promise<UploadResult> {
  const config = resolveCloudinaryConfig();
  if (!config) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "support-chat";
  const signature = signParams({ folder, timestamp }, config.apiSecret);

  const form = new FormData();
  form.append("file", input.dataUrl);
  form.append("api_key", config.apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      "Failed to upload image.";
    throw new Error(message);
  }

  const url = payload?.secure_url || payload?.url;
  if (!url) {
    throw new Error("Upload succeeded but no URL was returned.");
  }

  return {
    publicId: String(payload?.public_id || ""),
    url: String(url),
  };
}
