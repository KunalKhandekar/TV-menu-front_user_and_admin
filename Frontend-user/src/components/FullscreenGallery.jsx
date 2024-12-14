import React, { useState, useEffect, useCallback, useRef, memo } from 'react';

const FullscreenGallery = memo(({ images, initialIndex = 0, isSliding, slidingTime, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }, []);

  const handleClose = useCallback(() => {
    exitFullscreen();
    onClose();
  }, [exitFullscreen, onClose]);

  useEffect(() => {
    const enterFullscreen = () => {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.msRequestFullscreen) {
          containerRef.current.msRequestFullscreen();
        }
      }
    };

    enterFullscreen();

    return () => {
      exitFullscreen();
    };
  }, [exitFullscreen]);

  useEffect(() => {
    if (isSliding) {
      timerRef.current = setInterval(goToNext, slidingTime);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSliding, slidingTime, goToNext]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowRight':
          goToNext();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'Escape':
          handleClose();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, handleClose]);

  const NavigationButton = useCallback(({ direction, onClick }) => (
    <button
      onClick={onClick}
      className="bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 text-white transition-colors duration-200"
      aria-label={`${direction} image`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={direction === 'Previous' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
      </svg>
    </button>
  ), []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <img
        src={images[currentIndex].url}
        alt={`Full-screen view ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain"
      />
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
          <NavigationButton direction="Previous" onClick={goToPrevious} />
          <NavigationButton direction="Next" onClick={goToNext} />
        </div>
      )}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-colors duration-200"
        aria-label="Close full-screen image"
      >
        &times;
      </button>
    </div>
  );
});

FullscreenGallery.displayName = 'FullscreenGallery';

export default FullscreenGallery;

