import { env } from "../config/env";

type UploadResult = {
  id: string;
  url: string;
  variants?: string[];
};

const parseDataUrl = (dataUrl: string): { buffer: Buffer; contentType: string } => {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data.");
  }
  const contentType = match[1] || "application/octet-stream";
  const base64 = match[2] || "";
  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) {
    throw new Error("Image payload is empty.");
  }
  return { buffer, contentType };
};

export async function uploadChatImage(input: {
  dataUrl: string;
  fileName: string;
}): Promise<UploadResult> {
  const accountId = env.cloudflareAccountId;
  const token = env.cloudflareImagesToken;
  if (!accountId || !token) {
    throw new Error("Cloudflare Images credentials are not configured.");
  }

  const { buffer, contentType } = parseDataUrl(input.dataUrl);
  const form = new FormData();
  const blob = new Blob([buffer], { type: contentType });
  form.append("file", blob, input.fileName || "upload.png");

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    const message =
      payload?.errors?.[0]?.message ||
      payload?.error ||
      "Failed to upload image.";
    throw new Error(message);
  }

  const result = payload.result || {};
  const variants = Array.isArray(result.variants) ? result.variants : [];
  const url = result.url || variants[0] || "";
  if (!url) {
    throw new Error("Upload succeeded but no image URL was returned.");
  }

  return {
    id: String(result.id || ""),
    url,
    variants,
  };
}
