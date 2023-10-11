# FRONTEND

<h2>ROUTES</h2>

<h3>+ React Router Dom</h3>

- [x] Первым делом необходимо подключить роуты, которые будут перенаправлять между страницами.
- [x] ПРИМ. Компонент `BrowserRoutes` оборачивает все приложение в компоненте `App` в нашем случае.

```javascript
root.render(
  <>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <Router>
        <Provider store={store}>
          <App />
        </Provider>
      </Router>
    </ThemeProvider>
  </>
);
``` 

```javascript
import { Routes, Route } from "react-router-dom";

import Container from "@mui/material/Container";
import { Header } from "./components";
import { Home, FullPost, Registration, AddPost, Login } from "./pages";

function App() {
  return (
    <>
      <Header />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<FullPost />} />
          <Route path="/add-post" element={<AddPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
```

<hr>
<br>
<br>

# REDUX-TOOLKIT

- [x] Логика такая - мы будем делать асинхронные запросы к серверу, для получения постов / тегов при помощи `createAsyncThunk`
- [x] Полученные данные будут записываться в `глобальный стейт`.
- [x] В компонентах мы при помощи `useSelector` достаем нужные объекты из состояния и работаем с ними. (так же возможен `createSelector`, если имеем несколько `slices` отдельно но хотим использовать их вместе).
- [x] Отрисовываем компоненты на основе данных из `redux - хранилища`

<br>

<h3>+ Создаем slice</h3>

+ `initialState` - начальное состояние. В нашем состоянии будут посы и тэги.
+ `Async actions` - асинхронные запросы к серверу.
+ `slice` с нашим `состоянием + action + reducers`

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Начальное состояние
const initialState = {
  posts: {
    items: [],
    status: "idle",
  },
  tags: {
    items: [],
    status: "idle",
  },
};

// Async actions для запросов к серву
// Обязательно export их отдельно
// Асинк запрос за получение постов
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
  const response = await axios.get("http://localhost:4444/posts");
  return response.data;
});

// Асинк запрос за получение тегов
export const fetchTags = createAsyncThunk("tags/fetchTags", async () => {
  const response = await axios.get("http://localhost:4444/tags");
  return response.data;
});

// Сам slice (одновременно создаем actions и reducers) - содержит:
//  1) Имя
//  2) Начальное состояние (подставляется)
//  3) reducers (тут пусто, тк нет reducers, которые изменяли бы стейт)
//  4) extraReducers - содержат асинхронные actions, тк они не являются частью reducers
const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},

  // extraReducers (для async actions) - изменяют стейт, помещая данные с сервера в стейты
  //  1) Изменяют состояния posts и tags
  //  2) Изменяют состояния загрузок
  extraReducers: (builder) => {
    // FETCH POSTS
    builder.addCase(fetchPosts.pending, (state) => {
      state.posts.status = "loading";
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.posts.status = "idle";
      state.posts.items = action.payload;
    });
    builder.addCase(fetchPosts.rejected, (state) => {
      state.posts.status = "error";
    });

    // FETCH TAGS
    builder.addCase(fetchTags.pending, (state) => {
      state.tags.status = "loading";
    });
    builder.addCase(fetchTags.fulfilled, (state, action) => {
      state.tags.status = "idle";
      state.tags.items = action.payload;
    });
    builder.addCase(fetchTags.rejected, (state) => {
      state.tags.status = "error";
    });
  },
});

// В результате postsSlice будет содержать объект с actions и reducers
// Их можно достать деструктуризацией.
//  1) actions - содержит actions и reducers из объекта reducers (тут нет у нас)
//  2) reducers - объеденяет в себе reducers и extraReducers которые указываются в store.
const { actions, reducer } = postsSlice;

// Именуем reducer, который импортируем в store и подставим в поле reduser
// Это будет reducer для слайса postsSlice
export const postReducer = reducer;
```

<br>

<h3>+ Создаем store</h3>

+ `store`, который будет читать приложение.

```javascript
import { configureStore } from "@reduxjs/toolkit";
// Импорт reducers
import { postReducer } from "./slices/posts";

// store (хранилище)
//  1) reducers
//  2) middlewares + уже есть дефолтные
//  3) devTools - для утилиты
const store = configureStore({
  reducer: {
    posts: postReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== "production",
});

// Экспортируем для использования в провайдере
export default store;
```
