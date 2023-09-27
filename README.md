FULL-STACK-BLOG

<h2>backend</h2>

- [x] Node.js
- [x] Express.js + Validator
- [x] MongoDB / Mongoose
- [x] JSON Web Token
- [x] Multer
- [x] BCrypt

<br>

<h2>frontend</h2>

- [x] ReactJS
- [x] Redux Toolkit
- [x] React Hook Form
- [x] React Router
- [x] React Markdown / Simple Editor
- [x] Axios

# ОСОБО НЕПОНЯТНОЕ ПИШУ ТУТ

-

<br>
<br>
<hr>

# BACKEND

<h2>АВТОРИЗАЦИЯ / РЕГИСТРАЦИЯ </h2>

<h3>+ JWT-token</h3>

- [ ] Генерируем токен, с которым можно в дальнейшем обращаться к защищенным запросам в приложении. Например -
- [ ] С помощью токена приложение понимает - авторизован-ли пользователь / может ли что-то создавать (статьи)
- [ ] На его основе будет дальнейшая регистрация/авторизация.

```javascript
// В ответе формируется token при помощи jwt.sign()
// Он содержит объект с данными из тела запроса, которые будут зашифрованы
app.post("/auth/login", (req, res) => {
  const token = jwt.sign(
    {
      email: req.body.email,
      password: req.body.password,
    },
    "secret123"
  );

// Это ответ от сервера
  res.json({
    succees: true,
    data: {
      userName: req.body.name,
      surname: req.body.surname,
    },
    token,
  });
});
```

+ это секретный ключ, который используется для подписи и проверки подлинности токена. Этот ключ должен быть известен только серверу, чтобы нельзя было подделать или изменить токен.
+ Любой может быть

<br>
<hr>

<h3>+ Создание модели user / UserModal</h3>

- [x] **Модель (Model) Mongoose** - это конструктор, который позволяет создавать экземпляры документов на основе **схемы**. Модели предоставляют методы для создания, чтения, обновления и удаления документов в коллекции MongoDB.
- [x] **Схема (Schema) Mongoose** - это описание структуры документов, которые будут храниться в MongoDB коллекции. Схемы определяют поля, их типы данных, допустимые значения и другие ограничения для документов в коллекции.

```javascript
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
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
// Пароль шифроваться будет отдельно
    passwordHash: {
      type: String,
      required: true,
    },
// Аватар необязателен - поэтому просто укажем тип
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
```

<br>
<hr>

<h3>+ Валидация / Express Validator</h3>

- [x] Перед тем, как делать запрос и тд, нужно сделать валидацию, чтобы проверить корректность информации при помощи Express Validator

+ Создается папка validations, где будут файлы валидации под разные данные.

```javascript
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
```

