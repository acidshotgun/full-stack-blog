import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";

import { Post } from "../components/Post";
import { Index } from "../components/AddComment";
import { CommentsBlock } from "../components/CommentsBlock";
import { useParams } from "react-router-dom";
import axios from "../services/axiosConfig";

export const FullPost = () => {
  // Для получения одного поста redux не нужен
  // Используем просто useState, и получаем данные одного поста
  const [data, setData] = useState();

  const userData = useSelector((state) => state.auth.data);

  // Стейт загрузки, который будет выдавать скелетон, пока идет загрузка
  const [isLoading, setIsLoading] = useState(true);

  // Выттаскиваем id (поста) из url
  const { id } = useParams();

  // При открытии useEffect() сделает запрос к посту по полученному id из url
  // Получим промис и обработаем:
  //    1) Поместим ответ (res.data) в стейт
  //    2) Поставим загрузку в false
  //    3) Ошибка
  useEffect(() => {
    axios
      .get(`/posts/${id}`)
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Пока isLoading стоит в true - будет отрисовать скелетон
  // isLoading - пропс который принимает true \ false
  // true = skeleton, false = данные
  // Это логика прописана у компонента Post
  if (isLoading) {
    return <Post isLoading={isLoading} />;
  }

  // Рендерим подставляя данные уже полученные и добавленные в стейт data
  return (
    <>
      <Post
        id={data._id}
        title={data.title}
        imageUrl={data.imageUrl ? data.imageUrl : ""}
        user={{
          avatarUrl: data.user.avatarUrl,
          fullName: data.user.fullName,
        }}
        createdAt={data.createdAt}
        viewsCount={data.viewsCount}
        commentsCount={data.comments.length}
        tags={data.tags}
        isFullPost
      >
        <ReactMarkdown children={data.text} />
      </Post>
      <CommentsBlock items={data.comments} isLoading={false}>
        {userData ? <Index userData={userData} /> : null}
      </CommentsBlock>
    </>
  );
};
