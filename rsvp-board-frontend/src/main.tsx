import React from "react";
import type { ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HostDashboardPage from "./pages/HostDashboardPage";
import HostEventPage from "./pages/HostEventPage";
import JoinEventPage from "./pages/JoinEventPage";
import "./index.css";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route
            index
            element={
              <PrivateRoute>
                <HostDashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="events/:id"
            element={
              <PrivateRoute>
                <HostEventPage />
              </PrivateRoute>
            }
          />
          <Route path="join/:code" element={<JoinEventPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
