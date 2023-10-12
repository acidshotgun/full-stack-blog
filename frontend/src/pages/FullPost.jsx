import React, { useEffect, useState } from "react";

import { Post } from "../components/Post";
import { Index } from "../components/AddComment";
import { CommentsBlock } from "../components/CommentsBlock";
import { useParams } from "react-router-dom";
import axios from "axios";

export const FullPost = () => {
  // Для получения одного поста redux не нужен
  // Используем просто useState, и получаем данные одного поста
  const [data, setData] = useState();
  // Стейт загрузки, который будет выдавать скелетон, пока идет загрузка
  const [isLoading, setIsLoading] = useState(true);

  // Выттаскиваем id (поста) из url
  const {id} = useParams()

  // При открытии useEffect() сделает запрос к посту по полученному id из url
  // Получим промис и обработаем:
  //    1) Поместим ответ (res.data) в стейт
  //    2) Поставим загрузку в false
  //    3) Ошибка
  useEffect(() => {
    axios.get(`http://localhost:4444/posts/${id}`)
      .then(res => {
        setData(res.data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

  // Пока isLoading стоит в true - будет отрисовать скелетон
  // isLoading - пропс который принимает true \ false
  // true = skeleton, false = данные
  // Это логика прописана у компонента Post
  if (isLoading) {
    return <Post isLoading={isLoading}/>
  }

  // Рендерим подставляя данные уже полученные и добавленные в стейт data
  return (
    <>
      <Post
        id={data._id}
        title={data.title}
        imageUrl={data.imageUrl}
        user={{
          avatarUrl: data.user.avatarUrl,
          fullName: data.user.fullName,
        }}
        createdAt={data.createdAt}
        viewsCount={data.viewsCount}
        commentsCount={3}
        tags={data.tags}
        isFullPost
      >
        <p>{data.text}</p>
      </Post>
      <CommentsBlock
        items={[
          {
            user: {
              fullName: "Вася Пупкин",
              avatarUrl: "https://mui.com/static/images/avatar/1.jpg",
            },
            text: "Это тестовый комментарий 555555",
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
      >
        <Index />
      </CommentsBlock>
    </>
  );
};
