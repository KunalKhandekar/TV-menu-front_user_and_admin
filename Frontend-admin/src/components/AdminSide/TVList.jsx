import React, { useState, useContext, useEffect } from "react";
import { RestaurantContext } from "@/contexts/RestaurantContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash2, Image, Loader2 } from "lucide-react";

import MediaList from "./MediaList";

export default function TVList({ restaurantId, tvs: initialTvs, isEnabled }) {
  const { getTVs, addTV, updateTV, deleteTV } = useContext(RestaurantContext);
  const [tvs, setTVs] = useState(initialTvs || []);
  const [newTV, setNewTV] = useState({ name: "" });
  const [editingTV, setEditingTV] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(!isEnabled); // Update: Initial loading state

  const fetchTVs = async () => {
    if (!isEnabled) {
      setIsLoading(false); // Update: Set isLoading to false immediately if disabled
      return;
    }
    setIsLoading(true);
    try {
      const fetchedTVs = await getTVs(restaurantId);
      setTVs(fetchedTVs);
    } catch (error) {
      console.error("Error fetching TVs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTV = async (e) => {
    e.preventDefault();
    if (!isEnabled) {
      return;
    }
    setIsAdding(true);
    try {
      await addTV(restaurantId, newTV);
      setNewTV({ name: "" });
      setIsAddDialogOpen(false);
      fetchTVs();
    } catch (error) {
      console.error("Error creating TV:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateTV = async (e) => {
    e.preventDefault();
    if (!isEnabled) {
      return;
    }
    setIsUpdating(true);
    try {
      await updateTV(restaurantId, editingTV._id, editingTV);
      setEditingTV(null);
      setIsEditDialogOpen(false);
      fetchTVs();
    } catch (error) {
      console.error("Error updating TV:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTV = async (tvId) => {
    if (!isEnabled) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTV(restaurantId, tvId);
      fetchTVs();
    } catch (error) {
      console.error("Error deleting TV:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchTVs();
  }, [restaurantId, isEnabled]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">TVs</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isEnabled}>
              <Plus className="mr-2 h-4 w-4" /> Add TV
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New TV</DialogTitle>
              <DialogDescription>
                Enter the name for the new TV.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTV}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tv-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="tv-name"
                    value={newTV.name}
                    onChange={(e) =>
                      setNewTV({ ...newTV, name: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add TV"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          {tvs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No TVs added yet.
            </div>
          ) : (
            tvs.map((tv) => (
              <div
                key={tv._id}
                className="flex items-center justify-between p-2 hover:bg-accent hover:text-accent-foreground rounded-md"
              >
                <span>{tv.name}</span>
                <div className="space-x-2">
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTV(tv)}
                        disabled={!isEnabled}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit TV</DialogTitle>
                        <DialogDescription>
                          Make changes to the TV details here.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateTV}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="edit-tv-name"
                              className="text-right"
                            >
                              Name
                            </Label>
                            <Input
                              id="edit-tv-name"
                              value={editingTV?.name}
                              onChange={(e) =>
                                setEditingTV({
                                  ...editingTV,
                                  name: e.target.value,
                                })
                              }
                              className="col-span-3"
                              required
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={!isEnabled}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the TV and all associated images.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTV(tv._id)}
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!isEnabled}>
                        <Image className="mr-2 h-4 w-4" /> Media
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Manage Media for {tv.name}</DialogTitle>
                      </DialogHeader>
                      <MediaList
                        restaurantId={restaurantId}
                        tvId={tv._id}
                        mediaItems={tv?.mediaItems}
                        isEnabled={isEnabled}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      )}
    </div>
  );
}
