import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, fetchTags } from "../redux/slices/posts";

import { Post } from "../components/Post";
import { TagsBlock } from "../components/TagsBlock";
import { CommentsBlock } from "../components/CommentsBlock";

export const Home = () => {
  // Достаем dispatch
  // И наши состояния из store (store => posts =>{ posts, tags })
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.data);
  const { posts, tags } = useSelector((state) => state.posts);

  // При запуске с помощью dispatch
  // Отправляем async actions для получения постов и тэгов
  // Достаем их выше
  useEffect(() => {
    dispatch(fetchPosts());
    dispatch(fetchTags());
  }, []);

  console.log(userData);

  // Вариант получить true|false
  // Для отображения скилетона у тэгов
  // У компонента Post \ TagsBlock есть проп isLoading - если он true - будет скелетон
  // Если false - рендерим пост с данными
  // Т.е если условие ниже верно то = true. Напротив = false
  // Оно и подставляется в компонент Post \ TagsBlock
  const isTagsLoaded = tags.status === "loading";
  const isPostsLoaded = posts.status === "loading";

  return (
    <>
      <Tabs
        style={{ marginBottom: 15 }}
        value={0}
        aria-label="basic tabs example"
      >
        <Tab label="Новые" />
        <Tab label="Популярные" />
      </Tabs>
      <Grid container spacing={4}>
        <Grid xs={8} item>
          {/* Рендерим посты */}
          {/* Если posts.status = "loading" */}
          {/* Отррендерим 5 Post при помощи массива undefined */}
          {/* Где isLoading={false} - это отрендерит 5 скелетонов */}
          {posts.status === "loading" ? (
            [...Array(5)].map((item, i) => (
              <Post key={i} isLoading={isPostsLoaded} />
            ))
          ) : // Либо ошибка
          posts.status === "error" ? (
            <div>Произошла ошибка</div>
          ) : (
            // Когда посты загружены и posts.status = idle
            // Мапим посты и отрисываем
            // Компонент Posts уже isLoading={fasle} будет, что уберет скелетон и отрисует данные
            posts.items.map((item) => {
              return (
                <Post
                  id={item._id}
                  title={item.title}
                  imageUrl={item.imageUrl ? item.imageUrl : ""}
                  user={{
                    avatarUrl: item.user.avatarUrl,
                    fullName: item.user.fullName,
                  }}
                  createdAt={item.createdAt}
                  viewsCount={item.viewsCount}
                  commentsCount={item.comments.length}
                  tags={item.tags}
                  isEditable={userData?._id === item.user._id}
                />
              );
            })
          )}
        </Grid>
        <Grid xs={4} item>
          {/* Рендер тегов */}
          {/* Аналогично как и посты */}
          <TagsBlock items={tags.items} isLoading={isTagsLoaded} />
          <CommentsBlock
            items={[
              {
                user: {
                  fullName: "Вася Пупкин",
                  avatarUrl: "https://mui.com/static/images/avatar/1.jpg",
                },
                text: "Это тестовый комментарий",
              },
              {
                user: {
                  fullName: "Иван Иванов",
                  avatarUrl: "https://mui.com/static/images/avatar/2.jpg",
                },
                text: "When displaying three lines or more, the avatar is not aligned at the top. You should set the prop to align the avatar at the top",
              },
            ]}
            isLoading={false}
          />
        </Grid>
      </Grid>
    </>
  );
};
