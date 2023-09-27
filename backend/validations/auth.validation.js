// Импортируем метод для валидации данных в теле запроса body()
import { body } from "express-validator";

// Создаем массив с полями + сообщением и прописываем опции
// Опции типа дллина, обязательность и тд их можно посмотреть в сети
export const registerValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен быть от 5 символов").isLength({ min: 5 }),
  body("fullName", "Укажите имя").isLength({ min: 3 }),
  body("avatarUrl", "Неверная ссылка на аватарку").optional().isURL(),
];
