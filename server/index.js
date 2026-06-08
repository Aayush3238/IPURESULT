import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import resultRouter from "./routes/result.js";
import internalsRouter from "./routes/internals.js";
import portalRouter from "./routes/portal.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      const isLocalViteOrigin = /^http:\/\/localhost:517\d$/.test(origin || "");
      const isVercelPreview = Boolean(origin && origin.endsWith('.vercel.app'));
      if (!origin || allowedOrigins.includes(origin) || isLocalViteOrigin || isVercelPreview) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/result", resultRouter);
app.use("/api/internals", internalsRouter);
app.use("/api/portal", portalRouter);

const frontendDist = path.resolve(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.publicMessage || "Something went wrong.";

  console.error("[api:error]", {
    status,
    code,
    message: err.message,
    cause: err.cause?.message,
    stack: err.stack,
  });

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
});

app.listen(port, () => {
  console.log(`GGSIPU result backend listening on http://localhost:${port}`);
});
