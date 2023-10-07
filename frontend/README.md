# FRONTEND

<h2>ROUTES</h2>

<h3>+ React Router Dom</h3>

- [x] Первым делом необходимо подключить роуты, которые будут перенаправлять между страницами.
- [x] ПРИМ. Компонент `BrowserRoutes` оборачивает все приложение в компоненте `App` в нашем случае.

```javascript
root.render(
  <React.StrictMode>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
``` 

```javascript
import { Routes, Route } from "react-router-dom";

import Container from "@mui/material/Container";
import { Header } from "./components";
import { Home, FullPost, Registration, AddPost, Login } from "./pages";

function App() {
  return (
    <>
      <Header />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<FullPost />} />
          <Route path="/add-post" element={<AddPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
```
