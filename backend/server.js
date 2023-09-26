import express from "express";
import jwt from "jsonwebtoken";

const app = express();

// Читает/понимает JSON
// Иначе JSON не читается (тот самый пустой объект undefined)
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.post("/auth/login", (req, res) => {
  console.log(req.body);

  const token = jwt.sign(
    {
      email: req.body.email,
      password: req.body.password,
    },
    "secret123"
  );

  res.json({
    succees: true,
    data: { userData: req.body.name, token: token },
  });
});

app.listen("4444", (error) => {
  error ? console.log(error) : console.log(`Server running at 4444 port`);
});
