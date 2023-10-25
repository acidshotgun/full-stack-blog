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

<br>
    
- [x] ПРО next() в middlewear и сам middlewear
- [x] Как middleware перехватывает запрос и может вклинится в него дополнив или проверить

<br>

- [x] По архетиктуре расписать. Че где лежит и че откудова берет.

<br>
  
- [x] Расписать подробнее про связи в mongoose mongoose.Schema.Types.ObjectId, ref, и тд
- [x] .populate("user").exec(); $push $pull и как поле отображает данные не в id а как подробные данные на основе связей.
- [x] ГДЕ УКАЗЫВАЕТСЯ .populate() в запросе????
- [x] Вложенный .populate("user") 
- [x] Транзакции в MongoDB (Есть в любой бд!!) Важно! (Атомарная операция)

<br>

- [x] Axios и перехватчик запросов + настройки (create())

<br>
<br>
<hr>

# ДОМАШКА

<h3>+ Комментарии к постам</h3>

- [x] Модель комментов
- [x] Связь комментов с юзером и постом (у коммента есть автор / у постов есть комментарии)
- [x] .populate() когда нужна вложенность (после создания экземпляра модели)
- [x] Как получаем коммента на фронте (они лежат в стейте у каждого поста)
- [x] Удаление комментоа?

<br>

- [x]  ДОПИСАТЬ ПО НЕПОНЯТНЫМ ТЕМАМ (ВЫШЕ)

# КОММЕНТАРИИ BACKEND

- [x] Для комментариев создается модель - это отделньая сущность в БД и связывается с постами и юзером
- [x] Комментарий создается при помощи запроса как объект в БД. Затем добавляется к объекту поста в бд.
- [x] Создание комментов на фронте - при помощи redux
- [x] Удаление поста - удаляет комментарии, которые привязаны к этому посту.

<br>

<h3>+ Создание поста</h3>

- [x] Первое - это модель комментария в БД

+ Коммент имеет автора, текст, пост где оставлен
+ Связываем коммент с автором и постом при помощи `ref`.

```javascript
import mongoose from "mongoose";

// Коммент имеес связь с постом и юзером
// Поскольку у коммента есть автор и пост, где он оставлен
const СommentsSchema = new mongoose.Schema(
  {
    // Автор - связь(ref) с User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    // Пост - связь(ref) с Post
    // Чтобы знать автора коммента (отображать его)
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comments", СommentsSchema);
```

<br>

<h3>+ Связь коммента с Post и User</h3>

- [x] Необходимо связать посты и юзера с комментарием.
    
+ Причина - пост содержит в себе массим в оставленными у него комментам (`objectId этих комментов`). Это поможет отрисовать эти комменты при получении поста.
+ Это нужно для удаления комментов вместе с постом.

```javascript
const PostSchema = new mongoose.Schema(
  {
    // ... остальные св-ва поста

    // Комменты - это массив из ссылок на поста (type: ObjectId и ref этих комментов)
    // ref - это связывание с конкретной моделью
    // Изначально будет пустой массив - []
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
  },
);
```

<br>

<h3>+ Создание коммента / comments-route</h3>

- [x] Для создания коммента вы будем делать запрос по роуту, `:id` которого - это `id поста`. Так мы будем по сути в запросе получаем `id` поста, которому нужно добавить коммент.

+ К роуту `"/comments/:id"` будет подставлен `id поста`. (Он будет доставаться из url на странице поста и подставлен к запросу)
+ В контроллере получим `id` и сделаем по нему запрос к посту, чтобы добавить коммент после создания коммента в БД.
+ `checkAuths` - прежде всего проверить авторизацию пользователя. + Вшивать в запрос `userId` - `id` юзера из `jwt-токена`.
```javascript
import express from "express";
import * as CommentsContoller from "../controllers/comments-controller.js";
import checkAuths from "../utils/checkAuths.js";

const router = express.Router();

// Роут на создание коммента
// :id в данном случае - это _id поста, для которого будет создаваться комментарий
// в :id идет id, который будет поулчаться из url на странице
router.post("/comments/:id", checkAuths, CommentsContoller.create);

export default router;
```

<br>

<h3>+ Создание коммента / comments-controller</h3>

- [x] Тут задача создать комментарий в БД + добавить этот комментарий в массив комментариев у поста, чтоб при открытии поста видеть его комменты + их кол-во.
- [x] Комменты ниже в коде. 

```javascript
import mongoose from "mongoose";
import CommentsModel from "../models/Comments.js";
import PostModel from "../models/Post.js";

// Создание коммента
const create = async (req, res) => {
  // Сессия, тк два действия:
  //    1) Создание коммента в БД
  //    2) Изменение поста - добавить в массив комментов новый коммент
  const createCommentsSession = await mongoose.startSession();
  // Старт транзакции
  createCommentsSession.startTransaction();

  try {
    // Достаем id из запроса - это будет id поста
    const postId = req.params.id;

    // Создаем коммент используя модель
    //    1) user - тут будет id пользователя, оставившего коммент (его ObjectId)
    //          (помним - он вшивается в checkAuths)
    //    2) text - передается в теле - это коммент
    //    3) postId - это id поста, который достали за url запроса
    //          (нужен будет для удаления комментов при удалении поста + это информация)
    const newComment = new CommentsModel({
      user: req.userId,
      text: req.body.text,
      postId: postId,
    });

    // .populate("user") - вместо ObjectId у user получаем его данные
    //  Нужно для отображаения его данных когда загружаем список комментов поста.
    await newComment.populate("user");

    // Сохраняем коммент в бд + ответ в переменную (созданный коммента)
    // + сессия))
    const comment = await newComment.save({ createCommentsSession });

    // Тут нужно найти пост по тому же postId и добавить ему этот коммент в массив
    await PostModel.findByIdAndUpdate(
      postId,
      { $push: { comments: comment._id } },
      { new: true }
    ).session(createCommentsSession);

    // Все ОК закоммитили + закрыли сессию
    await createCommentsSession.commitTransaction();
    createCommentsSession.endSession();

    // В ответе вернум созданный коммент
    res.json(comment);
  } catch (error) {
    // Ошибка если
    await createCommentsSession.abortTransaction();
    createCommentsSession.endSession();

    console.log(error);

    res.status(400).json({
      status: 400,
      message: "Не удалось создать комментарий",
    });
  }
};

export { create };
```

