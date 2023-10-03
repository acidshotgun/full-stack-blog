import mongoose from "mongoose";

// Схема user
// Все св-ва для user
// Это объект с описанием всех свойств пользователя

// Например:
//  1) type - тип поля
//  2) required - поле обязательно

//  3) unique - поле должно быть уникально
//      ЭТО ПОЛЕ СОЗДАЕТ ИНДЕКС УНИКАЛЬНОСТИ В MONGO
//      И ПРИ СОВПАДЕНИИ ПАРАМЕТРА - MONGO БУДЕТ ВЫДАВАТЬ ОШИБКУ
// Их больше
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      unique: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // У пользователя будут данные о его созданных постах (массив постов)
    // Для этого указываем тип (из монго) и ref (на что ссылается - т.е. связь)
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    avatarUrl: String,
  },
  //  4) timestamps - автосоздание даты
  {
    timestamps: true,
  }
);

// Экспортируем модель, где:
//  1) mongoose.model() - сам метод с аргументами:
//      а) Имя модели.
//      б) Схема этой модели.
// ПРИ ИМПОРТЕ ПО DEFAULT - МОЖЕТ ИМЕТЬ ЛЮБОЕ ИМЯ
// Тут оно будет UserModel
export default mongoose.model("User", UserSchema);
