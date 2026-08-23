import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Star, 
  AlertTriangle, 
  Plus, 
  Minus,
  Check
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    getProductStock,
    setIsCheckoutOpen,
    setIsCartOpen 
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Initialize selected size and color whenever product changes
  useEffect(() => {
    if (product) {
      const inStockSize = product.sizes.find(s => s.stock > 0);
      setSelectedSize(inStockSize ? inStockSize.size : (product.sizes[0]?.size || ''));
      setSelectedColor(product.colors[0] || '');
      setQuantity(1);
      setActiveImageIndex(0);
    }
  }, [product]);

  if (!product) return null;

  const currentSizeStock = getProductStock(product.id, selectedSize);
  const totalStock = product.sizes.reduce((acc, s) => acc + s.stock, 0);
  const isWishlisted = isInWishlist(product.id);

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    const res = addToCart(product, selectedSize, selectedColor, quantity);
    if (res.success) {
      // Keep modal open or let them keep browsing
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    const res = addToCart(product, selectedSize, selectedColor, quantity);
    if (res.success) {
      onClose();
      setIsCheckoutOpen(true);
    }
  };

  return (
    <div 
      id="product-detail-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="product-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl border border-[#EEEEEE] relative my-8"
      >
        {/* Close Button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] border border-[#EEEEEE] shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 p-5 sm:p-6 bg-[#F9F9F9] border-r border-[#EEEEEE] flex flex-col justify-between space-y-4">
            <div className="aspect-4/5 rounded-lg overflow-hidden bg-[#F5F5F5] relative border border-[#EEEEEE]">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-sm">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    id={`thumb-img-${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-black opacity-100'
                        : 'border-[#EEEEEE] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Vista miniatura" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantee Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#777777]">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#EEEEEE]">
                <Truck className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
                <span>Envío 24/48h</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#EEEEEE]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
                <span>Pago Seguro</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white border border-[#EEEEEE]">
                <RefreshCw className="w-3.5 h-3.5 text-[#1A1A1A] shrink-0" />
                <span>30 Días Garantía</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="md:col-span-6 p-5 sm:p-7 flex flex-col justify-between space-y-5">
            
            <div className="space-y-4">
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#777777] bg-[#F5F5F5] px-2.5 py-0.5 rounded border border-[#EEEEEE]">
                    {product.category === 'ropa' ? 'Ropa' : 'Calzado'} &bull; SKU: {product.sku}
                  </span>
                  <button
                    id="modal-wishlist-toggle"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2 rounded-full border transition-colors cursor-pointer ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'border-[#EEEEEE] text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] leading-tight">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center text-[#1A1A1A]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-black text-black' : 'text-[#EEEEEE]'}`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-[#1A1A1A]">{product.rating}</span>
                  <span className="text-[#777777]">({product.reviewCount} opiniones)</span>
                </div>
              </div>

              {/* Price & Real-Time Stock Status */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#F9F9F9] border border-[#EEEEEE]">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#1A1A1A]">
                      {product.price.toFixed(2)}€
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-[#999999] line-through">
                        {product.originalPrice.toFixed(2)}€
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#777777]">IVA incluido &bull; Envío gratis &gt; 60€</span>
                </div>

                <div className="text-right">
                  {totalStock === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Agotado
                    </span>
                  ) : totalStock <= 5 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertTriangle className="w-3 h-3" />
                      Últimas {totalStock} uds.
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1A1A1A] bg-white px-2 py-0.5 rounded border border-[#EEEEEE]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {totalStock} en stock
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#555555] leading-relaxed">
                {product.description}
              </p>

              {/* Material info */}
              {product.material && (
                <div className="text-xs text-[#777777] bg-[#F5F5F5] p-2.5 rounded-lg border border-[#EEEEEE]">
                  <span className="font-medium text-[#1A1A1A]">Material: </span>
                  {product.material}
                </div>
              )}

              {/* Color Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1A1A1A] block">
                  Color: <span className="text-[#777777] font-normal">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      id={`modal-color-${color}`}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-[#1A1A1A] border-[#EEEEEE] hover:bg-[#F5F5F5]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector with Live Stock Badges */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1A1A1A]">
                    Talla ({product.category === 'ropa' ? 'Prenda' : 'Calzado UE'}):
                  </span>
                  <span className="text-[11px] text-[#777777]">
                    {currentSizeStock > 0 ? (
                      <span className="text-[#1A1A1A] font-medium">{currentSizeStock} disponibles</span>
                    ) : (
                      <span className="text-rose-600 font-medium">Agotada</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {product.sizes.map(s => {
                    const hasStock = s.stock > 0;
                    const isSelected = selectedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        id={`modal-size-${s.size}`}
                        disabled={!hasStock}
                        onClick={() => {
                          setSelectedSize(s.size);
                          setQuantity(1);
                        }}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white border-black'
                            : hasStock
                            ? 'bg-white text-[#1A1A1A] border-[#EEEEEE] hover:border-[#CCCCCC]'
                            : 'bg-[#F5F5F5] text-[#AAAAAA] border-[#EEEEEE] cursor-not-allowed line-through'
                        }`}
                      >
                        <div className="text-xs font-semibold">{s.size}</div>
                        <div className={`text-[9px] ${isSelected ? 'text-[#CCCCCC]' : 'text-[#777777]'}`}>
                          {hasStock ? `${s.stock} uds.` : '0'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Counter */}
              {currentSizeStock > 0 && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-medium text-[#1A1A1A]">Cantidad:</span>
                  <div className="flex items-center border border-[#EEEEEE] rounded-lg overflow-hidden bg-[#F5F5F5]">
                    <button
                      id="modal-qty-decrease"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-1.5 hover:bg-[#EEEEEE] text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-semibold text-[#1A1A1A] min-w-7 text-center">
                      {quantity}
                    </span>
                    <button
                      id="modal-qty-increase"
                      disabled={quantity >= currentSizeStock}
                      onClick={() => setQuantity(q => Math.min(currentSizeStock, q + 1))}
                      className="p-1.5 hover:bg-[#EEEEEE] text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {quantity >= currentSizeStock && (
                    <span className="text-[10px] text-[#777777]">
                      Máximo disponible
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-2 pt-3 border-t border-[#EEEEEE]">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  id="modal-add-to-cart-btn"
                  disabled={currentSizeStock === 0}
                  onClick={handleAddToCart}
                  className="py-2.5 px-3 rounded-lg bg-white border border-[#1A1A1A] hover:bg-[#F5F5F5] disabled:border-[#EEEEEE] disabled:bg-[#F5F5F5] disabled:text-[#999999] text-[#1A1A1A] font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Añadir a la Bolsa</span>
                </button>

                <button
                  id="modal-buy-now-btn"
                  disabled={currentSizeStock === 0}
                  onClick={handleBuyNow}
                  className="py-2.5 px-3 rounded-lg bg-black hover:bg-zinc-800 disabled:bg-[#EEEEEE] disabled:text-[#999999] text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Comprar Ahora</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
