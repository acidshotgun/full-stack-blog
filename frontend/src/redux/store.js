import { configureStore } from "@reduxjs/toolkit";
// Импорт reducers
import { postReducer } from "./slices/posts";
import { authReducer } from "./slices/auth";

// store (хранилище)
//  1) reducers
//  2) middlewares + уже есть дефолтные
//  3) devTools - для утилиты
const store = configureStore({
  reducer: {
    posts: postReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== "production",
});

// Экспортируем для использования в провайдере
export default store;
