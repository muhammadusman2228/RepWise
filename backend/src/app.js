import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/config.js";
import route from "./routes/register.route.js";
import exercise from "./routes/exercise.route.js";
import workout from "./routes/workout.route.js";

const app = express();

app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", route);
app.use("/api/exercises", exercise);
app.use("/api/workouts", workout);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RepWise API is healthy",
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");
const frontendIndexPath = path.join(publicPath, "index.html");

app.use(express.static(publicPath));

if (fs.existsSync(frontendIndexPath)) {
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(frontendIndexPath);
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "RepWise API is running",
    });
  });
}

export default app;
