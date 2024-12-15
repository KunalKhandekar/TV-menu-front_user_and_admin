import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLogin from "./components/AdminLogin";
import { RestaurantProvider } from "./contexts/RestaurantContext";
import { Toaster } from "react-hot-toast";
import { RestaurantList } from "./components/AdminSide/RestaurantList";
import { ThemeProvider } from "./contexts/theme-provider";

const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  const adminRole = localStorage.getItem("adminRole");

  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  if (adminRole !== "admin" && adminRole !== "superadmin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="restaurant-theme">
      <RestaurantProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Toaster />
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RestaurantList />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<AdminLogin />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </RestaurantProvider>
    </ThemeProvider>
  );
}

export default App;
