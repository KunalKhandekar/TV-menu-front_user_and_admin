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
import { Plus, Trash2, Loader2, Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MediaList({
  restaurantId,
  tvId,
  mediaItems: initialMediaItems,
  isEnabled,
}) {
  const { getMediaItems, addMediaItem, deleteMediaItem } =
    useContext(RestaurantContext);
  const [media, setMedia] = useState({
    images: [],
    videos: [],
    all: initialMediaItems || [],
  });
  const [newMedia, setNewMedia] = useState({ name: "", file: null });
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedia = async () => {
    if (!isEnabled) return;
    setIsLoading(true);
    try {
      const fetchedMedia = await getMediaItems(restaurantId, tvId);
      setMedia(fetchedMedia);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [tvId, isEnabled]);

  const detectMediaType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    throw new Error("Unsupported file type");
  };

  const handleCreateMedia = async (e) => {
    e.preventDefault();
    if (!isEnabled) {
      return;
    }
    if (newMedia.file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", newMedia.file);
      formData.append("upload_preset", "TVMENU_WIth_Videos");

      try {
        const mediaType = detectMediaType(newMedia.file);
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dbknvlcnl/${mediaType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }
        await addMediaItem(restaurantId, tvId, {
          name: newMedia.name,
          url: data.secure_url,
          type: mediaType,
        });
        setNewMedia({ name: "", file: null });
        fetchMedia();
      } catch (error) {
        console.error("Error uploading media:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!isEnabled) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteMediaItem(restaurantId, tvId, mediaId);
      fetchMedia();
    } catch (error) {
      console.error("Error deleting media:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderMediaItem = (item) => {
    if (item.type === "image") {
      return (
        <img
          src={item.url}
          alt={item.name}
          className="w-full h-40 object-cover rounded-md"
        />
      );
    } else if (item.type === "video") {
      return (
        <div className="relative w-full h-40">
          <video
            src={item.url}
            className="w-full h-40 object-cover rounded-md"
            poster="https://wallpapers.com/images/featured/plain-grey-background-ydlwqztavi78gl24.jpg"
            onLoadedData={(e) => e.currentTarget.removeAttribute("poster")}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-70" />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Media</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={!isEnabled}>
              <Plus className="mr-2 h-4 w-4" /> Add Media
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Media</DialogTitle>
              <DialogDescription>
                Upload a new image or video for this TV.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMedia}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="media-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="media-name"
                    value={newMedia.name}
                    onChange={(e) =>
                      setNewMedia({ ...newMedia, name: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="media-file" className="text-right">
                    File
                  </Label>
                  <Input
                    id="media-file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) =>
                      setNewMedia({ ...newMedia, file: e.target.files[0] })
                    }
                    className="col-span-3"
                    required
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
                    "Upload Media"
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
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            <TabsContent value="all">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.all.length === 0 ? (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    No media added yet.
                  </div>
                ) : (
                  media.all.map((item) => (
                    <div key={item._id} className="relative group">
                      {renderMediaItem(item)}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                                This action cannot be undone. This will
                                permanently delete this {item.type}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMedia(item._id)}
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
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="images">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.images.length === 0 ? (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    No images added yet.
                  </div>
                ) : (
                  media.images.map((image) => (
                    <div key={image._id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                                This action cannot be undone. This will
                                permanently delete this image.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMedia(image._id)}
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
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.videos.length === 0 ? (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    No videos added yet.
                  </div>
                ) : (
                  media.videos.map((video) => (
                    <div key={video._id} className="relative group">
                      <div className="relative w-full h-40">
                        <video
                          src={video.url}
                          className="w-full h-40 object-cover rounded-md"
                          poster="https://wallpapers.com/images/featured/plain-grey-background-ydlwqztavi78gl24.jpg"
                          onLoadedData={(e) =>
                            e.currentTarget.removeAttribute("poster")
                          }
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-12 h-12 text-white opacity-70" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                                This action cannot be undone. This will
                                permanently delete this video.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteMedia(video._id)}
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
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      )}
    </div>
  );
}
