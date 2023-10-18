import React from "react";
import Button from "@mui/material/Button";

import { useDispatch, useSelector } from "react-redux";

import styles from "./Header.module.scss";
import Container from "@mui/material/Container";
import { Link } from "react-router-dom";
import { logout, selectIsAuth } from "../../redux/slices/auth";

export const Header = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);

  // Выход из аккаунта
  //  1) Вызываем reducer для очистки стейта
  //  2) Удаляем токен из local storage
  const onClickLogout = () => {
    if (window.confirm("Вы хотете выйти?")) {
      dispatch(logout());
      window.localStorage.removeItem("token");
    }
  };

  return (
    <div className={styles.root}>
      <Container maxWidth="lg">
        <div className={styles.inner}>
          <Link className={styles.logo} to="/">
            <div>ACIDSHOTGUN</div>
          </Link>
          <div className={styles.buttons}>
            {/* Есть токен или isAuth = отрисовка контента в зависимости от авторизации */}
            {window.localStorage.getItem("token") || isAuth ? (
              <>
                <Link to="/add-post">
                  <Button variant="contained">Написать статью</Button>
                </Link>
                <Button
                  onClick={onClickLogout}
                  variant="contained"
                  color="error"
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outlined">Войти</Button>
                </Link>
                <Link to="/register">
                  <Button variant="contained">Создать аккаунт</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};
