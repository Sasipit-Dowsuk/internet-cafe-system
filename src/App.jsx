
import { useEffect, useState } from "react";
import { checkFirebaseConnection } from "./services/firebaseTest";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Computers from "./pages/Computers";
import Usage from "./pages/Usage";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("adminLoggedIn") === "true"
  );

  const [firebaseStatus, setFirebaseStatus] =
    useState("กำลังตรวจสอบ...");

  useEffect(() => {
    const unsubscribe = checkFirebaseConnection(({ message }) => {
      setFirebaseStatus(message);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem("adminLoggedIn", "true");
    setIsLoggedIn(true);
  };

  return (
    <>
      <div
        style={{
          padding: "8px 16px",
          backgroundColor: "#f3f4f6",
          color: "#374151",
          fontSize: "13px",
        }}
      >
        Firebase: {firebaseStatus}
      </div>

      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          {isLoggedIn && (
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/computers" element={<Computers />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="/history" element={<History />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          )}

          <Route
            path="*"
            element={
              <Navigate
                to={isLoggedIn ? "/dashboard" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
