import { Heart, ShoppingCart, Star, Leaf } from 'lucide-react';
import { formatPrice, getDiscountPercent, truncateText } from '../../utils/helpers';

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';

const ProductCard = ({ product, onAddToCart, onWishlist }) => {
  const discount = getDiscountPercent(product.mrp, product.price);
  const imageUrl = product.coverImage || product.galleryImages?.[0] || product.image || '';

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${imageUrl}`}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMG;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
            <Leaf className="w-12 h-12 text-orange-300" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isVeg ? (
            <div className="w-6 h-6 rounded-sm border-2 border-green-600 bg-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-sm border-2 border-red-600 bg-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
            </div>
          )}
        </div>

        {discount > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-lg">
            {discount}% OFF
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onWishlist?.(product); }}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm hover:scale-120 active:scale-90"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{product.averageRating || '4.0'}</span>
          <span className="text-xs text-gray-400">({product.totalReviews || 0})</span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors text-sm sm:text-base">
          {truncateText(product.name, 50)}
        </h3>

        {product.shortDescription && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-1 hidden sm:block">
            {truncateText(product.shortDescription, 60)}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>

          <button
            onClick={() => onAddToCart?.(product)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
