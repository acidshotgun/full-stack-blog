import mongoose from "mongoose";
import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

const create = async (req, res) => {
  try {
    const newPost = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await newPost.save();

    // Используя модель UserModel мы добавим пользователю пост
    // Находим юзера в базе по userId(из токена) и обновляем его
    // $push (опция) - добавит данные в массив, без обновления всего массива
    // Теперь получая данные о юзере мы видем id всех его постов
    await UserModel.findByIdAndUpdate(
      req.userId,
      { $push: { posts: post._id } },
      { new: true }
    );

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: "Не удалось создать пост",
    });
  }
};

// КОНСПЕТК!!
// Транзакции учить!
const remove = async (req, res) => {
  const deletePostSession = await mongoose.startSession();
  deletePostSession.startTransaction();

  try {
    const postId = req.params.id;

    const deletedPost = await PostModel.findByIdAndDelete(postId).session(
      deletePostSession
    );

    if (!deletedPost) {
      return res.status(404).json({
        message: "Статья не найдена",
      });
    }

    await UserModel.findByIdAndUpdate(
      req.userId,
      { $pull: { posts: postId } },
      { new: true }
    ).session(deletePostSession);

    await deletePostSession.commitTransaction();
    deletePostSession.endSession();

    res.json({
      message: "Пост удален",
    });
  } catch (err) {
    await deletePostSession.abortTransaction();
    deletePostSession.endSession();

    console.log(err);
    res.status(500).json({
      message: "Не удалось удалить статью",
    });
  }
};

const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec();

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: "Не удалось получить посты",
    });
  }
};

// В КУРСЕ НЕ РАБОТАЕТ ВАРИАНТ
// findOneAndUpdate - теперь возвращает значение
const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const updateResult = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate("user");

    if (!updateResult) {
      return res.status(404).json({
        message: "Статья не найдена",
      });
    }

    res.json(updateResult);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить статью",
    });
  }
};

export { create, getAll, getOne, remove };
