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


 
  const getTVs = async (restaurantId) => {
    try {
      const response = await axiosInstance.get(
        `/restaurants/${restaurantId}/tvs`
      );
      return response.data;
    } catch (error) {}
  };


  const getMediaItems = async (restaurantId, tvId) => {
    try {
      const response = await axiosInstance.get(
        `/restaurants/${restaurantId}/tvs/${tvId}/media`
      );
      return response.data;
    } catch (error) {}
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        loading,
        error,
        getRestaurantBySecretCodeword,
        fetchRestaurants,
        getRestaurant,
        createRestaurant,
        getTVs,
        getMediaItems
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export default RestaurantProvider;
