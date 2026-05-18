import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import FormBuilderPage from "./FormBuilderPage";
import FormEditPage from "./FormEditPage";
import FormFillPage from "./FormFillPage";

import "./main.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/new"
            element={
              <ProtectedRoute>
                <FormBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/:id"
            element={
              <ProtectedRoute>
                <FormEditPage />
              </ProtectedRoute>
            }
          />
          <Route path="/share/:id" element={<FormFillPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);