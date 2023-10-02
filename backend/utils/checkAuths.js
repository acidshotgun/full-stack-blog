import jwt from "jsonwebtoken";

// middleware - 3 параметра:
//    1) req - это запрос, который он перехватил
//    2) res - ответ
//    3) next() - middleware закончил и передает работу дальше
export default (req, res, next) => {
  // Проверяем есть ли в запросе токен
  // Он всегда передается в headers.authorization  запросе
  // + убираем прикиску Bearer, которая передается всегда
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

  // Если токен есть - то его нужно декодировать
  // Затем "ВШИТЬ" в тело запроса. Там появится новое св-во userId
  if (token) {
    try {
      // Декодируем токен и помещаем сюда его содержимое при помощи секретного ключа
      // (ключ который был при шифровании при авторизации / логгир)
      // (там _id, которое шифруется при log или auth)
      const decoded = jwt.verify(token, "secret123");

      // Вшиваем userId в запрос req
      req.userId = decoded._id;

      // Передаем дальше действи (middleware закончен)
      next();
      // или нет доступа (если токен не верен)
    } catch (error) {
      res.status(403).json({
        message: "Нет доступа",
      });
    }
    // ошибка (если токен не передан)
  } else {
    res.status(403).json({
      message: "Нет доступа",
    });
  }
};
