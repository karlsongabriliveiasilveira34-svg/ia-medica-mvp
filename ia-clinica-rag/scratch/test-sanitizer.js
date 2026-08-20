import { processAndSanitizeImage } from "../src/utils/image-sanitizer.util.js";

// Test 1: JPEG magic bytes 0xFF 0xD8 0xFF 0xE0 (JFIF)
const jfifBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00]);
try {
  const res1 = processAndSanitizeImage(jfifBuffer);
  console.log("✅ JFIF JPEG succeeded:", res1.mimeType);
} catch (e) {
  console.error("❌ JFIF JPEG failed:", e.message);
}

// Test 2: JPEG with EXIF APP1 (0xFF 0xE1)
const exifBuffer = Buffer.from([
  0xFF, 0xD8,
  0xFF, 0xE1, 0x00, 0x08, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
  0xFF, 0xDA, 0x00, 0x00
]);
try {
  const res2 = processAndSanitizeImage(exifBuffer);
  console.log("✅ EXIF JPEG succeeded:", res2.mimeType);
} catch (e) {
  console.error("❌ EXIF JPEG failed:", e.message);
}

// Test 3: PNG
const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
try {
  const res3 = processAndSanitizeImage(pngBuffer);
  console.log("✅ PNG succeeded:", res3.mimeType);
} catch (e) {
  console.error("❌ PNG failed:", e.message);
}

// Test 4: WebP (RIFF....WEBP)
const webpBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
try {
  const res4 = processAndSanitizeImage(webpBuffer);
  console.log("✅ WebP succeeded:", res4.mimeType);
} catch (e) {
  console.error("❌ WebP failed:", e.message);
}
