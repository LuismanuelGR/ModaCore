import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  Truck, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    getCartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
    getProductStock
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  if (!isCartOpen) return null;

  const { subtotal, discount, shipping, tax, total } = getCartTotal();
  const freeShippingThreshold = 60;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput);
    if (res.success) {
      setCouponCodeInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div 
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex justify-end transition-opacity"
      onClick={() => setIsCartOpen(false)}
    >
      <div 
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#EEEEEE] animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-white text-[#1A1A1A] flex items-center justify-between border-b border-[#EEEEEE]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#F5F5F5] text-[#1A1A1A]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base text-[#1A1A1A]">Bolsa de la Compra</h2>
              <p className="text-xs text-[#777777]">
                {cart.length} {cart.length === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-[#F9F9F9] p-3.5 border-b border-[#EEEEEE]">
          <div className="flex items-center justify-between text-xs text-[#1A1A1A] mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-xs">
              <Truck className="w-3.5 h-3.5 text-[#777777]" />
              {remainingForFreeShipping === 0 ? (
                <span className="text-[#1A1A1A] font-semibold">Envío Estándar Gratuito</span>
              ) : (
                <span>Añade <span className="font-semibold text-[#1A1A1A]">{remainingForFreeShipping.toFixed(2)}€</span> para envío gratis</span>
              )}
            </span>
            <span className="text-[11px] text-[#777777] font-mono">{freeShippingProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#EEEEEE] h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500 rounded-full bg-black"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-[#777777]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#1A1A1A]">Tu bolsa está vacía</h3>
                <p className="text-xs text-[#777777] max-w-xs mt-1">
                  Explora nuestra colección y añade prendas con disponibilidad de stock garantizada.
                </p>
              </div>
              <button
                id="cart-empty-explore-btn"
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Ver Colección
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const liveStock = getProductStock(item.productId, item.selectedSize);
              const isStockLow = liveStock <= 3;
              const hasStockIssue = liveStock < item.quantity;

              return (
                <div
                  key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                  id={`cart-item-${item.productId}-${item.selectedSize}`}
                  className="flex gap-3 p-3 bg-white rounded-xl border border-[#EEEEEE] relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-18 h-22 object-cover rounded-lg bg-[#F5F5F5] shrink-0 border border-[#EEEEEE]"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-[#1A1A1A] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          id={`remove-cart-item-${item.productId}-${item.selectedSize}`}
                          onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                          className="text-[#999999] hover:text-[#1A1A1A] p-0.5 transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-[#777777]">
                        <span className="bg-[#F5F5F5] px-1.5 py-0.5 rounded text-[10px] font-medium text-[#1A1A1A] border border-[#EEEEEE]">
                          Talla {item.selectedSize}
                        </span>
                        <span>&bull;</span>
                        <span>{item.selectedColor}</span>
                      </div>

                      {/* Stock Alert */}
                      {hasStockIssue ? (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-rose-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Solo {liveStock} disponibles</span>
                        </div>
                      ) : isStockLow ? (
                        <div className="text-[10px] text-amber-600 font-medium">
                          Últimas {liveStock} unidades
                        </div>
                      ) : null}
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#EEEEEE] rounded-md overflow-hidden bg-[#F5F5F5]">
                        <button
                          id={`cart-decrease-${item.productId}-${item.selectedSize}`}
                          onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="p-1 hover:bg-[#EEEEEE] text-[#1A1A1A] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium text-[#1A1A1A]">
                          {item.quantity}
                        </span>
                        <button
                          id={`cart-increase-${item.productId}-${item.selectedSize}`}
                          disabled={item.quantity >= liveStock}
                          onClick={() => updateCartQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="p-1 hover:bg-[#EEEEEE] text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-semibold text-xs sm:text-sm text-[#1A1A1A]">
                        {(item.product.price * item.quantity).toFixed(2)}€
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 bg-[#FAFAFA] border-t border-[#EEEEEE] space-y-3">
            
            {/* Coupon Promo Input Form */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-white border border-[#EEEEEE] rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-[#1A1A1A] font-medium">
                    <Tag className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Cupón "{appliedCoupon.code}" (-{appliedCoupon.discountPercentage}%)</span>
                  </div>
                  <button
                    id="remove-coupon-btn"
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 font-medium hover:underline cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="coupon-input"
                    type="text"
                    placeholder="Código (ej: MODA10)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-white text-xs px-3 py-2 rounded-lg border border-[#EEEEEE] focus:border-black focus:outline-none uppercase font-mono"
                  />
                  <button
                    id="apply-coupon-submit-btn"
                    type="submit"
                    className="px-3.5 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1 text-xs text-[#777777] pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#1A1A1A]">{subtotal.toFixed(2)}€</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento</span>
                  <span>-{discount.toFixed(2)}€</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Envío</span>
                <span className="font-medium text-[#1A1A1A]">
                  {shipping === 0 ? (
                    <span className="text-[#1A1A1A] font-medium">Gratis</span>
                  ) : (
                    `${shipping.toFixed(2)}€`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-[#999999]">
                <span>IVA 21% incluido</span>
                <span>{tax.toFixed(2)}€</span>
              </div>

              <div className="flex justify-between text-sm font-semibold text-[#1A1A1A] pt-2 border-t border-[#EEEEEE]">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              id="cart-proceed-checkout-btn"
              onClick={handleProceedToCheckout}
              className="w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Tramitar Pedido</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#999999]">
              <span>Pasarela SSL segura</span>
              <span>&bull;</span>
              <span>Deducción de stock en vivo</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
