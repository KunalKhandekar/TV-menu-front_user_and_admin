import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';

export function SecretCodeDialog({ onSubmit }) {
  const [open, setOpen] = useState(true);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCode = localStorage.getItem('secretCode');
    if (storedCode) {
      handleSubmit(storedCode);
    }
  }, []);

  const handleSubmit = async (submittedCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onSubmit(submittedCode);
      if (result.success) {
        if (result.isEnabled) {
          localStorage.setItem('secretCode', submittedCode);
          navigate(`/restaurant/${result.restaurantId}`);
        } else {
          setError("This restaurant is currently disabled.");
        }
      } else {
        setError("Invalid secret code. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting code:", err);
      setError("An error occurred. Please try again.");
      toast.error("Error: Unable to process the secret code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Secret Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(code);
        }}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your secret code"
            disabled={isLoading}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <Button type="submit" className="mt-4" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

