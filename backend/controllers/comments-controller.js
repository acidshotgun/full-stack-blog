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
