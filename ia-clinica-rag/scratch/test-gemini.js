import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Tiny 1x1 red pixel JPEG image in base64
const sampleBase64Jpeg = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function testMultimodal(modelName) {
  try {
    console.log(`Testing image with model: ${modelName}`);
    const res = await gemini.models.generateContent({
      model: modelName,
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: sampleBase64Jpeg
          }
        },
        "Descreva brevemente o que você vê nesta imagem."
      ]
    });
    console.log(`✅ Success for ${modelName}:`, res.text?.substring(0, 150));
  } catch (err) {
    console.error(`❌ Error for ${modelName}:`, err);
  }
}

async function run() {
  await testMultimodal("gemini-3.5-flash-lite");
  await testMultimodal("gemini-3.6-flash");
}

run();
