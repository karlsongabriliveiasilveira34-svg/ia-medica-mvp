import fetch from "node-fetch";

// Tiny red pixel JPEG base64
const sampleBase64Jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

async function testQueryWithImage() {
  try {
    console.log("Sending API POST /api/query with image...");
    const res = await fetch("http://localhost:3000/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "tenho essa mancha na pele, não sinto dor e esta cerca de 2 dias na minha pele o que pode ser",
        specialty: "auto",
        userMode: "doctor",
        imageDataUrl: sampleBase64Jpeg
      })
    });

    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Response status field:", data.status);
    if (data.status === "success") {
      console.log("✅ Success! Answer preview:\n", data.answer.substring(0, 300));
    } else {
      console.error("❌ Error response:", data);
    }
  } catch (err) {
    console.error("❌ Request error:", err.message);
  }
}

testQueryWithImage();
