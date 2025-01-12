import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { RestaurantContext } from "../contexts/RestaurantContext";
import FullscreenGallery from "./FullscreenGallery";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

SlidingControl.displayName = "SlidingControl";

const SlidingTimeControl = React.memo(({ slidingTime, setSlidingTime }) => (
  <div className="flex items-center space-x-2">
    <Label htmlFor="sliding-time">Sliding Time</Label>
    <Select
      value={slidingTime.toString()}
      onValueChange={(value) => setSlidingTime(Number(value))}
    >
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Select time" />
      </SelectTrigger>
      <SelectContent>
        {[1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000].map(
          (time) => (
            <SelectItem key={time} value={time.toString()}>
              {time / 1000} sec
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  </div>
));

SlidingTimeControl.displayName = "SlidingTimeControl";

function TVPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getRestaurant, getTVs } = useContext(RestaurantContext);
  const [restaurant, setRestaurant] = useState(null);
  const [tvs, setTvs] = useState([]);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [initialMediaIndex, setInitialMediaIndex] = useState(0);
  const [selectedTvIndex, setSelectedTvIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(() => {
    const stored = localStorage.getItem("isSliding");
    return stored !== null ? JSON.parse(stored) : true;
  });
  const [slidingTime, setSlidingTime] = useState(() => {
    const stored = localStorage.getItem("slidingTime");
    return stored !== null ? JSON.parse(stored) : 5000;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantData = await getRestaurant(id);
        setRestaurant(restaurantData);
        if (restaurantData.isEnabled) {
          const tvsData = await getTVs(id);
          setTvs(tvsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 403) {
          setRestaurant({ isEnabled: false });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, getRestaurant, getTVs]);

  useEffect(() => {
    localStorage.setItem("isSliding", JSON.stringify(isSliding));
  }, [isSliding]);

  useEffect(() => {
    localStorage.setItem("slidingTime", JSON.stringify(slidingTime));
  }, [slidingTime]);

  const openFullscreen = useCallback((tvIndex, mediaIndex) => {
    setSelectedTvIndex(tvIndex);
    setInitialMediaIndex(mediaIndex);
    setIsFullscreenOpen(true);
  }, []);

  const closeFullscreen = useCallback(() => {
    setIsFullscreenOpen(false);
  }, []);

  const memoizedFullscreenGallery = useMemo(
    () =>
      isFullscreenOpen &&
      tvs[selectedTvIndex] && (
        <FullscreenGallery
          mediaItems={tvs[selectedTvIndex].mediaItems}
          initialIndex={initialMediaIndex}
          isSliding={isSliding}
          slidingTime={slidingTime}
          onClose={closeFullscreen}
        />
      ),
    [
      isFullscreenOpen,
      tvs,
      selectedTvIndex,
      initialMediaIndex,
      isSliding,
      slidingTime,
      closeFullscreen,
    ]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  if (!restaurant || !restaurant.isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Restaurant Disabled</AlertTitle>
          <AlertDescription>
            This restaurant is currently disabled. Please contact the
            administrator for more information.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/")} className="mt-4">
          Return to Home
        </Button>
      </div>
    );
  }

  if (tvs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4">No TVs Found</h2>
        <p className="text-xl text-muted-foreground mb-4">
          We couldn't find any TVs for this restaurant.
        </p>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
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
                onClick={() => navigate("/")}
                className="text-foreground"
                aria-label="Go back to home"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-semibold">{restaurant.name} - TVs</h1>
            </div>
            <div className="flex items-center space-x-6">
              <SlidingControl
                isSliding={isSliding}
                setIsSliding={setIsSliding}
              />
              <SlidingTimeControl
                slidingTime={slidingTime}
                setSlidingTime={setSlidingTime}
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tvs?.map((tv, tvIndex) => (
            <Card
              key={tv._id}
              className="hover:shadow-lg transition-shadow duration-300 relative pb-10"
            >
              <CardHeader>
                <CardTitle>{tv.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {tv.mediaItems.slice(0, 4).map((item, itemIndex) => (
                    <div
                      key={item._id}
                      className="aspect-w-4 aspect-h-3 cursor-pointer overflow-hidden rounded-lg bg-muted relative"
                      onClick={() => openFullscreen(tvIndex, itemIndex)}
                    >
                      {item.type === "video" ? (
                        <div className="w-full h-full">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-12 h-12 text-white opacity-70" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>

              <Link
                to={`/restaurant/${id}/tv/${tv._id}`}
                className="text-sm transition-colors hover:text-zinc-900 p-4 absolute bottom-0 left-0 right-0 
    text-zinc-400 dark:text-zinc-700 dark:hover:text-zinc-200"
              >
                View all media
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {memoizedFullscreenGallery}
    </div>
  );
}

export default TVPage;
