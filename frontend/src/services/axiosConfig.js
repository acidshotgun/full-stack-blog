import axios from "axios";

// Это файл настройки axios
// Этот код представляет собой создание экземпляра Axios
// с определенными настройками и добавление Request Interceptor (перехватчика запросов) к этому экземпляру.

// Это экземпляр запроса с настройками
//    1) Базовый url по которому будет идти запрос
// К нему уже будут подставлять роуты = не надо прописывать роут полность.
const request = axios.create({
  baseURL: "http://localhost:4444",
});

// Тут добавляем к нашему запросу перехватчик запросов (interceptors.request)
//    1) Тут мы перехватываем запрос и добавляем к нему Authorization в headers
// и помещяем туда token, который хранится в local storage
// так при каждом запросе будет проверка - авторизирован пользователь чи нет
request.interceptors.request.use((config) => {
  config.headers.Authorization = window.localStorage.getItem("token");
  return config;
});

// Экспортируем настроенный файл
// Тепер ьвезде где есть аксиос импортируем отсюда. Это как эеземпляр
export default request;
