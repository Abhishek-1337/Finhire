import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { GuestOnly } from "./components/GuestOnly";
import { RequireAuth } from "./components/RequireAuth";
import { RequireExpertProfile } from "./components/RequireExpertProfile";
import { EngagementsPage } from "./pages/EngagementsPage";
import { ExpertDetailsPage } from "./pages/ExpertDetailsPage";
import { ExpertProfilePage } from "./pages/ExpertProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { QuotesPage } from "./pages/QuotesPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchPage } from "./pages/SearchPage";
import { getRole } from "./auth/session";

function App() {
  const role = getRole();
  const location = useLocation();
  const navigate = useNavigate();

  if(location.pathname === "/" && role === null) {
    navigate("/login");
  }
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
        {role === "BUSINESS" && <Route index element={<SearchPage />} />}
        {role === "EXPERT" && <Route index element={<Navigate to="/quotes" replace />} />}

        

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ExpertProfilePage />
            </RequireAuth>
          }
        />

        <Route
          path="/experts/:expertUserId"
          element={
            <RequireAuth>
              <ExpertDetailsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/quotes"
          element={
            <RequireAuth>
              <RequireExpertProfile>
                <QuotesPage />
              </RequireExpertProfile>
            </RequireAuth>
          }
        />

        <Route
          path="/engagements"
          element={
            <RequireAuth>
              <RequireExpertProfile>
                <EngagementsPage />
              </RequireExpertProfile>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
