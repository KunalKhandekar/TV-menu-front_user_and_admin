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


import React, { useContext } from 'react';
import { RestaurantContext } from '../contexts/RestaurantContext';
import { SecretCodeDialog } from './SecretCodeDialog';

function Homepage() {
  const { getRestaurantBySecretCodeword } = useContext(RestaurantContext);

  const handleSecretCodeSubmit = async (code) => {
    try {
      const restaurant = await getRestaurantBySecretCodeword(code.trim());
      if (restaurant) {
        return { success: true, restaurantId: restaurant._id };
      } else {
        return { success: false };
      }
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      return { success: false };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SecretCodeDialog onSubmit={handleSecretCodeSubmit} />
    </div>
  );
}

export default Homepage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';

export function SecretCodeDialog({ onSubmit }) {
  const [open, setOpen] = useState(true);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCode = localStorage.getItem('secretCode');
    if (storedCode) {
      handleSubmit(storedCode);
    }
  }, []);

  const handleSubmit = async (submittedCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onSubmit(submittedCode);
      if (result.success) {
        localStorage.setItem('secretCode', submittedCode);
        navigate(`/restaurant/${result.restaurantId}`);
      } else {
        setError("Invalid secret code. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting code:", err);
      setError("An error occurred. Please try again.");
      toast.error("Error: Unable to process the secret code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Secret Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(code);
        }}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your secret code"
            disabled={isLoading}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <Button type="submit" className="mt-4" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { RestaurantContext } from '../contexts/RestaurantContext';
import FullscreenGallery from './FullscreenGallery';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SlidingControl = React.memo(({ isSliding, setIsSliding }) => (
  <div className="flex items-center space-x-2">
    <Switch
      id="sliding-mode"
      checked={isSliding}
      onCheckedChange={setIsSliding}
    />
    <Label htmlFor="sliding-mode">Auto-slide</Label>
  </div>
));

SlidingControl.displayName = 'SlidingControl';

const SlidingTimeControl = React.memo(({ slidingTime, setSlidingTime }) => (
  <div className="flex items-center space-x-2">
    <Label htmlFor="sliding-time">Sliding Time</Label>
    <Select value={slidingTime.toString()} onValueChange={(value) => setSlidingTime(Number(value))}>
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {[1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000].map((time) => (
          <SelectItem key={time} value={time.toString()}>{time / 1000} sec</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
));

SlidingTimeControl.displayName = 'SlidingTimeControl';

function TvPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getRestaurant, getTVs } = useContext(RestaurantContext);
  const [restaurant, setRestaurant] = useState(null);
  const [tvs, setTvs] = useState([]);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [selectedTvIndex, setSelectedTvIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(() => {
    const stored = localStorage.getItem('isSliding');
    return stored !== null ? JSON.parse(stored) : true;
  });
  const [slidingTime, setSlidingTime] = useState(() => {
    const stored = localStorage.getItem('slidingTime');
    return stored !== null ? JSON.parse(stored) : 2000;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await getRestaurant(id);
        setRestaurant(restaurantData);
        const tvsData = await getTVs(id);
        setTvs(tvsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, getRestaurant, getTVs]);

  useEffect(() => {
    localStorage.setItem('isSliding', JSON.stringify(isSliding));
  }, [isSliding]);

  useEffect(() => {
    localStorage.setItem('slidingTime', JSON.stringify(slidingTime));
  }, [slidingTime]);

  const openFullscreen = useCallback((tvIndex, imageIndex) => {
    setSelectedTvIndex(tvIndex);
    setInitialImageIndex(imageIndex);
    setIsFullscreenOpen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  const memoizedFullscreenGallery = useMemo(() => (
    isFullscreenOpen && tvs[selectedTvIndex] && (
      <FullscreenGallery
        images={tvs[selectedTvIndex].menuImages}
        initialIndex={initialImageIndex}
        isSliding={isSliding}
        slidingTime={slidingTime}
        onClose={closeFullscreen}
      />
    )
  ), [isFullscreenOpen, tvs, selectedTvIndex, initialImageIndex, isSliding, slidingTime, closeFullscreen]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-xl font-semibold">Loading TVs...</p>
      </div>
    );
  }

  if (!restaurant || tvs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4">No TVs Found</h2>
        <p className="text-xl text-muted-foreground mb-4">We couldn't find any TVs for this restaurant.</p>
        <Button onClick={() => navigate('/')}>
          Return to Restaurant List
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-10 bg-background shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-foreground"
                aria-label="Go back to home"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-semibold">{restaurant.name} - TVs</h1>
            </div>
            <div className="flex items-center space-x-6">
              <SlidingControl isSliding={isSliding} setIsSliding={setIsSliding} />
              <SlidingTimeControl slidingTime={slidingTime} setSlidingTime={setSlidingTime} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tvs.map((tv, tvIndex) => (
            <Card key={tv._id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{tv.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {tv.menuImages.slice(0, 4).map((image, imageIndex) => (
                    <div
                      key={image._id}
                      className="aspect-w-4 aspect-h-3 cursor-pointer overflow-hidden rounded-lg bg-muted"
                      onClick={() => openFullscreen(tvIndex, imageIndex)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
                <Link to={`/restaurant/${id}/tv/${tv._id}`} className="mt-4 inline-block text-primary hover:underline">
                  View all images
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {memoizedFullscreenGallery}
    </div>
  );
}

export default TvPage;

import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../lib/axios';
import { toast } from 'react-hot-toast';

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRestaurantBySecretCodeword = async (codeword) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/restaurants/by-codeword/${codeword}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      console.error("Fetching restaurant by secret code failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/restaurants");
      setRestaurants(response.data);
      setError(null);
    } catch (error) {
      console.error("Fetching restaurants failed:", error);
      setError("Failed to fetch restaurants. Please try again later.");
      toast.error("Failed to fetch restaurants. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> {
    fetchRestaurants();
  }, [])

  const getRestaurant = async (id) => {
    try {
      const response = await axiosInstance.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error("Fetching restaurant failed:", error);
      toast.error(`Failed to fetch restaurant: ${error.message}`);
      throw error;
    }
  };

  const createRestaurant = async (restaurantData) => {
    try {
      const response = await axiosInstance.post("/restaurants", restaurantData);
      setRestaurants([...restaurants, response.data]);
      toast.success("Restaurant created successfully");
      return response.data;
    } catch (error) {
      console.error("Creating restaurant failed:", error);
      toast.error(`Failed to create restaurant: ${error.message}`);
      throw error;
    }
  };

  const updateRestaurant = async (id, restaurantData) => {
    try {
      const response = await axiosInstance.put(`/restaurants/${id}`, restaurantData);
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === id ? response.data : restaurant
      ));
      toast.success("Restaurant updated successfully");
      return response.data;
    } catch (error) {
      console.error("Updating restaurant failed:", error);
      toast.error(`Failed to update restaurant: ${error.message}`);
      throw error;
    }
  };

  const deleteRestaurant = async (id) => {
    try {
      await axiosInstance.delete(`/restaurants/${id}`);
      setRestaurants(restaurants.filter(restaurant => restaurant._id !== id));
      toast.success("Restaurant deleted successfully");
    } catch (error) {
      console.error("Deleting restaurant failed:", error);
      toast.error(`Failed to delete restaurant: ${error.message}`);
      throw error;
    }
  };

  const getTVs = async (restaurantId) => {
    try {
      const response = await axiosInstance.get(`/restaurants/${restaurantId}/tvs`);
      return response.data;
    } catch (error) {
      console.error("Fetching TVs failed:", error);
      toast.error(`Failed to fetch TVs: ${error.message}`);
      throw error;
    }
  };

  const addTV = async (restaurantId, tvData) => {
    try {
      const response = await axiosInstance.post(`/restaurants/${restaurantId}/tvs`, tvData);
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === restaurantId ? updatedRestaurant : restaurant
      ));
      toast.success("TV added successfully");
      return response.data;
    } catch (error) {
      console.error("Adding TV failed:", error);
      toast.error(`Failed to add TV: ${error.message}`);
      throw error;
    }
  };

  const updateTV = async (restaurantId, tvId, tvData) => {
    try {
      const response = await axiosInstance.put(`/restaurants/${restaurantId}/tvs/${tvId}`, tvData);
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === restaurantId ? updatedRestaurant : restaurant
      ));
      toast.success("TV updated successfully");
      return response.data;
    } catch (error) {
      console.error("Updating TV failed:", error);
      toast.error(`Failed to update TV: ${error.message}`);
      throw error;
    }
  };

  const deleteTV = async (restaurantId, tvId) => {
    try {
      await axiosInstance.delete(`/restaurants/${restaurantId}/tvs/${tvId}`);
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === restaurantId ? updatedRestaurant : restaurant
      ));
      toast.success("TV deleted successfully");
    } catch (error) {
      console.error("Deleting TV failed:", error);
      toast.error(`Failed to delete TV: ${error.message}`);
      throw error;
    }
  };

  const getImages = async (restaurantId, tvId) => {
    try {
      const response = await axiosInstance.get(`/restaurants/${restaurantId}/tvs/${tvId}/images`);
      return response.data;
    } catch (error) {
      console.error("Fetching images failed:", error);
      toast.error(`Failed to fetch images: ${error.message}`);
      throw error;
    }
  };

  const addImage = async (restaurantId, tvId, imageData) => {
    try {
      const response = await axiosInstance.post(`/restaurants/${restaurantId}/tvs/${tvId}/images`, imageData);
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === restaurantId ? updatedRestaurant : restaurant
      ));
      toast.success("Image added successfully");
      return response.data;
    } catch (error) {
      console.error("Adding image failed:", error);
      toast.error(`Failed to add image: ${error.message}`);
      throw error;
    }
  };

  const deleteImage = async (restaurantId, tvId, imageId) => {
    try {
      await axiosInstance.delete(`/restaurants/${restaurantId}/tvs/${tvId}/images/${imageId}`);
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === restaurantId ? updatedRestaurant : restaurant
      ));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Deleting image failed:", error);
      toast.error(`Failed to delete image: ${error.message}`);
      throw error;
    }
  };

  const updateSecretCodeword = async (restaurantId, secretCodeData) => {
    try {
      const response = await axiosInstance.put(`/restaurants/${restaurantId}/secret-codeword`, secretCodeData);
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === restaurantId ? updatedRestaurant : restaurant
      ));
      toast.success("Secret code updated successfully");
      return response.data;
    } catch (error) {
      console.error("Updating secret code failed:",error);
      toast.error(`Failed to update secret code: ${error.message}`);
      throw error;
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        loading,
        error,
        updateSecretCodeword,
        getRestaurantBySecretCodeword,
        fetchRestaurants,
        getRestaurant,
        createRestaurant,
        updateRestaurant,
        deleteRestaurant,
        getTVs,
        addTV,
        updateTV,
        deleteTV,
        getImages,
        addImage,
        deleteImage,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

import Restaurant from "../Models/restaurant.model.js";

// @desc    Update the secret codeword for a restaurant
// @route   PUT /api/restaurants/:id/secret-codeword
// @access  Private
export const updateSecretCodeword = async (req, res) => {
  try {
    const { secret_codeword } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { secret_codeword },
      { new: true, runValidators: true }
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json({ message: "Secret codeword updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Enable or disable a restaurant
// @route   PATCH /api/restaurants/:id/toggle-status
// @access  Private (Superadmin only)
export const toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    restaurant.isEnabled = !restaurant.isEnabled;
    await restaurant.save();
    res.json({
      message: `Restaurant ${
        restaurant.isEnabled ? "enabled" : "disabled"
      } successfully`,
      isEnabled: restaurant.isEnabled,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a restaurant by secret codeword
// @route   GET /api/restaurants/by-codeword/:codeword
// @access  Public
export const getRestaurantBySecretCodeword = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      secret_codeword: req.params.codeword,
    }).lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    if (!restaurant.isEnabled) {
      return res
        .status(403)
        .json({ message: "This restaurant is currently disabled" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private
export const createRestaurant = async (req, res) => {
  try {
    const { name, description, secret_codeword } = req.body;
    const restaurant = new Restaurant({ name, description, secret_codeword });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().lean();

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (!restaurant.isEnabled) {
      return res
        .status(403)
        .json({ message: "This restaurant is currently disabled" });
    };
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private
export const updateRestaurant = async (req, res) => {
  try {
    const { name, description } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all TVs for a restaurant
// @route   GET /api/restaurants/:id/tvs
// @access  Public
export const getTVs = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant.tvs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a TV to a restaurant
// @route   POST /api/restaurants/:id/tvs
// @access  Private
export const addTV = async (req, res) => {
  try {
    const { name } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const newTV = { name, menuImages: [] };
    restaurant.tvs.push(newTV);
    await restaurant.save();
    const addedTV = restaurant.tvs[restaurant.tvs.length - 1];
    res.status(201).json(addedTV);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a TV
// @route   PUT /api/restaurants/:id/tvs/:tvId
// @access  Private
export const updateTV = async (req, res) => {
  try {
    const { name } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const tv = restaurant.tvs.id(req.params.tvId);
    if (!tv) {
      return res.status(404).json({ message: "TV not found" });
    }
    tv.name = name;
    await restaurant.save();
    res.json(tv);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a TV
// @route   DELETE /api/restaurants/:id/tvs/:tvId
// @access  Private
export const deleteTV = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $pull: { tvs: { _id: req.params.tvId } } },
      { new: true }
    );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json({ message: "TV deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all images for a TV
// @route   GET /api/restaurants/:id/tvs/:tvId/images
// @access  Public
export const getImages = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const tv = restaurant.tvs.filter((tv) => tv._id == req.params.tvId)[0];
    if (!tv) {
      return res.status(404).json({ message: "TV not found" });
    }
    res.json(tv.menuImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add an image to a TV
// @route   POST /api/restaurants/:id/tvs/:tvId/images
// @access  Private
export const addImage = async (req, res) => {
  try {
    const { name, url } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const tv = restaurant.tvs.id(req.params.tvId);
    if (!tv) {
      return res.status(404).json({ message: "TV not found" });
    }
    const newImage = { name, url };
    tv.menuImages.push(newImage);
    await restaurant.save();
    const addedImage = tv.menuImages[tv.menuImages.length - 1];
    res.status(201).json(addedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an image from a TV
// @route   DELETE /api/restaurants/:id/tvs/:tvId/images/:imageId
// @access  Private
export const deleteImage = async (req, res) => {
  try {
    const { id, tvId, imageId } = req.params;
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const tv = restaurant.tvs.id(tvId);
    if (!tv) {
      return res.status(404).json({ message: "TV not found" });
    }
    tv.menuImages.pull(imageId);
    await restaurant.save();
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


I want to change the secretcode and enable disable function. If user enter the secret code and and the restaurant is disable the show error message in the dialog that the restaurant is disable. also handle the case if the user has already entered and the secret code is in the localstorage. in TV page while fetching specific reataurant if the restaurant is disable than show the message on the UI that it's disable.

I have shared in the file the following components -> App.jsx, HomePage.jsx, SecrectCodeDialog.jsx, TvPage.jsx, RestaurantContext.jsx.

make the changes properly.