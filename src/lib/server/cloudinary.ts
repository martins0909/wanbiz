import { createHash } from "node:crypto";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadEventImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Choose a JPG, PNG, GIF, WebP, or AVIF image.");
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Images must be smaller than 10 MB.");
  }

  const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
  const apiKey = process.env["CLOUDINARY_API_KEY"];
  const apiSecret = process.env["CLOUDINARY_API_SECRET"];
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "wanbiz/events";
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  const body = new FormData();
  body.append("file", new Blob([await file.arrayBuffer()], { type: file.type }), file.name);
  body.append("api_key", apiKey);
  body.append("folder", folder);
  body.append("timestamp", timestamp);
  body.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  if (!response.ok) {
    throw new Error("Cloudinary could not store this image.");
  }

  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("secure_url" in result) ||
    typeof result.secure_url !== "string"
  ) {
    throw new Error("Cloudinary returned an invalid upload response.");
  }
  return result.secure_url;
}