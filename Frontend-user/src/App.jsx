import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { RestaurantProvider } from "./contexts/RestaurantContext";
import { Toaster } from "react-hot-toast";
import TvPage from "./components/TvPage";
import Homepage from "./components/HomePage";
import ImagePage from "./components/ImagePage";
import { ThemeProvider } from "./contexts/theme-provider";
import DefaultPage from "./components/DefaultPage";


function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="restaurant-theme">
      <RestaurantProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Toaster />
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/restaurant/:id" element={<TvPage />} />
              <Route path="/restaurant/:id/tv/:tvId" element={<ImagePage />} />
              <Route path="*" element={<DefaultPage/>} />
            </Routes>
          </div>
        </Router>
      </RestaurantProvider>
    </ThemeProvider>
  );
}

export default App;
