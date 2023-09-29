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

// АВТОРИЗАЦИЯ
app.post("/auth/login", async (req, res) => {
  try {
    // Сначала мы находим пользователя в БД по описаным параметрам
    // Используем модель UserModel и метод findOne() с параметром email
    // Если email из req.body есть в БД то идем дальше или ошибка.
    // Если email такой есть - то в user будет информация об этом пользователе (знакомый {...user})
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    // После нужно понять - верный ли введен пароль
    // Перменная в которой будет булиновое значение
    // Используем метод compare() у bcrypt, где мы передаем два аргумента:
    //    1) Введенный пароль из тела запроса - (req.body.password)
    //    2) Зашифрованный пароль из объекта в БД ({...user}), который найден по email
    //        и объекта _doc с данными в нем. (В том числе и зашифрованный пароль)
    // Метод compare() расшифрует пароль и сравнит с введенным
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    // Если пароль не совпали - false - то ошибка
    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    // Шифруем опять _id - неясно повторить
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    // Так же как и при регистрации - возвращаем на клиент данные о пользователе
    // Кроме зашифрованного пароля + токен
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    // Ошибка авторизации
    console.log(error);
    res.status(400).json({
      message: "Не удалось авторизоваться",
    });
  }
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
    const passHash = await bcrypt.hash(password, salt);

    // Тут на основе модели UserModel подготавливаем объект пользователя для БД
    // ВАЖНО, что поля должны соответствовать описанным в МОДЕЛИ
    // В кач-ве ключей подставляем значения из req.body(тело запроса) кроме пароля
    // Пароль подставляется уже зашифрованный
    const newUser = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: passHash,
      avatarUrl: req.body.avatarUrl,
    });

    // Сохраняем пользователя в MongoDB методом save() ASYNC
    // Результат, который вернет Mongo помещаем в user и его возвращаем в ответе
    // Теперь в user лежит объект с данными и кучей методов из БД
    const user = await newUser.save();

    // Зашифрованный id, чтобы потом узнать авторизован ли пользователь
    // После того как расшифруем токен его
    // !!! ПОКА НЕ ЯСНО КАК И ЗАЧЕМ ЭТО !!!
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    // Сам объект user содержит в себе кучу методов и св-в, если вывести {...user}
    // Но если мы не хотим что то возвращать на клиент, например пароль
    // То из _doc деструктуризацией достаем пароль и остальные данные spread
    // в _doc как раз лежат данные пользователя (которые отправили как описано в модели)
    const { passwordHash, ...userData } = user._doc;

    // А на клиент возвращаем эти данные без пароля + токен
    res.json({ ...userData, token });

    // Обрабатываем ошибку - вернем на клиент статус и инфо
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
