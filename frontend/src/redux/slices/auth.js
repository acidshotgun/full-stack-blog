import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../services/axiosConfig";

// Начальное состояние
// изначально data пустая
const initialState = {
  data: null,
  status: "idle",
};

// async action для пост запроса на логгирование.
// Принимает в себя params с клиента - это объект из формы (formData)
export const fetchAuth = createAsyncThunk("auth/fetchAuth", async (params) => {
  const response = await axios.post("/auth/login", params);
  return response.data;
});

export const fetchAuthMe = createAsyncThunk("auth/fetchAuthMe", async () => {
  const response = await axios.get("/auth/me");
  return response.data;
});

// slice логгирования
// Обрабатывает extraReducers получения данных при пост запросе
// записывает в state эти данные
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
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

const { actions, reducer } = authSlice;

export const selectIsAuth = (state) => Boolean(state.auth.data);

export const authReducer = reducer;
export const { logout } = actions;
