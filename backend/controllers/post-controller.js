import PostModel from "../models/Post.js";

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

    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 400,
      message: "Не удалось создать пост",
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

export { create, getAll };
