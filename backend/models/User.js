import mongoose from "mongoose";

// Схема user
// Все св-ва для user
// Это объект с описанием всех свойств пользователя

// Например:
//  1) type - тип поля
//  2) required - поле обязательно
//  3) unique - поле должно быть уникально
// Их больше
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      unique: true,
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
export default mongoose.model("User", UserSchema);
