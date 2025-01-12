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
import { ThemeProvider } from "./contexts/theme-provider";
import DefaultPage from "./components/DefaultPage";
import MediaPage from "./components/MediaPage";


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
              <Route path="/restaurant/:id/tv/:tvId" element={<MediaPage />} />
              <Route path="*" element={<DefaultPage/>} />
            </Routes>
          </div>
        </Router>
      </RestaurantProvider>
    </ThemeProvider>
  );
}

export default App;
