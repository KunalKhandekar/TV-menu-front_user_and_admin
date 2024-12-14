import React, { useState, useContext, useEffect } from "react";
import { RestaurantContext } from "../../contexts/RestaurantContext";
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
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from "react-hot-toast";

export default function ImageList({ restaurantId, tvId, Images_List }) {
  const { getImages, addImage, deleteImage } = useContext(RestaurantContext);
  const [images, setImages] = useState(Images_List);
  const [newImage, setNewImage] = useState({ name: "", file: null });
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    fetchImages(); 
  }, [tvId]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const fetchedImages = await getImages(restaurantId, tvId);
      setImages(fetchedImages);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to fetch images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateImage = async (e) => {
    e.preventDefault();
    if (newImage.file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", newImage.file);
      formData.append("upload_preset", "tv-menu");

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dbknvlcnl/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        await addImage(restaurantId, tvId, {
          name: newImage.name,
          url: data.secure_url,
        });
        setNewImage({ name: "", file: null });
        fetchImages();
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(`Failed to upload image: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteImage = async (imageId) => {
    setIsDeleting(true);
    try {
      await deleteImage(restaurantId, tvId, imageId);
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error(`Failed to delete image: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Images</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
              <DialogDescription>
                Upload a new image for this TV.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateImage}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="image-name"
                    value={newImage.name}
                    onChange={(e) => setNewImage({ ...newImage, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image-file" className="text-right">
                    Image
                  </Label>
                  <Input
                    id="image-file"
                    type="file"
                    onChange={(e) => setNewImage({ ...newImage, file: e.target.files[0] })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Image"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-500">No images added yet.</div>
            ) : (
              images.map((image) => (
                <div key={image._id} className="relative group">
                  <img src={image.url} alt={image.name} className="w-full h-40 object-cover rounded-md" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the image.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteImage(image._id)} disabled={isDeleting}>
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
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

