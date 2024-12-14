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

