import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, AlertTriangle, Check, Zap } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setSelectedProduct,
    getProductStock 
  } = useStore();

  const [selectedSize, setSelectedSize] = useState<string>(() => {
    // Pick the first size that has stock, otherwise first size
    const inStockSize = product.sizes.find(s => s.stock > 0);
    return inStockSize ? inStockSize.size : (product.sizes[0]?.size || '');
  });

  const [selectedColor] = useState<string>(product.colors[0] || '');
  const [isHovered, setIsHovered] = useState(false);

  const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
  const currentSizeStock = getProductStock(product.id, selectedSize);
  const isWishlisted = isInWishlist(product.id);

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSize) return;
    addToCart(product, selectedSize, selectedColor, 1);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => setSelectedProduct(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-xl border border-[#EEEEEE] hover:border-black/25 overflow-hidden transition-all duration-200 flex flex-col cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/5 bg-[#F7F7F7] overflow-hidden">
        
        {/* Main image / Secondary image on hover */}
        <img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded tracking-wide">
              Nuevo
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWishlisted
              ? 'bg-black text-white'
              : 'bg-white/80 hover:bg-white text-[#1A1A1A] border border-[#EEEEEE]'
          }`}
          title={isWishlisted ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Real-Time Stock Status Floating Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {totalStock === 0 ? (
            <span className="bg-white/90 text-rose-600 border border-rose-200 text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
              Agotado
            </span>
          ) : totalStock <= 5 ? (
            <span className="bg-white/90 text-[#1A1A1A] border border-[#EEEEEE] text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {totalStock} uds restantes
            </span>
          ) : (
            <span className="bg-white/90 text-[#1A1A1A] border border-[#EEEEEE] text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {totalStock} en stock
            </span>
          )}

          {/* Quick View Button Hint */}
          <span className="opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded transition-opacity flex items-center gap-1">
            <Eye className="w-3 h-3" /> Ver
          </span>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#777777]">
            <span className="uppercase tracking-widest text-[9px] text-[#999999]">
              {product.category === 'ropa' ? 'Ropa' : 'Calzado'} &bull; {product.subcategory}
            </span>
            <div className="flex items-center gap-1 text-[#1A1A1A] font-medium text-[11px]">
              <Star className="w-3 h-3 fill-black text-black" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 className="font-medium text-[#1A1A1A] text-xs sm:text-sm leading-snug line-clamp-1">
            {product.name}
          </h3>

          <p className="text-[11px] text-[#777777] line-clamp-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Sizes Selector on Card */}
        <div className="space-y-1 pt-0.5">
          <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
            {product.sizes.map((s) => {
              const hasStock = s.stock > 0;
              const isSelected = selectedSize === s.size;
              return (
                <button
                  key={s.size}
                  id={`btn-size-${product.id}-${s.size}`}
                  disabled={!hasStock}
                  onClick={() => setSelectedSize(s.size)}
                  className={`min-w-6 h-6 px-1 text-[10px] font-medium rounded border transition-all flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white border-black'
                      : hasStock
                      ? 'bg-[#F5F5F5] text-[#1A1A1A] border-[#EEEEEE] hover:bg-[#EEEEEE]'
                      : 'bg-[#F5F5F5] text-[#CCCCCC] border-[#EEEEEE] cursor-not-allowed line-through'
                  }`}
                  title={hasStock ? `Talla ${s.size} (${s.stock} en stock)` : `Talla ${s.size} (Agotada)`}
                >
                  {s.size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing & Add to Cart Footer */}
        <div className="pt-2 border-t border-[#EEEEEE] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm sm:text-base text-[#1A1A1A]">
              {product.price.toFixed(2)}€
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-[#999999] line-through">
                {product.originalPrice.toFixed(2)}€
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            disabled={totalStock === 0 || currentSizeStock === 0}
            onClick={handleQuickAdd}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              totalStock === 0 || currentSizeStock === 0
                ? 'bg-[#F5F5F5] text-[#999999] cursor-not-allowed border border-[#EEEEEE]'
                : 'bg-black hover:bg-zinc-800 text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Añadir</span>
          </button>
        </div>

      </div>
    </div>
  );
};
