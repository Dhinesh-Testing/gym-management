import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index.js";

const app = express();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("Gym Management API is running...");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(400)
      .json({ message: "Invalid JSON payload passed.", error: err.message });
  }

  res
    .status(err.status || 500)
    .json({ message: "Something went wrong!", error: err.message });
});

export default app;
