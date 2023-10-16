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
