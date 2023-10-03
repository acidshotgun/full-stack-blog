import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    // Автор / создатель статьи - это пользователь и он должен отображаться тут
    //   1) type -В user мы должны хранить id пользователя.
    // Но в mongo это не просто строчка, а ObjectId
    // поэтому указываем специальный тип (по пути)
    //    (это один из спец. типов внутри mongodb)
    //   2) ref - св-во user ссылается на модель (тут User)
    //    (т.е делаем связь между двумя таблицами)
    //   3) Обязательное
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      default: [],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    imageUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", PostSchema);
