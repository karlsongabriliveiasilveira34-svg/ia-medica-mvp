import { query } from "../config/database.js";
import { env } from "../config/env.js";

export async function checkHealth(req, res) {
  const startTime = Date.now();
  try {
    const dbResult = await query("SELECT NOW() as db_time, version() as db_version");
    const dbLatencyMs = Date.now() - startTime;

    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      database: {
        connected: true,
        latencyMs: dbLatencyMs,
        serverTime: dbResult.rows[0].db_time,
        version: dbResult.rows[0].db_version
      },
      models: {
        chatModel: env.geminiModel,
        embeddingModel: env.embeddingModel,
        embeddingDimensions: env.embeddingDimensions
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false
      }
    });
  }
}
