import React, { useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";

import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";

import { selectIsAuth } from "../../redux/slices/auth";
import axios from "../../services/axiosConfig";

import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";

export const AddPost = () => {
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = React.useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const inputFileRef = useRef();

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

  const onClickRemoveImage = () => {
    if (window.confirm("Удалить изображение?")) {
      setImageUrl("");
    }
  };

  // Для изменения стейта value
  // Чтобы написанное сохранялось в стейт и выводилось
  // Двустороннее связывание типа
  //    useCallback() так же требует библиотека SimpleMDE
  const onChange = React.useCallback((value) => {
    setText(value);
  }, []);

  const onSubmit = async () => {
    try {
      setLoading(true);

      const fields = {
        title,
        imageUrl,
        tags: tags.split(","),
        text,
      };

      console.log(fields);

      const { data } = await axios.post("/posts", fields);

      console.log(data);

      const id = data._id;

      navigate(`/posts/${id}`);
    } catch (error) {
      console.log(error);
    }
  };

  // Настройки для SimpleMDE
  // useMemo() требует сама библиотека
  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: "400px",
      autofocus: true,
      placeholder: "Введите текст...",
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    []
  );

  // Если юзер не авторизован - направляем на регистрацию
  // Чтобы не зашел по этому роуту если он не авторизован
  // Через isAuth, проверяем если данные в стейте (авторизован ли)
  if (!window.localStorage.getItem("token") && !isAuth) {
    return <Navigate to={"/register"} />;
  }

  return (
    <Paper style={{ padding: 30 }}>
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
      {imageUrl && (
        <>
          <Button
            variant="contained"
            color="error"
            onClick={onClickRemoveImage}
          >
            Удалить
          </Button>
          <img
            className={styles.image}
            src={`http://localhost:4444${imageUrl}`}
            alt="Uploaded"
          />
        </>
      )}
      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
      />
      <TextField
        classes={{ root: styles.tags }}
        variant="standard"
        placeholder="Тэги"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        fullWidth
      />
      <SimpleMDE
        className={styles.editor}
        value={text}
        onChange={onChange}
        options={options}
      />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          Опубликовать
        </Button>
        <a href="/">
          <Button size="large">Отмена</Button>
        </a>
      </div>
    </Paper>
  );
};
