import { app } from '../ia-clinica-rag/src/app.js';

export default function handler(req, res) {
  return app(req, res);
}
