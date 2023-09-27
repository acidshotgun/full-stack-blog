FULL-STACK-BLOG

<h2>backend</h2>

- [x] Node.js
- [x] Express.js + Validator
- [x] MongoDB / Mongoose
- [x] JSON Web Token
- [x] Multer
- [x] BCrypt

<br>

<h2>frontend</h2>

- [x] ReactJS
- [x] Redux Toolkit
- [x] React Hook Form
- [x] React Router
- [x] React Markdown / Simple Editor
- [x] Axios

<h3>JWT-token</h3>

- [ ] Генерируем токен, с которым можно в дальнейшем обращаться к защищенным запросам в приложении. Например -
- [ ] С помощью токена приложение понимает - авторизован-ли пользователь / может ли что-то создавать (статьи)
- [ ] На его основе будет дальнейшая регистрация/авторизация.

```javascript
// В ответе формируется token при помощи jwt.sign()
// Он содержит объект с данными из тела запроса, которые будут зашифрованы
app.post("/auth/login", (req, res) => {
  const token = jwt.sign(
    {
      email: req.body.email,
      password: req.body.password,
    },
    "secret123"
  );

// Это ответ от сервера
  res.json({
    succees: true,
    data: {
      userName: req.body.name,
      surname: req.body.surname,
    },
    token,
  });
});
```

+ это секретный ключ, который используется для подписи и проверки подлинности токена. Этот ключ должен быть известен только серверу, чтобы нельзя было подделать или изменить токен.
+ Любой может быть
