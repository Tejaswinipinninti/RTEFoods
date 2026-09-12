import { motion } from 'framer-motion';

export const Loader = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-2 border-gray-200 border-t-orange-500`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm ${className}`}>
      <div className="animate-pulse">
        <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded-full w-3/4" />
          <div className="h-3 bg-gray-200 rounded-full w-1/2" />
          <div className="h-3 bg-gray-200 rounded-full w-2/3" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonProduct = ({ className = '' }) => {
  return (
    <div className={`rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm ${className}`}>
      <div className="animate-pulse">
        <div className="relative h-48 sm:h-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]">
          <div className="absolute top-3 left-3 w-16 h-6 bg-gray-200 rounded-full" />
          <div className="absolute top-3 right-3 w-14 h-6 bg-gray-200 rounded-full" />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="h-5 bg-gray-200 rounded-full w-full" />
          <div className="h-5 bg-gray-200 rounded-full w-3/4" />
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded-full w-24" />
            <div className="h-4 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="h-10 bg-gradient-to-r from-orange-200 to-amber-200 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-full"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  );
};

export default Loader;
