import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import { router as userRouter } from "./router/user.router.js";
import { router as authRouter } from "./router/auth.router.js";
import { router as ticketRouter } from "./router/ticket.router.js";
import { router as reportRouter } from "./router/report.router.js";
import cors from "cors";
import { API_PREFIX } from "./lib/constants.js";

dotenv.config();

const app = express();

const PORT = 5000;
const HOST = "127.0.0.1";
app.use(cors({ origin: ["http://localhost:5173"] }));
app.use(bodyParser.json());

app.use(`${API_PREFIX}/user`, userRouter);
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/ticket`, ticketRouter);
app.use(`${API_PREFIX}/reports`, reportRouter);

app.get("/", (req, res) => {
  res.send("Working fine");
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, HOST, () => {
    console.log(`app is running on , and ${HOST}:${PORT}`);
  });
};

startServer();
