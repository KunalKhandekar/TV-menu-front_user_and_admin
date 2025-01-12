import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRestaurantBySecretCodeword = async (codeword) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/restaurants/by-codeword/${codeword}`
      );
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const getRestaurant = async (id) => {
    try {
      const response = await axiosInstance.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error("Fetching restaurant failed:", error);
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
    }
  };

  const updateRestaurant = async (id, restaurantData) => {
    try {
      const response = await axiosInstance.put(
        `/restaurants/${id}`,
        restaurantData
      );
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === id ? response.data : restaurant
        )
      );
      toast.success("Restaurant updated successfully");
      return response.data;
    } catch (error) {
      console.error("Updating restaurant failed:", error);
    }
  };

  const deleteRestaurant = async (id) => {
    try {
      await axiosInstance.delete(`/restaurants/${id}`);
      setRestaurants(restaurants.filter((restaurant) => restaurant._id !== id));
      toast.success("Restaurant deleted successfully");
    } catch (error) {
      console.error("Deleting restaurant failed:", error);
      toast.error(`Failed to delete restaurant: ${error.message}`);
      throw error;
    }
  };

  const getTVs = async (restaurantId) => {
    try {
      const response = await axiosInstance.get(
        `/restaurants/${restaurantId}/tvs`
      );
      return response.data;
    } catch (error) {}
  };

  const addTV = async (restaurantId, tvData) => {
    try {
      const response = await axiosInstance.post(
        `/restaurants/${restaurantId}/tvs`,
        tvData
      );
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === restaurantId ? updatedRestaurant : restaurant
        )
      );
      toast.success("TV added successfully");
      return response.data;
    } catch (error) {}
  };

  const updateTV = async (restaurantId, tvId, tvData) => {
    try {
      const response = await axiosInstance.put(
        `/restaurants/${restaurantId}/tvs/${tvId}`,
        tvData
      );
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === restaurantId ? updatedRestaurant : restaurant
        )
      );
      toast.success("TV updated successfully");
      return response.data;
    } catch (error) {}
  };

  const deleteTV = async (restaurantId, tvId) => {
    try {
      await axiosInstance.delete(`/restaurants/${restaurantId}/tvs/${tvId}`);
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === restaurantId ? updatedRestaurant : restaurant
        )
      );
      toast.success("TV deleted successfully");
    } catch (error) {
      console.error("Deleting TV failed:", error);
    }
  };

  const getMediaItems = async (restaurantId, tvId) => {
    try {
      const response = await axiosInstance.get(
        `/restaurants/${restaurantId}/tvs/${tvId}/media`
      );
      return response.data;
    } catch (error) {}
  };

  const addMediaItem = async (restaurantId, tvId, mediaData) => {
    try {
      const response = await axiosInstance.post(
        `/restaurants/${restaurantId}/tvs/${tvId}/media`,
        mediaData
      );
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === restaurantId ? updatedRestaurant : restaurant
        )
      );
      toast.success("Media added successfully");
      return response.data;
    } catch (error) {}
  };

  const deleteMediaItem = async (restaurantId, tvId, mediaId) => {
    try {
      await axiosInstance.delete(
        `/restaurants/${restaurantId}/tvs/${tvId}/media/${mediaId}`
      );
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === restaurantId ? updatedRestaurant : restaurant
        )
      );
      toast.success("Media deleted successfully");
    } catch (error) {}
  };

  const updateSecretCodeword = async (restaurantId, secretCodeData) => {
    try {
      const response = await axiosInstance.put(
        `/restaurants/${restaurantId}/secret-codeword`,
        secretCodeData
      );
      const updatedRestaurant = await getRestaurant(restaurantId);
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === restaurantId ? updatedRestaurant : restaurant
        )
      );
      toast.success("Secret code updated successfully");
      return response.data;
    } catch (error) {}
  };

  const toggleRestaurantStatus = async (id, newStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/restaurants/${id}/toggle-status`,
        { isEnabled: newStatus }
      );
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === id
            ? { ...restaurant, isEnabled: newStatus }
            : restaurant
        )
      );
      toast.success(
        `Restaurant ${newStatus ? "enabled" : "disabled"} successfully`
      );
      return response.data;
    } catch (error) {
      console.error("Toggling restaurant status failed:", error);
      toast.error(`Failed to toggle restaurant status: ${error.message}`);
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
        getMediaItems,
        addMediaItem,
        deleteMediaItem,
        toggleRestaurantStatus,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export default RestaurantProvider;
