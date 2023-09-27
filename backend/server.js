import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { registerValidation } from "./validations/auth.validation.js";
import { validationResult } from "express-validator";

import UserModel from "./models/User.js";

const app = express();

// Подключение и соеденение сервера с БД
mongoose
  .connect(process.env.MONGO_URL)
  .then((res) => console.log("Connected to DataBase"))
  .catch((error) => console.log(error));

// Читает/понимает JSON
// Иначе JSON не читается (тот самый пустой объект undefined)
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.post("/auth/register", registerValidation, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const password = req.body.password;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const doc = new UserModel({
    email: req.body.email,
    fullName: req.body.fullName,
    passwordHash: passwordHash,
    avatarUrl: req.body.avatarUrl,
  });

  // const user = await doc.save();
  // res.json(user);

  doc
    .save()
    .then((post) => res.status(200).json(post))
    .catch((error) => console.log(error));
});

app.listen(process.env.PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Server running at ${process.env.PORT} port`);
});
