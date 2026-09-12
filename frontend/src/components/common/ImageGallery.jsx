import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn } from 'lucide-react';

const ImageGallery = ({ images = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  if (!images.length) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
        <div className="text-center text-gray-400">
          <ZoomIn className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">No image available</p>
        </div>
      </div>
    );
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const getImageSrc = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
    if (img.startsWith('http')) return img;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${img}`;
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div
        className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square cursor-zoom-in border border-gray-200"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={getImageSrc(images[selectedIndex])}
            alt={`Product image ${selectedIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80';
            }}
            style={
              isZoomed
                ? {
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    transform: 'scale(2)',
                  }
                : {}
            }
          />
        </AnimatePresence>
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-gray-600">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-orange-500 shadow-md shadow-orange-500/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={getImageSrc(image)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=60';
                }}
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
