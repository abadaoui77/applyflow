import { useCallback, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Applications from "./pages/Applications.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Notifications from "./pages/Notifications.jsx";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));

  function handleLoginSucces() {
    setIsLoggedIn(true);
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={!isLoggedIn
        ? <Login onLoginSucces={handleLoginSucces} />
        : <Navigate to="/applications" replace />
      } />
      <Route path="/register" element={!isLoggedIn
        ? <Register />
        : <Navigate to="/applications" replace />
      } />
      <Route path="/applications" element={isLoggedIn
        ? <Applications onLogout={handleLogout} />
        : <Navigate to="/login" replace />
      } />
      <Route path="/dashboard" element={isLoggedIn
        ? <Dashboard onLogout={handleLogout} />
        : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route
        path="/notifications"
        element={
          isLoggedIn
            ? <Notifications onLogout={handleLogout} />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

export default App;
