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
export const fetchAuth = createAsyncThunk(
  "auth/fetchUserData",
  async (params) => {
    const response = await axios.post("/auth/login", params);
    return response.data;
  }
);

// slice логгирования
// Обрабатывает extraReducers получения данных при пост запросе
// записывает в state эти данные
const authSlice = createSlice({
  name: "auth",
  initialState,
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
  },
});

const { actions, reducer } = authSlice;

export const authReducer = reducer;
