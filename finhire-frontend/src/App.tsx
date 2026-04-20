import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { GuestOnly } from "./components/GuestOnly";
import { RequireAuth } from "./components/RequireAuth";
import { EngagementsPage } from "./pages/EngagementsPage";
import { ExpertProfilePage } from "./pages/ExpertProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { QuotesPage } from "./pages/QuotesPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { SearchPage } from "./pages/SearchPage";
import { useEffect, useState } from "react";

function App() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(()  => {
    const userRole = localStorage.getItem("userRole");
    setRole(userRole);
  }, []);
  return (
    <Routes>
      <Route
          path="/register"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />

        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
      <Route element={<AppLayout />}>
        {
          role === "BUSINESS" && <Route index element={<SearchPage />} />
        }

        

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ExpertProfilePage />
            </RequireAuth>
          }
        />

        <Route
          path="/quotes"
          element={
            <RequireAuth>
              <QuotesPage />
            </RequireAuth>
          }
        />

        <Route
          path="/engagements"
          element={
            <RequireAuth>
              <EngagementsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/reviews"
          element={
            <RequireAuth>
              <ReviewsPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
