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

