import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { RestaurantContext } from '../contexts/RestaurantContext';
import { useContext } from 'react';

export function useSecretCode() {
  const [secretCode, setSecretCode] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const { getRestaurantBySecretCodeword } = useContext(RestaurantContext);

  useEffect(() => {
    const storedCode = localStorage.getItem('secretCode');
    if (storedCode) {
      setSecretCode(storedCode);
      setIsDialogOpen(false);
    }
  }, []);

  const { data: restaurant, isLoading, error, refetch } = useQuery(
    ['restaurant', secretCode],
    () => getRestaurantBySecretCodeword(secretCode),
    {
      enabled: !!secretCode,
      retry: false,
    }
  );

  const handleSecretCodeSubmit = (code) => {
    setSecretCode(code);
    localStorage.setItem('secretCode', code);
    refetch();
  };

  const handleEditSecretCode = () => {
    setIsDialogOpen(true);
  };

  return {
    secretCode,
    setSecretCode,
    isDialogOpen,
    setIsDialogOpen,
    restaurant,
    isLoading,
    error,
    handleSecretCodeSubmit,
    handleEditSecretCode,
  };
}

