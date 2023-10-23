import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import checkAuths from "./utils/checkAuths.js";

// user routes api
import userRoutes from "./routes/user-routes.js";
import postsRoutes from "./routes/post-routes.js";
import commentsRouter from "./routes/comments-routes.js";

const app = express();

// Подключение и соеденение сервера с БД
mongoose
  .connect(process.env.MONGO_URL)
  .then((res) => console.log("Connected to DataBase"))
  .catch((error) => console.log(error));

// Создаем хранилище
// Тут diskStorage, тк хранить будем на сервере
const storage = multer.diskStorage({
  destination(_, __, cb) {
    cb(null, "uploads");
  },
  filename(_, file, cb) {
    cb(null, file.originalname);
  },
});

// Экземпляр с использованием настроенного хранилища
// { storage } - имя хранилища
const upload = multer({ storage });

// Читает/понимает JSON
// Иначе JSON не читается (тот самый пустой объект undefined)
app.use(express.json());
app.use(cors());

// Получение статических файлов сервера по по пути uploads
// express.static("uploads") - говорим, чтобы сервер брал файлы отсюда
app.use("/uploads", express.static("uploads"));

// Обработка роутов
app.use(userRoutes);
app.use(postsRoutes);
app.use(commentsRouter);

// Запрос на загрузку картинки
//  1) Роут
//  2) Проверка на авторизацию
//  3) middlwere (встроенный) обрабаывает один файл image из запроса
//  4) callback
// Возвращаем ссылку на изображение
app.post("/upload", checkAuths, upload.single("image"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.listen(process.env.PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Server running at ${process.env.PORT} port`);
});
