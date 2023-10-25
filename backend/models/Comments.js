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
