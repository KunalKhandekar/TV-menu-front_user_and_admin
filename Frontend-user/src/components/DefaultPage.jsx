import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from "../contexts/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from 'lucide-react';

const DefaultPage = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-xl mb-8 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="default" size="lg">
            Go to Homepage
          </Button>
        </Link>
      </div>
      <div className="mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </div>
  );
};

export default DefaultPage;

