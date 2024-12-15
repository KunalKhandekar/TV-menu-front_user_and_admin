import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useTheme } from "../contexts/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "./theme-toggle";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const savedEmail = localStorage.getItem("adminEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await axiosInstance.post(
        "/admin/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      const token = result?.data?.token;
      localStorage.setItem("authToken", token);

      if (rememberMe) {
        localStorage.setItem("adminEmail", email);
      } else {
        localStorage.removeItem("adminEmail");
      }

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      setError(error?.response?.data?.msg || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-background`}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <ThemeToggle />
          </div>
          <CardTitle className="text-2xl font-semibold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-address">Email address</Label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 text-muted-foreground" size={18} />
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pl-10 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Label htmlFor="remember-me" className="text-sm">
                Remember me
              </Label>
            </div>

            {error && (
              <div className="text-center text-red-500 text-sm font-semibold capitalize">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useContext, useEffect } from "react";
import { RestaurantContext } from "../../contexts/RestaurantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Tv, Key, Loader2 } from 'lucide-react';
import { ThemeToggle } from "../theme-toggle";
import TVList from "./TVList";
import { useNavigate } from "react-router-dom";
import { Home, LogOut } from 'lucide-react';

export function RestaurantList() {
  const {
    restaurants,
    loading,
    error,
    fetchRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    updateSecretCodeword,
  } = useContext(RestaurantContext);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    description: "",
    secret_codeword: "",
  });
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false); 
  const [isDeleting, setIsDeleting] = useState(false); 
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSecretCodeDialogOpen, setIsSecretCodeDialogOpen] = useState(false);
  const [newSecretCode, setNewSecretCode] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setIsCreating(true); 
    try {
      await createRestaurant(newRestaurant);
      setNewRestaurant({ name: "", description: "", secret_codeword: "" });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error creating restaurant:", error);
    } finally {
      setIsCreating(false); 
    }
  };

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateRestaurant(editingRestaurant._id, editingRestaurant);
      setEditingRestaurant(null);
      setIsEditDialogOpen(false);
      fetchRestaurants();
    } catch (error) {
      console.error("Error updating restaurant:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRestaurant = async (id) => {
    setIsDeleting(true); 
    try {
      await deleteRestaurant(id);
      fetchRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    } finally {
      setIsDeleting(false); 
    }
  };

  const handleUpdateSecretCode = async (restaurantId) => {
    setIsUpdating(true);
    try {
      await updateSecretCodeword(restaurantId, {
        secret_codeword: newSecretCode,
      });
      setNewSecretCode("");
      setIsSecretCodeDialogOpen(false);
      fetchRestaurants();
    } catch (error) {
      console.error("Error updating secret code:", error);
    } finally {
      setIsUpdating(false);
    }
  };


if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
    </div>
  );
}

  
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Restaurant Management</h1>
          <div className="flex items-center gap-4">
            
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="text-destructive-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
            <ThemeToggle />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Restaurant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Restaurant</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new restaurant.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateRestaurant}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newRestaurant.name}
                        onChange={(e) =>
                          setNewRestaurant({
                            ...newRestaurant,
                            name: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newRestaurant.description}
                        onChange={(e) =>
                          setNewRestaurant({
                            ...newRestaurant,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="secret_codeword" className="text-right">
                        Secret Code
                      </Label>
                      <Input
                        id="secret_codeword"
                        value={newRestaurant.secret_codeword}
                        onChange={(e) =>
                          setNewRestaurant({
                            ...newRestaurant,
                            secret_codeword: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Create Restaurant"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {restaurants.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center text-center py-16 space-y-4">
              <Tv className="w-16 h-16 text-muted-foreground" />
              <CardTitle>No Restaurants Found</CardTitle>
              <CardDescription>
                It seems like there are no restaurants added yet. Add your first
                restaurant to manage its details and TVs.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Card key={restaurant._id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{restaurant.name}</CardTitle>
                  <CardDescription>{restaurant.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="tvs">TVs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="space-y-4">
                      <div className="flex justify-end space-x-2">
                        <Dialog
                          open={isEditDialogOpen}
                          onOpenChange={setIsEditDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={() => setEditingRestaurant(restaurant)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Restaurant</DialogTitle>
                              <DialogDescription>
                                Make changes to the restaurant details here.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdateRestaurant}>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-name"
                                    className="text-right"
                                  >
                                    Name
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={editingRestaurant?.name}
                                    onChange={(e) =>
                                      setEditingRestaurant({
                                        ...editingRestaurant,
                                        name: e.target.value,
                                      })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="edit-description"
                                    className="text-right"
                                  >
                                    Description
                                  </Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editingRestaurant?.description}
                                    onChange={(e) =>
                                      setEditingRestaurant({
                                        ...editingRestaurant,
                                        description: e.target.value,
                                      })
                                    }
                                    className="col-span-3"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={isUpdating}>
                                  {isUpdating ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Save changes"
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={isSecretCodeDialogOpen}
                          onOpenChange={(isOpen) => {
                            setIsSecretCodeDialogOpen(isOpen);
                            if (isOpen) {
                              setNewSecretCode(restaurant?.secret_codeword); 
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Key className="mr-2 h-4 w-4" /> Update Secret
                              Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Secret Code</DialogTitle>
                              <DialogDescription>
                                Enter a new secret code for this restaurant.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="new-secret-code"
                                  className="text-right"
                                >
                                  New Secret Code
                                </Label>
                                <Input
                                  id="new-secret-code"
                                  value={newSecretCode}
                                  onChange={(e) =>
                                    setNewSecretCode(e.target.value)
                                  }
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() =>
                                  handleUpdateSecretCode(restaurant._id)
                                }
                                disabled={
                                  isUpdating ||
                                  newSecretCode?.trim() ===
                                    restaurant?.secret_codeword
                                }
                              >
                                {isUpdating ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  "Update Secret Code"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the restaurant and all
                                associated TVs and images.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteRestaurant(restaurant._id)
                                }
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TabsContent>
                    <TabsContent value="tvs">
                      <TVList restaurantId={restaurant._id} get_tv={restaurant?.tvs} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

This is the admin side frontend, after login if the admin role is super admin, I want to add a toggle button to enable and disable restaurant. if not then i don't want to store. store the info in localstorage of admin role just like token and remove it after logout. 

Analyze the file shared without, it includes data such as login page for admins, admin dashboard named as restaurantlist, restaurant context.

also analyze the previous conversation and response in the chat.