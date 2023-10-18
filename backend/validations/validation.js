// Импортируем метод для валидации данных в теле запроса body()
import { body, validationResult } from "express-validator";

// Создаем массив с полями + сообщением и прописываем опции
// Опции типа дллина, обязательность и тд их можно посмотреть в сети
// Регистрация
export const registerValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен быть от 5 символов").isLength({ min: 5 }),
  body("fullName", "Укажите имя").isLength({ min: 3 }),
  body("avatarUrl", "Неверная ссылка на аватарку").optional().isURL(),
];

// Авторизация
export const loginValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен быть от 5 символов").isLength({ min: 5 }),
];

// Статьи
export const postCreateValidation = [
  body("title", "Введите заголовок статьи").isLength({ min: 1 }).isString(),
  body("text", "Введите текст статьи").isLength({ min: 1 }).isString(),
  body("tags", "Неверный формат тэгов").optional().isArray(),
  body("imageUrl", "Неверная ссылка на изображение").optional().isString(),
];

// Проверяем результат валидации
// Теперь это middleware
// и подставляется после валидаций то что выше
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  next();
};
