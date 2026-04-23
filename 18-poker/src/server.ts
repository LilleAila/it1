import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

export const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  "/socket.io-client",
  express.static("node_modules/socket.io-client/dist"),
);
app.use("/cardmeister", express.static("node_modules/playingcardts"));
