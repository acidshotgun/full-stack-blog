import { configureStore } from "@reduxjs/toolkit";
// Импорт reducers
import { postReducer } from "./slices/posts";

const store = configureStore({
  reducer: {
    posts: postReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
