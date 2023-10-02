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
- [x] ПРО ССЫЛКИ В MONGODB - как формируются коллекции и как подулючится не к кластеру а конкретно к БД 50 МИНУТА В РОЛИКЕ
- [x] Как монго на основе модели формирует папки САМА 50:17
- [x] Зачем поместили _id в jwt токен и для чего он? 54:30
- [x] ПРО next() в middlewear и сам middlewear
 -

<br>
<br>
<hr>

# BACKEND

<h2>РЕГИСТРАЦИЯ </h2>

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

- [x] **`Модель (Model) Mongoose`** - это конструктор, который позволяет создавать экземпляры документов на основе **`схемы`**. Модели предоставляют методы для создания, чтения, обновления и удаления документов в коллекции MongoDB.
- [x] **`Схема (Schema) Mongoose`** - это описание структуры документов, которые будут храниться в MongoDB коллекции. Схемы определяют поля, их типы данных, допустимые значения и другие ограничения для документов в коллекции.

```javascript
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
// ПРИ ИМПОРТЕ ПО DEFAULT - МОЖЕТ ИМЕТЬ ЛЮБОЕ ИМЯ
// Тут оно будет UserModel
export default mongoose.model("User", UserSchema);
```

<br>
<hr>

<h3>+ Валидация / Express Validator</h3>

Перед тем, как делать запрос и тд, нужно сделать валидацию, чтобы проверить корректность информации при помощи **`Express Validator`**, он представляет множество методов для валидации разных данных, приходящих в теле запроса.

- [x] Библиотека **`Express Validator`** предоставляет различные методы для валидации данных, отправляемых или получаемых через **`HTTP запросы в приложении Express.js`**.

+ Создается папка validations, где будут файлы валидации под разные данные.

```javascript
// Импортируем метод для валидации данных в теле запроса body()
// body() используется для валидации данных, переданных в теле HTTP-запроса, обычно в формате JSON или URL-кодированных данных.
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

<br>

+ Валидация используется в качестве второго(необязательного) аргумента в функции запроса к серверу.

```javascript
// Импорт созданной валидации
// И метода который проверяет результат валидации
import { registerValidation } from "./validations/auth.validation.js";
import { validationResult } from "express-validator";

// Post запрос где как раз:
//  1) Роут
//  2) Валидация(созданная) (не обязательно - может быть что угодно или ничего)
//  3) callback
app.post("/auth/register", registerValidation, async (req, res) => {
// Объявл. перменная error, где методом validationResult(req) будет проверяться тело запроса
// Результат - переменная error - это объект с ошибкой
  const errors = validationResult(req);

// Проверяем - метод isEmpty() у error:
//  true - ошибки нет
//  false - ошибка есть и надо обработать
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
// ... запрос далее
});
```

<br>
<hr>

<h3>+ bcrypt</h3>

Важная часть для защиты данных - это шифрование. Например шифрование паролей. Для этого используется библиотека **`bcrypt`**. Шаги:

`ВАЖНО, ЧТО ДЕЙСТВИЯ С СОЗДАНИЕМ СОЛИ И ШИФРОВАНИЯ ЗАНИМАЮТ ВРЕМЯ - ПОЭТОМУ ЭТИ МЕТОДЫ АСИНХРОННЫЕ!!!! ASYNC \ AWAIT`

- [x] **Генерация соли**:

+ **`Соль`** – это случайная строка, которая добавляется к паролю перед хэшированием. Это обеспечивает уникальность хэша для одинаковых паролей и предотвращает использование таблиц радужных хэшей (rainbow tables) для подбора паролей.

+ Для генерации **`соли`** используется метод **`genSalt()`** из библиотеки **`bcrypt`**. Она принимает один аргумент – количество "раундов" (или итераций) хэширования. Чем больше раундов, тем безопаснее, но и медленнее будет происходить хэширование. Обычно используются значения от **`10 до 12`**.

<br>

- [x] Хэширование пароля:

+ После того как у вас есть соль, вы можете хэшировать пароль с использованием функции **`hash()`**. Эта функция принимает два аргумента: пароль и соль.

<br>

- [x] Проверка пароля:

+ При аутентификации пользователей в приложении, вы должны проверять, совпадает ли введенный пароль с хэшированным паролем в базе данных. Для этого используйте функцию **`compare()`**. Она сравнивает введенный пароль с хэшированным паролем и возвращает **`true`**, если они совпадают, или **`false`**, если нет.

`ПРИМЕР ПРОВЕРКИ`
```javascript
const enteredPassword = 'userEnteredPassword';
const passwordMatch = await bcrypt.compare(enteredPassword, hashedPassword);

