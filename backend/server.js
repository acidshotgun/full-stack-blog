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
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    // Создаем переменную с паролем из req.body
    // Генерируем соль - bcrypt.genSalt(10);
    // Создаем переменную, в которой будет зашифрованный пароль - bcrypt.hash()

    // Теперь в переменной passwordHash находится зашифрованный пароль
    // Он и будет сохранен в базу данных.
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Тут на основе модели UserModel подготавливаем объект пользователя для БД
    // ВАЖНО, что поля должны соответствовать описанным в МОДЕЛИ
    // В кач-ве ключей подставляем значения из req.body(тело запроса) кроме пароля
    // Пароль подставляется уже зашифрованный
    const userData = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: passwordHash,
      avatarUrl: req.body.avatarUrl,
    });

    // Сохраняем пользователя в MongoDB методом save()
    // Результат, который вернет Mongo помещаем в user и его возвращаем в ответе
    const user = await userData.save();
    res.json({ ...user });

    // МОЖНО ПРОМИСОМ
    // userData
    //   .save()
    //   .then((userData) => res.status(200).json(userData))
    //   .catch((error) => console.log(error));

    // Обрабатываем ошибку
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: "Не удалось зарегистрироваться",
    });
  }
});

app.listen(process.env.PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Server running at ${process.env.PORT} port`);
});
