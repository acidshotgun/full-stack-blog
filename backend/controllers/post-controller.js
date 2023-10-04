import mongoose from "mongoose";
import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";

// Создание поста
const create = async (req, res) => {
  const createPostSession = await mongoose.startSession();
  createPostSession.startTransaction();

  try {
    const newPost = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await newPost.save({ createPostSession });

    await UserModel.findByIdAndUpdate(
      req.userId,
      { $push: { posts: post._id } },
      { new: true }
    ).session(createPostSession);

    await createPostSession.commitTransaction();
    createPostSession.endSession();

    res.json(post);
  } catch (error) {
    await createPostSession.abortTransaction();
    createPostSession.endSession();

    console.log(error);
    res.status(400).json({
      status: 400,
      message: "Не удалось создать пост",
    });
  }
};

// Удаление поста
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

// Получить все посты
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

// Получение одного поста
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

// Обновление поста
const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.findByIdAndUpdate(
      postId,
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        user: req.userId,
      },
      {
        new: true,
      }
    );

    res.json({
      message: `Пост ${postId} изменен`,
    });
  } catch (error) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось изменить статью",
    });
  }
};

export { create, getAll, getOne, remove, update };
