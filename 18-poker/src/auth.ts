import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import { io, app } from "./server";
import { db } from "./db";

const SECRET = "abcdefg"; // TODO env file lol

interface User {
  id: number;
  username: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, SECRET) as User;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid session" });
  }
}

io.use((socket, next) => {
  const header = socket.handshake.headers.cookie;
  if (!header) return next(new Error("Authentication error: No cookie"));

  const cookies = cookie.parse(header);
  const token = cookies.auth_token;
  if (!token) return next(new Error("Authentication error: Invalid token"));

  try {
    const decoded = jwt.verify(token, SECRET) as User;
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

function setAuthCookie(res: Response, user: User) {
  const token = jwt.sign(user, SECRET, { expiresIn: "24h" });
  res.cookie("auth_token", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 86400000, // 24h
  });
}

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hash = await Bun.password.hash(password);

  try {
    const result = db
      .prepare(
        "INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id, username",
      )
      .get(username, hash) as User;
    setAuthCookie(res, result);
    res.redirect("/");
  } catch (e) {
    res.status(400).json({ error: "Username taken" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user: any = db
    .query("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (user && (await Bun.password.verify(password, user.password_hash))) {
    setAuthCookie(res, { id: user.id, username: user.username } as User);
    return res.redirect("/");
  }
  res
    .status(401)
    .json({ error: "Invalid credentials. <a href='/'>Try again</a>" });
});

app.post("/logout", (_req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/");
});

app.get("/me", (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ loggedIn: true, user: decoded });
  } catch {
    res.status(401).json({ loggedIn: false });
  }
});
