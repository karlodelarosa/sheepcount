export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const IMAGE_SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

export function validateAvatarFile(file: File, label = "Image"): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error(`${label} must be JPEG, PNG, WebP, or GIF.`);
  }

  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error(`${label} must be 5 MB or smaller.`);
  }
}

async function readFileHeader(file: File, length: number): Promise<Uint8Array> {
  const buffer = await file.slice(0, length).arrayBuffer();
  return new Uint8Array(buffer);
}

function matchesSignature(header: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, index) => header[index] === byte);
}

export async function validateImageFile(
  file: File,
  label = "Image",
): Promise<void> {
  validateAvatarFile(file, label);
  const header = await readFileHeader(file, 12);
  const signatureMatch = IMAGE_SIGNATURES.some(
    ({ mime, bytes }) => file.type === mime && matchesSignature(header, bytes),
  );

  if (!signatureMatch) {
    throw new Error(
      `${label} file content does not match an allowed image type.`,
    );
  }

  if (file.type === "image/webp") {
    const webpMarker = String.fromCharCode(...header.slice(8, 12));
    if (webpMarker !== "WEBP") {
      throw new Error(
        `${label} file content does not match an allowed image type.`,
      );
    }
  }
}

export function getImageExtension(file: File): string {
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      throw new Error("Invalid image type. Use JPEG, PNG, WebP, or GIF.");
  }
}
