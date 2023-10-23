import mongoose from "mongoose";
import CommentsModel from "../models/Comments.js";
import PostModel from "../models/Post.js";

const create = async (req, res) => {
  const createCommentsSession = await mongoose.startSession();
  createCommentsSession.startTransaction();

  try {
    const postId = req.params.id;

    const newComment = new CommentsModel({
      user: req.userId,
      text: req.body.text,
      post: postId,
    });

    await newComment.populate("user");

    const comment = await newComment.save({ createCommentsSession });

    await PostModel.findByIdAndUpdate(
      postId,
      { $push: { comments: comment._id } },
      { new: true }
    ).session(createCommentsSession);

    await createCommentsSession.commitTransaction();
    createCommentsSession.endSession();

    res.json(comment);
  } catch (error) {
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
