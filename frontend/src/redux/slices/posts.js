import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../services/axiosConfig";

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
  const response = await axios.get("/posts");
  return response.data;
});

// Асинк запрос за получение тегов
export const fetchTags = createAsyncThunk("tags/fetchTags", async () => {
  const response = await axios.get("/tags");
  return response.data;
});

// Асинк запрос на удаление поста
export const fetchRemovePost = createAsyncThunk(
  "posts/fetchDeletePost",
  async (id) => {
    const response = await axios.delete(`/posts/${id}`);
    // В первом варианте звпрос вернет id поста в action.payload
    return id;

    // Второй вариант, чтобы вернуть сообщение с сервера.
    // Разница показана в extra reduser
    // return response.data;
  }
);

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

    // FETCH DELETE POST
    // ПРИМ. pending и rejected тут икак не обработаны
    // Поскольку там мы указываем состояние loading, а от него зависит отрисовка постов
    // Если они будут меняться, то посты будут перерисовываться, на скелетон и обратно
    // ( ЭТО МОЖНО ОБРАБОТАТЬ И ИНАЧЕ = ВАРИКОВ МНОГО)
    builder.addCase(fetchRemovePost.pending, (state) => {});
    builder.addCase(fetchRemovePost.fulfilled, (state, action) => {
      state.posts.items = state.posts.items.filter(
        // Первый вариант, где в payload - будет лежать id
        // по этому id и отфильтруем стейт
        (item) => item._id !== action.payload

        // Второй вар, где в payload будет лежат ответ с сервера (пост удален)
        //      соотв. фильтрация не пройдет
        // В этом случае нужно обратится к action.meta.arg,
        //        где и будет лежать переданный в action id поста
        // (item) => item._id !== action.meta.arg
      );
    });
    builder.addCase(fetchRemovePost.rejected, (state) => {});
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
