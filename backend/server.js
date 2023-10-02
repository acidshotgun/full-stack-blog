import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

// user routes api
import userRoutes from "./routes/user-routes.js";
import postsRoutes from "./routes/post-routes.js";

const app = express();

// Подключение и соеденение сервера с БД
mongoose
  .connect(process.env.MONGO_URL)
  .then((res) => console.log("Connected to DataBase"))
  .catch((error) => console.log(error));

// Читает/понимает JSON
// Иначе JSON не читается (тот самый пустой объект undefined)
app.use(express.json());

// Обработка роутов
app.use(userRoutes);
app.use(postsRoutes);

app.listen(process.env.PORT, (error) => {
  error
    ? console.log(error)
    : console.log(`Server running at ${process.env.PORT} port`);
});