if (passwordMatch) {
  // Пароль верный, продолжаем аутентификацию
} else {
  // Пароль не верный, отказываем в доступе
}
```

`НАШ КОД`

```javascript
import bcrypt from "bcrypt";

  // Создаем переменную с паролем из req.body
  // Генерируем соль - bcrypt.genSalt(10);
  // Создаем переменную, в которой будет зашифрованный пароль - bcrypt.hash()

  // Теперь в переменной passwordHash находится зашифрованный пароль
  // Он и будет сохранен в базу данных. 
  const password = req.body.password;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
```

<br>
<hr>

<h3>+ Создание пользователя в БД </h3>

- [x] На основе описанной модели **`UserModel`** для `user` - мы создаем пользователя в базе данных при **`post-запросе`**.

```javascript
// Сначала импортируем модель
import UserModel from "./models/User.js";

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
  // Результат, который вернет Mongo помещаем в user и его возвращаем в ответе в JSON - формате
  const user = await userData.save();
  res.json(user);

  // МОЖНО ПРОМИСОМ
  // userData
  //   .save()
  //   .then((userData) => res.status(200).json(userData))
  //   .catch((error) => console.log(error));
``` 

<br>
<hr>

<h3>+ Создание пользователя в БД - ИТОГ: </h3>

- [x] Метод по роуту `/auth/register` будет отправлять `post-запрос` на добавление пользователя в БД (регистрация)
- [x] Кратко:

+ Точный роут + прописанныя валидация, которая проверяет тело запроса.
+ Блок `try \ catch` для отлова потенциальных ошибок + сразу прописан блок `catch`
+ Создадим переменную `error` и методом `validationResult(req)` из библиотеки `Express Validation` выявим мохможные ошибки. + Далее методом `isEmpty()` в конструкции `if` проверим наличие ошибок.
+ Достаем пароль из тела запроса и шифруем его
+ На основи модели `UserModel` создаем пользователя используя данные из запроса + шифрованый пароль.
+ `const user = await newUser.save()` - создаем объёкт в базе данных а в `user` помещаем информацию о нем.
+ Шифруем _id при помощи jwt
+ Возвращаем данные на клиент. Деструктуризацией + spread можно вернуть конкретные данные или не возвращать как напримере зашифрованного пароля, тк при регистрации это инфа не нужна.

```javascript
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
```

<br>
<br>
<hr>

<h2>АВТОРИЗАЦИЯ </h2>

- [x] Когда мы делаем авторизацию - мы хотим найти пользователя. Т.е понять есть ли он в базе данных.
- [x] Кратко:

+ Нужно понять есть ли пользователь в базе по имени или имейлу. Используя модель **`UserModel (помним, что она описывает пользователя)`** и метод  **`findOne()`**, с заданными параметрами (а именно `email`), который будет искать объект в базу ореинтируясь на схожий параметр в **`req.body.email`**. Если ок - то в **`user`** будет инфа об этом объекте в базе `помним ту дрочь с огромным объектом который получается в {...user}` (там еще есть `_doc`) и идем дальше. Если не ок то ошибка.
+ Далее проверка введенного пароля при помощи метода **`compare()`** в **`bcrypt`**, который принимает аргументом пароль, из **`req.body.password`** и пароль, полученный из найденного объекта в переменной `user`. Пароль расшифровывается и сравнивается с введенным в теле запроса.
+ Далее `_id` в токен `НЕПОНЯТНО ДОПИСАТЬ`
+ Как и в регистрации - возвращаем данные из того огромного `{...user._doc}` и возвращаем данные юзера кроме шифрованного пароля. (он только для авторизации)
+ При ошибке выведем ошибку при авторизации

<br>
<hr>

<h3>+ КОД</h3>

- [x] Код аналогичен с регистрацией + есть комменты.

```javascript
// АВТОРИЗАЦИЯ
app.post("/auth/login", async (req, res) => {
  try {
    // Сначала мы находим пользователя в БД по описаным параметрам
    // Используем модель UserModel и метод findOne() с параметром email
    // Если email из req.body есть в БД то идем дальше или ошибка.
    // Если email такой есть - то в user будет информация об этом пользователе (знакомый {...user})
    const user = await UserModel.findOne({ email: req.body.email });

    // если такого user нет - останавливаем и возвращаем сообщение
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
```

<br>
<br>
<hr>

<h2>ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ПРОФИЛЕ (ЗАРЕГЕСТРИРОВАН ИЛИ НЕТ?)</h2>

- [x] Задача состоит в том, чтобы понять - есть ли у пользователя доступ к защищенной информации, которая доступна только зарегестрированному пользователю, или нет. Для определения этого используется `JWT Token`. Подробнее:

+ Когда пользователь `регистрируется / авторизуется` - он получает от сервера `JWT Token`, в котором зашифрован его `_id` в базе данных (при помощи секретного ключа). Этого должно быть достаточно, чтобы понять авторизован он или нет.
+ Когда пользователь хочет получить доступ к защищенным данным, он должен отправить в `header` своего запроса его токен, который лежит в `localstorage`.
+ На этом этапе сервер должен понять - был ли передан токен, а так же является ли он действительным. 
+ Напишем `**middleware**`, который будет проверять по токену (который мы везде шифровали) - имеет ли пользователь доступ (авторизован ли он). Так же имеет ли пользователь по расшифрованному токену выполнять какие - либо действия. (Например получать информацию о себе)
+ Если все ОК - то `middleware` пропускает запрос дальше и выполняем нужные действия. Если не ОК - то получим какую-то ошибку

<br>
<hr>

<h3>+ Проверка авторизации (middleware)</h3>

- [x] Напишмем `middeleware`, который будет определять по токену - можно ли возврощать какую-либо информацию пользователю или нельзя.
- [x] На этом этапе `middleware` перехватывает запрос и проверяет наличие / действительность токена.

```javascript
import jwt from "jsonwebtoken";

// middleware - 3 параметра:
//    1) req - это запрос, который он перехватил
//    2) res - ответ
//    3) next() - middleware закончил и передает работу дальше
export default (req, res, next) => {
  // Проверяем есть ли в запросе токен
  // Он всегда передается в headers.authorization  запросе
  // + убираем прикиску Bearer, которая передается всегда
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  // Если токен есть - то его нужно декодировать
  // Затем "ВШИТЬ" в тело запроса. Там появится новое св-во userId
  if (token) {
    try {
      // Декодируем токен и помещаем сюда его содержимое при помощи секретного ключа
      // (ключ который был при шифровании при авторизации / логгир)
      // (там _id, которое шифруется при log или auth)
      const decoded = jwt.verify(token, "secret123");

      // Вшиваем userId в запрос req
      req.userId = decoded._id;

      // Передаем дальше действи (middleware закончен)
      next();
      // или нет доступа (если токен не верен)
    } catch (error) {
      res.status(403).json({
        message: "Нет доступа",
      });
    }
    // ошибка (если токен не передан)
  } else {
    res.status(403).json({
      message: "Нет доступа",
    });
  }
};
``` 

<br>
<hr>

<h3>+ Получение информации о пользователе</h3>

- [x] Как только `middleware` отработал успешно - он передает выполнение фенкции дальше. Она уже выполнит поиск пользователя и вывелет данные о нем.

+ На основе модели `UserModel` ищем пользователя по id методом `findById()`, как аргумент указал `userId`, который мы вшили в запрос в `middleware`.
+ Если найден пользователь - выводим данные о нем из `user._doc`

```javascript
//    1) роут
//    2) midleware
//    3) функция
app.get("/auth/me", checkAuths, async (req, res) => {
  try {
    // Ищем пользвателя по userId,
    // Его мы вшили в req на этапе middleware
    // Информация о пользователе помещаем в user
    const user = await UserModel.findById(req.userId);

    // User не найден - ошибка
    if (!user) {
      res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    // User найден - достаем все кроме пароля и отдаем на клиент
    // из user._doc
    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData });
    // Ошибка, если в запросе что-то не так
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: "Нет доступа",
    });
  }
});

``` 
