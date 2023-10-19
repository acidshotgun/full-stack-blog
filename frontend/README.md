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

// async action для геристрации пользователя
// Аналогично с авторизацией, только по другому роуту
// Так же будет записывать данные в стейт при успешной регистрации
// (АНАЛОГИЧНО)
export const fetchRegister = createAsyncThunk(
  "auth/fetchRegister",
  async (params) => {
    const response = await axios.post("/auth/register", params);
    return response.data;
  }
);

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

    // Обработка async action на регистраци.
    // Аналогично помещает данные о пользователе в стейт
    builder.addCase(fetchRegister.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchRegister.fulfilled, (state, action) => {
      state.status = "idle";
      state.data = action.payload;
    });
    builder.addCase(fetchRegister.rejected, (state) => {
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

- [x] Страница `Login` содержит в себе форму регистрации. Там все понятно. Отметим лишь запрос.
- [x] Логика:

+ Форма `useForm` собирает и отправляет данные на сервер при помощи `async action fetchAuth(values)` с данными из формы
+ `fetchAuth` внутри себя делает пост запрос по роуту `/auth/login` с этими данными на сервер.
+ Данные отправляются на сервер и внутри логика из `backend` ищет юзера по email и сравнивает пароль с зашифрованным в БД.
+ Если все ОК, то с серва получаем `данные + токен`, которые записываем в глобал стейт `auth`. + токен помещаем в `local storage`.
+ `isAuth` становится `true`, тк теперь в стейте есть данные и происходит редирект на гланую страницу.
+ **`USER АВТОРИЗОВАН В ПРИЛОЖЕНИИ`**

```javascript
// isAuth - это переменная selectIsAuth в слайсе authSlice
//   Она содержит true / false, в зависимости от того, есть ли в нашем глобальном стейте какие либо данные о пользователе
//   Если true - значит мы авторизованы / если false - значит стейт пуст и мы не авторизованы.
const isAuth = useSelector(selectIsAuth);

 // Логгирование
  // Форма отправляет введенные данные на серве, где они проверяются
  // В dispatch вызываем async action для логгирования.
  const onSubmit = async (values) => {
    const data = await dispatch(fetchAuth(values));
    console.log(data);

    // dispatch всегда возвращает информацию о выполненом действии
    // Там содержится и payload (то что ), если все ОК
    // Если НЕ ОК - то это ошибка - не удалось
    if (!data.payload) {
      return alert("Не удалось авторизоваться");
    }

    // Если есть токен в data.payload, то мы поместим его в local storage
    if ("token" in data.payload) {
      window.localStorage.setItem("token", data.payload.token);
    }
  };

  // Перенаправляем пользователя на главную, если isAuth - true
  if (isAuth) {
    return <Navigate to={"/"} />;
  }
```

<br>

<h3>+ Выкидывает / Как оставаться в приложении???</h3>

- [x] Проблема заключается в том, что если обновить страницу, то `redux - хранилище будет очищено`. А именно хранилище `auth` в нашем сторе.
- [x] Поскольку хранилище пустое то и юзер не будут видеть доступный функционал. Нужно дать понять приложению, что пользователь все еще авторизован.
- [x] Это будет происходить с использованием полученного токена, который хранится в `local storage` очень долго. И постоянных запросах при обновлении страницы.
- [x] И логика:

<br>

+ Первое, что нужно сделать - это дополнить наш запрос `axios` спец. middleware, который будет добавлять в каждый запрос токен из `local storage`.
+ Как мы помнить в backend есть такой контроллер, который проверяет авторизацию пользователя по наличию у него токена. (Там еще middleware, который прехватывает запрос расшифровывает этот токен и проверяет его - если он активен - то запрос проходит дальше / если нет, то токена нет и пользователь не авторизован.)

+ Второй пункт
  
```javascript
import axios from "axios";

// Это файл настройки axios
// Этот код представляет собой создание экземпляра Axios
// с определенными настройками и добавление Request Interceptor (перехватчика запросов) к этому экземпляру.

// Это экземпляр запроса с настройками
//    1) Базовый url по которому будет идти запрос
// К нему уже будут подставлять роуты = не надо прописывать роут полность.
const request = axios.create({
  baseURL: "http://localhost:4444",
});

// Тут добавляем к нашему запросу перехватчик запросов (interceptors.request)
//    1) Тут мы перехватываем запрос и добавляем к нему Authorization в headers
// и помещяем туда token, который хранится в local storage
// так при каждом запросе будет проверка - авторизирован пользователь чи нет (есть токен чи нет)
//    2) Если сервер не получит токен в авторизации - будет ошибка (там где этот токен нужен)
request.interceptors.request.use((config) => {
  config.headers.Authorization = window.localStorage.getItem("token");
  return config;
});

// Экспортируем настроенный файл
// Тепер ьвезде где есть аксиос импортируем отсюда. Это как эеземпляр
export default request;
```

<br>

+ Во-вторых, нужно создать `async action` - событие, которое будет срабатывать каждый раз, когда обновляется страница. В `authSlice` - это `fetchAuthMe`.
+ Т.е. Каждый раз при обновлении страницы мы каждый раз снова вызываем `fetchAuthMe`, используя токен в приложении, которыз отправляет запрос к серверу и получает данные о юзере и записывает в стейт, как при регистрации.
+ Отличие - мы не получаем токен, тк он не нужен. Он и так лежит в `local storage` постоянно и запрос проходит вместе с ним. Если токена нет - то запрос не выполнится.

<br>

+ Для запросов - на самом верхнем уровне (это компонент `App`) при помощи хука `useEffect()` отправляем запросы.
+ Поскольку это самый верхний компонент - все компоненты рендерятся в нем. И обновление страницы вызовент ререндер компонента `App` и хук `useEffect()` будет посылать запрос.

```javascript
function App() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);

  // Посылаем запрос проверки авторизации
  // Чтобы не выкидывало из приложения
  useEffect(() => {
    dispatch(fetchAuthMe());
  }, []);

  return (
    <>
      //КОМПОНЕНТЫ ПРИЛОЖЕНИЯ
    </>
  );
}
```

<br>

- [x] Как итог - имея токен, котоырй будет вшиваться во все запросы, запрос `fetchAuthMe` из слайса будет с токеном делать запросы к серу и получая постоянно положительный ответ - позволит оставаться пользователю в приложении.
- [x] Это позволит юзерю видеть контент для зареганных пользователей и постоянно не авторизовываться заново.

<br>

- [x] И в зависимости от авторизации будем отрисовывать разные кнопки в хедере. Для этого проверяем есть ли токен в `local storage` и есть ли данные в стейте `isAuth`.

```javascript
          <div className={styles.buttons}>
      {/* Есть токен или isAuth = отрисовка контента в зависимости от авторизации */}
            {window.localStorage.getItem("token") || isAuth ? (
              <>
                <Link to="/add-post">
                  <Button variant="contained">Написать статью</Button>
                </Link>
                <Button
                  onClick={onClickLogout}
                  variant="contained"
                  color="error"
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outlined">Войти</Button>
                </Link>
                <Link to="/register">
                  <Button variant="contained">Создать аккаунт</Button>
                </Link>
              </>
            )}
          </div>
```

<br>

<h3>+ Регистрация / Создание юзера</h3>

- [x] Логика регистрации такая же как и при логгировании.
- [x] Форма собирает введенные данные и и эти данные отправляются на сервер по нужному роуту.
- [x] На сервере эти данные обрабатываются / валидируются и если все ОК - пользователь создается в БД

<br>   

- [x] Запрос делается так же при помощи `async action`, поэтому получаемые данные (+ токен) помещаются в глобал стейт `(из action payload)`.
- [x] В случае ошибок / ошибок валидаций - сервер вернет соответствующее сообщение с ошибкой.

+ Компонент использует хук `useForm()` + код ниже

**[КОМПОНЕНТ РЕГИСТРАЦИИ](https://github.com/acidshotgun/full-stack-blog/blob/master/frontend/src/pages/Registration/index.jsx)**

<br>

<h3>+ Logout / Выход из аккаунта</h3>

- [x] Выход из аккаунта - проще простого.
- [x] Задача - очистить стейт, чтобы контент, который будет отрисоваваться был для незарегистрированного юзера
- [x] + Удалить токен из `local storage`.

+ В слайсе умеется reducer `logout`, который и будет очищать стейт.

```javascript
  reducers: {
    // reducer - очищает стейт
    // Логика выхода из аккаунта
    // + в компоненте отдельно удаляем токен из loacl storage
    logout: (state) => {
      state.data = null;
    },

// + НЕ ЗАБЫВАЕМ ЕГО ДОСТАТЬ
// ЧТОБЫ ИСПОЛЬЗОВАТЬ ИЗ ВНЕ

// То, что возвращает слайс
const { actions, reducer } = authSlice;

// Это action, для очистки стейта
//  (выход из аккаунта)
export const { logout } = actions;
  },
```  

<br>

+ В копмоненте `header` создаем метод для выхода. По нажатию кнопки будет очищаться стейт + удаляется токен из хранилища
+ Стейт пустой = `selectIsAuth` в слайсе пустой = интерфейс будет отрисован как для незарегистрированного пользователя.

```javascript
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);

  // Выход из аккаунта
  //  1) Вызываем reducer для очистки стейта
  //  2) Удаляем токен из local storage
  const onClickLogout = () => {
    if (window.confirm("Вы хотете выйти?")) {
      dispatch(logout());
      window.localStorage.removeItem("token");
    }
  };
```

<hr>
<br>
<br>

# УДАЛЕНИЕ ПОСТА ТОЛЬКО ЗАРЕГИСТРИРОВАННОМУ ЮЗЕРУ!!!

- [x] Пользователь может изменять / удалять только свои посты.
- [x] Логика:

+ При наведении на пост появляется плашка где можно изменить / удалить пост. Эту плашку должен видеть только автор поста (если он авторизован). Нужно чтобы приложение знало, что это его пост.
+ У компонента `Post` есть проп `isEditable`, принимающий true / false. Этот проп отвечает за отрисовку той самой плашки.
+ Необходимо достать `_id` юзера и `_id` поста и сравнить их. Если равны (true) - плашка отрисовывается и наобород.
+ Создадим переменную `userData` в компоненте `Home` и поместим в нее данные юзера из глобал стейта и затем сравним их при отрисовке компонентов `Post`

```javascript
export const Home = () => {
// ПОлучаем данные о пользователе из стейта
  const userData = useSelector((state) => state.auth.data);
// Данные о постах из стейта для отрисовки + тэги
  const { posts, tags } = useSelector((state) => state.posts);

  return (
// Перебираем посты и отрисовываем их
   posts.items.map((item) => {
    return (
      <Post
        id={item._id}
        title={item.title}
        imageUrl={item.imageUrl}
        user={{
          avatarUrl: item.user.avatarUrl,
          fullName: item.user.fullName,
        }}
        createdAt={item.createdAt}
        viewsCount={item.viewsCount}
        commentsCount={3}
        tags={item.tags}
  // Пропс isEditable, который отвечает за отрисовку плашки редактирования
  // Принимает результат сравнения true / false (id юзера из стейта и id юзера в авторе поста)
        isEditable={userData?.userData._id === item.user._id}
      />
    );
  })
```  

<hr>
<br>
<br>

# СОЗДАНИЕ СТАТЬИ

<br>

<h3>+ Не авторизован - не можешь</h3>

- [x] Неавторизованный юзер может перейти по ссылке и попасть на форму создания поста. Если он не авторизован - используем компонент `<Navigate />` из `react-router-dom`, который уже использовали и перенаправляем на форму регистрации. Это в компоненте `Add-post`

```javascript
  // Если юзер не авторизован - направляем на регистрацию
  // Чтобы не зашел по этому роуту если он не авторизован
  // Через isAuth, проверяем если данные в стейте (авторизован ли)
  if (!isAuth) {
    return <Navigate to={"/register"} />;
  }
```

<br>

<h3>+ Создание статьи / react-simplemde-editor</h3>

- [x] Для создания статьи используется библиотека `react-simplemde-editor`. Это библиотека, которая позволяет создавать посты как в гитхаб с разными разметками.
- [x] Hook form тут не нужен.
- [x] + Redux тут не нужен достаточно локального стейта 

<br>

- [x] Данные которые вводятся в полях будут записаны в соответствующие стейты при помощи двустороннего связывания.

**[КОМПОНЕНТ СОЗДАНИЯ ПОСТА](https://github.com/acidshotgun/full-stack-blog/blob/master/frontend/src/pages/AddPost/index.jsx)**

- [x] ПРИМ. Чтобы разметка MarkDown отображалась корректно - нужна библиотека `react-markdown`

```javascript
// Это компонент, в который пропсом children помещяется текст. Он будет отображаться корректно.
<ReactMarkdown children={data.text} />
```

<br>

<h3>+ Загрузки картинки на сервак</h3>

- [x] Логика тут отстой но напишу. На самом деле это делается иначе, тк в этом способе картинка грузится на сервер еще при ее выборе, а не при отправке статьи на серв.
- [x] Логика здесь:

+ При помощи хука `useRef` создаем ref `inputFileRef`, который будет сяывать кнопку с элементом input, который служит для выбра изображения с компьютера.

```javascript
// Здесь для загрузки картинки используется тэг input с типом type = file
// И при вызове он вызывает ф-ю handleChangeFile, которая при добавлении картинки грузит ее на серв + добавляет в стейт
// При помощи ref - указываем ссылку ref, которую создали
// Этот input скрыт

// Вместо него мы будем нажимать на кнопку Button, которая быдует вызывать input
// При помощи onClick={() => inputFileRef.current.click()}
// Так нажав на кнопку вызовем input, который скрыт

<Button
  onClick={() => inputFileRef.current.click()}
  variant="outlined"
  size="large"
>
  Загрузить превью
</Button>
<input
  ref={inputFileRef}
  type="file"
  onChange={handleChangeFile}
  hidden
/>


// Ф-я, которая проверяет изменилось ли что то в инпуте при помощи event
//  1) Создается FormData
//  2) Получаем файл картинки из event.target.files[0]
//  3) Добавляем этот файл в форму
//  4) Отправляем форму с картинкой на сервер и возвращаем ответ в переменную
//  5) url из data помещаем в стейт imageUrl - это ссылка на картинку
//  6) Обработка ошибки

// Те. если появляется файл event.target.files[0] - он поместится в FormData
// Затем FormData отправится на серв и вернет data
// url картинки помещаем в стейт
const handleChangeFile = async (event) => {
  try {
    const formData = new FormData();
    const file = event.target.files[0];
    formData.append("image", file);
    const { data } = await axios.post("/upload", formData);
    setImageUrl(data.url);
  } catch (error) {
    console.log(error);
    alert("Ошибка при загрузуке файла");
  }
};
```

<br>

<h3>+ Отправка статьи на сервер</h3>

+ При клике на кнопку отправить - мы собираем статью по частям. Это данные из соответств полей в стейтах.
+ Делаем пост запрос по роуту для создания с созданным объектом с данными. В ответе получаем данные о серве (это на бэке прописано).
+ Кстати каждый запрос еще проверяет авторизацию по токену - помним.
+ Если статья создана и вернула нам данные, то достаем _id статьи
+ `navigate(`/posts/${id}`)` - полученный из хука `useNavigate` `react-router-dom` перенаправит на страницу с этой статьеё.  

```javascript
// Отправка статьи на сервер
const onSubmit = async () => {
  try {
    // Загрузка - хз зачем !
    setLoading(true);

    // Собираем статью по полям (из стейтов)
    const fields = {
      title,
      imageUrl,
      // Из строки тегов делаем массив
      tags: tags.split(","),
      text,
    };

    // Достаем data из ответа когда послали статью на серв
    const { data } = await axios.post("/posts", fields);

    // Достаем _id из ответа (это _id статьи)
    //  (Можно указать доп проверки на всякий случай)
    // Типа если статья создана то мы должны получить _id
    // Тк его возвращает сервер вместе с данными о посте
    const id = data._id;

    // Если _id есть то перенаправляем пользователя
    // На страницу с этим постом созданным
    navigate(`/posts/${id}`);
  } catch (error) {
    // Ошибка
    console.log(error);
  }
};
```

<hr>
<br>
<br>

# УДАЛЕНИЕ СТАТЬИ
















# ЗАДАЧИ:

- [x] ПОВТОР КОДА
- [x] ПОДРОБНЕЕ ПРО СТРОЧКУ где есть пропс `isEditable` тк там мы сначала имеем null и потом уже получаем данные о юзере. И если рендерить рсазу то null так и остается, а если ставить ? то обновленный стейт и будет ререндерить проп ЭТО НАДО ЗАВТРА ВСПОМНИТЬ ЧТОБЫ ОПИСАТЬ ГРАМОТНО Я УСТАЛ

- [ ] Короче. Тк получаем данные о юзере не сразу - то изначально имеем null. И в проп проходит null. Необходимо указывать вопросит знак, чтобы было условие, что если юзер есть и у него есть _id. Так код не будет выдвать баг (просто не грузится приложуха). Сначала грузится приложение с null (и не падает) затем когда юзер получен - передается дальше в проп и приложение не падает + компонент ререндерится (для отображения плашки удаления если пользователь авторизован.)

```javascript
                <Post
                  id={item._id}
                  title={item.title}
                  imageUrl={item.imageUrl}
                  user={{
                    avatarUrl: item.user.avatarUrl,
                    fullName: item.user.fullName,
                  }}
                  createdAt={item.createdAt}
                  viewsCount={item.viewsCount}
                  commentsCount={3}
                  tags={item.tags}
                  isEditable={userData?.userData?._id === item.user._id}
                />
```
