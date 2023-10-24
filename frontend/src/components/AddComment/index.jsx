import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "../../services/axiosConfig";

import styles from "./AddComment.module.scss";

import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";

export const Index = () => {
  const { data, status } = useSelector((state) => state.auth);
  const [text, setText] = useState("");
  const { id } = useParams();

  const comment = {
    text: text,
  };

  const onSubmit = () => {
    try {
      const response = axios.post(`/comments/${id}`, comment);
      console.log(response);
      console.log(id);
      setText("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className={styles.root}>
        {status === "loading" ? (
          "Загрузка..."
        ) : status === "error" ? (
          "Ошибка"
        ) : (
          <Avatar classes={{ root: styles.avatar }} src={data.avatarUrl} />
        )}
        <form className={styles.form}>
          <TextField
            label="Написать комментарий"
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
            maxRows={10}
            multiline
            fullWidth
          />
          <Button onClick={onSubmit} variant="contained">
            Отправить
          </Button>
        </form>
      </div>
    </>
  );
};
