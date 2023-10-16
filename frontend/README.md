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

# REDUX-TOOLKIT / Получение постов

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

<br>

<h3>+ Получение постов \ тэгов. useSelector()</h3>

- [x] При загрузке главной страницы будем загружать все посты. При помощи `useEffect()` и `asyncActions`.

- [x] Открываем главную и при помощи хука `useEffect()` и `dispatch` активируем `async actions`, который сделают запросы к серверу и полученные данные поместят в `store`. (Асинхронные экшены описаны в слайсе posts)
- [x] При помощи хука `useSelector()` достаем из хранилища посты и тэги, которые нам нужны. (получаем к ним доступ из компонента).
- [x] Отрисовывается компонент на основе данных из `store`

**[КОМПОНЕНТ Home - Все посты / Тэгт](https://github.com/acidshotgun/full-stack-blog/blob/master/frontend/src/pages/Home.jsx)**

<br>

<h3>+ Получение одного поста \ комменты. useParams()</h3>

- [x] Для получения одного поста открываем страницу по динамическому роуту, который прописан в компоненте `App - <Route path="/posts/:id" element={<FullPost />} />`, где подставляется `id` поста, по которому переходим.
- [x] Хук `useParams` из react-router-dom получит данные о странице, а именно нужен переданный динамически `id`.
- [x] По этому `id` делаем запрос и получаем данные который после записываются в `state`
- [x] Отрисовываем компонент на основе полученных данных + скелетон

**[КОМПОНЕНТ FullPost - Один пост / Комменты](https://github.com/acidshotgun/full-stack-blog/blob/master/frontend/src/pages/FullPost.jsx)**   

<hr>
<br>
<br>

# REDUX-TOOLKIT / АВТОРИЗАЦИЯ / РЕГИСТАРЦИЯ / ВЫХОД

- [x] На этом этапе нужно настроить форму авторизации + настроить запрос, который будет отправляться на сервер и возвращаться нам данные с `jwt-токеном`, который будет сообщать серверу при запросах, что пользователь авторизован и имеет доступ к функционалу. `jwt-токен` будет сохраняться в `local storage`.
- [x] Т.Е. в кратце логика такая:

+ Юзер регается / авторизуется (посылается post-запрос) и с серва возвращается ин-фа + токен. Эта логика обрабатывается в `authSlice`.

<br>

+ Полученные данные записываются в `state` + в `local storage` помещается токен. Этот токен будет вшиваться в запросы, чтобы сервер понимал, что пользователь авторизован и имеет доступ к функционалу.
  
<br>

+ Чтобы при обновлении страницы `state` не очищался - мы имеем запрос для проверки авторизации. Он будет отправляться каждый раз, при обновлии страницы. Это обеспечивается при помощи хука `useEffect()`, который всегда будет срабатывать на самом верхнем уровне в компоненте `App.js`.

<br>

+ В `App.js` хук `useEffect()` каждый раз делает запрос (с токеном), на сервер и повторяет логику авторизации, т.е. получает с сервера данные о пользователе, которые помещаются в `state` (но в этом случае без токена, тк он итак лежит в `local storage`). + Этот запрос отправляется вместе с токеном, чтобы сервер видел, что юзер авторизован.

<br>
  
+ Чтобы запрос на сервер отправлялся с токеном в `headers.Authorization` - в каждый `axios-запрос` будет вшиваться этот токен. Если он есть - то ОК, если его нет - пользователь не авторизован.

<br>

+ Эта логика позволит пользователю быть авторизованным, не перезаходить в приложение, видеть контент для зарегестрированных пользователей.

<br>

- [x] Создадим `authSlice`, в котором описана логика по оплучению данных о пользователе + токен с сервера и помещение их в глобальный стейт.

```javascript
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../services/axiosConfig";

// Начальное состояние
// изначально data пустая + статус
const initialState = {
  data: null,
  status: "idle",
};

// async action для пост запроса на логгирование.
// Принимает в себя params с клиента - это объект из формы (formData)
//  1)  email
//  2)  password
// Запрос возвращает данные + токен = помещаем с глобал стейт
export const fetchAuth = createAsyncThunk("auth/fetchAuth", async (params) => {
  const response = await axios.post("/auth/login", params);
  return response.data;
});

// async action для проверки авторизации
// Этот запрос будет отправляться в App.js хуком useEffect()
//    В каждый запрос мы вшиваем токен из loacl storage
//    Если он есть, то запрос вернет данные о пользователе 
//    и поместит сюда в стейт по аналогии с логгированием
//    Только это нужно, чтобы пользователь не заходил заново при обновлении страницы.
//    Если выйти из приложения то токен удалиться и этот запрос не будет ничего возвращать
//          до тех пор, пока снова не авторизуемся.
export const fetchAuthMe = createAsyncThunk("auth/fetchAuthMe", async () => {
  const response = await axios.get("/auth/me");
  return response.data;
});

// slice логгирования
//  (для хранения полученной с сервера ин-ф о пользователе + его токен)
// reducers
// Обрабатывает extraReducers получения данных при пост запросе
// записывает в state эти данные
const authSlice = createSlice({
  name: "auth",
  initialState,
  // reducers logout (выход)
  // При выходе нужно очистить global state с данными юзера и его токен
  // Будет вешаться на кнопку выхода и через dispatch запускаться
  reducers: {
    // reducer - очищает стейт
    // Логика выхода из аккаунта
    // + в компоненте отдельно удаляем токен из loacl storage
    logout: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    // Обработка async action логгировния
    // Помещает данные о пользователе в стейт
    builder.addCase(fetchAuth.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchAuth.fulfilled, (state, action) => {
      state.status = "idle";
      state.data = action.payload;
    });
    builder.addCase(fetchAuth.rejected, (state) => {
      state.status = "error";
      state.data = null;
    });

    // Обработка async action на проверку авторизации
    // Аналогично помещает данные о пользователе в стейт
    builder.addCase(fetchAuthMe.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchAuthMe.fulfilled, (state, action) => {
      state.status = "idle";
      state.data = action.payload;
    });
    builder.addCase(fetchAuthMe.rejected, (state) => {
      state.status = "error";
      state.data = null;
    });
  },
});

// То, что возвращает слайс
const { actions, reducer } = authSlice;

// Эта переменная сообщает, что в стейте есть данные о пользователе
// Есть - true | нет - false
// Нужна, для отрисовки нужных данных если пользователь авторизован или нет
export const selectIsAuth = (state) => Boolean(state.auth.data);

// Редюсер, помещаемы в store
export const authReducer = reducer;
// Это action, для очистки стейта
//  (выход из аккаунта)
export const { logout } = actions;
```

<br>

<h3>+ Авторизация</h3>










