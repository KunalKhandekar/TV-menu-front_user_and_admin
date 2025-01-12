import React, { useContext } from 'react';
import { RestaurantContext } from '../contexts/RestaurantContext';
import { SecretCodeDialog } from './SecretCodeDialog';

function Homepage() {
  const { getRestaurantBySecretCodeword } = useContext(RestaurantContext);

  const handleSecretCodeSubmit = async (code) => {
    try {
      const restaurant = await getRestaurantBySecretCodeword(code.trim());
      if (restaurant) {
        return { 
          success: true, 
          restaurantId: restaurant?._id, 
          isEnabled: restaurant?.isEnabled 
        };
      } else {
        return { success: false };
      }
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      return { success: false };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SecretCodeDialog onSubmit={handleSecretCodeSubmit} />
    </div>
  );
}

export default Homepage;

