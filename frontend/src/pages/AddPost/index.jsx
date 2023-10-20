import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";

import { useSelector } from "react-redux";
import { useNavigate, Navigate, useParams } from "react-router-dom";

import { selectIsAuth } from "../../redux/slices/auth";
import axios from "../../services/axiosConfig";

import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";

export const AddPost = () => {
  //  Стейты:
  //    1) navigate - из хука useNavigate() react-router-dom
  //  перенаправляет на опр. роут
  const navigate = useNavigate();
  //    2) Так же проверка есть ли юзер в стейте (авторизован ли)
  //  Перенаправим на регистрацию если не зареган
  const isAuth = useSelector(selectIsAuth);
  //    3) Стейт загрузки - хз зачем, он не нужен
  const [loading, setLoading] = useState(false);
  //    4) Стейт ссылки на кртинку на сервере
  //  Когда загрузим она отрисуется для предпросмотка
  const [imageUrl, setImageUrl] = useState("");
  //    5) Текст введенный в статье
  const [text, setText] = React.useState("");
  //    6) Заголовок
  const [title, setTitle] = useState("");
  //    7) Тэги
  const [tags, setTags] = useState("");
  //    8) Ref, чтобы перенаправить нажатие.
  //  Нажмем на кнопку, а нажмется элемент input чтоб картинку выбрать
  //  Настроится ниже
  const inputFileRef = useRef();

  // Компонент для создания и изменения один и тот же
  // Нам нужен id, чтобы приложение понимало - это создание или редактирование
  // Логика в следю useEffect()
  const { id } = useParams();

  // Если id есть = true либо false
  // Для смены кнопки опубликовать / сохранить
  // + для отправки post или patch запроса
  const isEditing = Boolean(id);

  // Если мы получили id или не получили:
  //    да - делаем запрос и заполняем поля данными поста, это редактирование
  //    нет - поля создания не заполнены, это создание поста
  useEffect(() => {
    if (id) {
      axios
        .get(`/posts/${id}`)
        .then((res) => {
          setImageUrl(res.data.imageUrl);
          setTitle(res.data.title);
          setText(res.data.text);
          setTags(res.data.tags.join(","));
        })
        .catch((error) => {
          console.log(error);
          alert("Не удалось загрузить пост");
        });
    }
  }, []);

  // Тут картинка сразу грузится на сервер и с сервера отображается
  // WARNING!!!
  // Можно не грузить на серв а просто сделать предпросмотр при пом. HTML
  // А грузится на серв картинка будет при submit формы
  // А с серва она уже идет дальше куда надо (в облако например)

  //  1) Создается FormData
  //  2) Получаем файл картинки из event.target.files[0]
  //  3) Добавляем этот файл в форму
  //  4) Отправляем форму с картинкой на сервер и возвращаем ответ в переменную
  //  5) url из data помещаем в стейт imageUrl - это ссылка на картинку
  //  6) Обработка ошибки
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

  // Очистить стейт с картинкой если передумали.
  const onClickRemoveImage = async () => {
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
      // Запрос в зависимости от того создание это или обновление
      // Проверяем через isEditing
      const { data } = isEditing
        ? await axios.patch(`/posts/${id}`, fields)
        : await axios.post("/posts", fields);

      console.log(data);

      // Достаем _id из ответа (это _id статьи)
      //  (Можно указать доп проверки на всякий случай)
      // Типа если статья создана то мы должны получить _id
      // Тк его возвращает сервер вместе с данными о посте

      // Если это изменение статьи, _id - это будет id страницы из useParams
      // Если это создание поста, то _id - это data._id из ответа
      // тк изменение возвращает просто сообщенеие об изменении
      const _id = isEditing ? id : data._id;

      // Если _id есть то перенаправляем пользователя
      // На страницу с этим постом созданным
      navigate(`/posts/${_id}`);
    } catch (error) {
      // Ошибка
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
          {isEditing ? "Сохранить" : "Опубликовать"}
        </Button>
        <a href="/">
          <Button size="large">Отмена</Button>
        </a>
      </div>
    </Paper>
  );
};
