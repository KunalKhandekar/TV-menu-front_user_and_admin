import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RestaurantContext } from '../contexts/RestaurantContext';
import FullscreenGallery from './FullscreenGallery';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
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

function MediaPage() {
  const navigate = useNavigate();
  const { id, tvId } = useParams();
  const { getRestaurant, getMediaItems } = useContext(RestaurantContext);
  const [restaurant, setRestaurant] = useState(null);
  const [mediaData, setMediaData] = useState({
    images: [],
    videos: [],
    all: []
  });
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(() => {
    const stored = localStorage.getItem('isSliding');
    return stored !== null ? JSON.parse(stored) : true;
  });
  const [slidingTime, setSlidingTime] = useState(() => {
    const stored = localStorage.getItem('slidingTime');
    return stored !== null ? JSON.parse(stored) : 5000;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await getRestaurant(id);
        setRestaurant(restaurantData);
        const mediaData = await getMediaItems(id, tvId);
        setMediaData(mediaData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, tvId, getRestaurant, getMediaItems]);

  useEffect(() => {
    localStorage.setItem('isSliding', JSON.stringify(isSliding));
  }, [isSliding]);

  useEffect(() => {
    localStorage.setItem('slidingTime', JSON.stringify(slidingTime));
  }, [slidingTime]);

  const openFullscreen = useCallback((index) => {
    setInitialMediaIndex(index);
    setIsFullscreenOpen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  const memoizedFullscreenGallery = useMemo(() => (
    isFullscreenOpen && (
      <FullscreenGallery
        mediaItems={mediaData.all}
        initialIndex={initialMediaIndex}
        isSliding={isSliding}
        slidingTime={slidingTime}
        onClose={closeFullscreen}
      />
    )
  ), [isFullscreenOpen, mediaData.all, initialMediaIndex, isSliding, slidingTime, closeFullscreen]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-xl font-semibold">Loading media...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Error</h2>
        <p className="text-xl text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => navigate(`/restaurant/${id}`)}>
          Return to TV List
        </Button>
      </div>
    );
  }

  if (!restaurant || mediaData.all.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4">No Media Found</h2>
        <p className="text-xl text-muted-foreground mb-4">There are currently no media items to display for this TV.</p>
        <Button onClick={() => navigate(`/restaurant/${id}`)}>
          Return to TV List
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
                onClick={() => navigate(`/restaurant/${id}`)}
                className="text-foreground"
                aria-label="Go back to TV list"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-semibold">
                {restaurant.name} - {restaurant.tvs.find(tv => tv._id === tvId)?.name}
              </h1>
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
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {mediaData.all.map((item, index) => (
                <div
                  key={item._id}
                  className="cursor-pointer aspect-video relative rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity"
                  onClick={() => openFullscreen(index)}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
            
          </CardContent>
        </Card>
      </div>

      {memoizedFullscreenGallery}
    </div>
  );
}

export default MediaPage;

