import React from 'react';
import { Sparkles, ShieldCheck, Truck, RefreshCw, Zap, Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeroBannerProps {
  onSelectCategory: (cat: 'ropa' | 'calzado') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  const { applyCoupon, products } = useStore();

  const totalStockUnits = products.reduce(
    (acc, p) => acc + p.sizes.reduce((sAcc, s) => sAcc + s.stock, 0),
    0
  );

  return (
    <section id="hero-section" className="relative bg-[#FAFAFA] text-[#1A1A1A] pt-8 pb-12 sm:pb-14 border-b border-[#EEEEEE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Headline & Description */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-[#EEEEEE] text-[#555555] text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Inventario sincronizado ({totalStockUnits} unidades en tiempo real)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-light tracking-tight leading-tight text-[#1A1A1A]">
              Moda & Calzado con <span className="font-semibold text-black">disponibilidad en vivo</span>
            </h1>

            <p className="text-[#666666] text-sm sm:text-base max-w-xl leading-relaxed">
              Diseño contemporáneo y calzado con gestión de inventario en tiempo real y pasarela de pago segura multicanal (Tarjeta, Bizum, PayPal).
            </p>

            {/* Category Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                id="hero-btn-ropa"
                onClick={() => onSelectCategory('ropa')}
                className="px-5 py-2.5 rounded-lg bg-black hover:bg-zinc-800 text-white font-medium text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explorar Ropa</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Prendas</span>
              </button>
              <button
                id="hero-btn-calzado"
                onClick={() => onSelectCategory('calzado')}
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] font-medium text-xs border border-[#EEEEEE] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explorar Calzado</span>
                <span className="text-[10px] bg-[#F5F5F5] text-[#777777] px-1.5 py-0.5 rounded font-mono">Calzado</span>
              </button>
            </div>

            {/* Active Coupon Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#888888] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#555555]" /> Cupones:
              </span>
              <button
                id="coupon-badge-moda10"
                onClick={() => applyCoupon('MODA10')}
                className="text-xs bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] px-2.5 py-1 rounded border border-[#EEEEEE] flex items-center gap-1.5 transition-colors font-mono cursor-pointer"
                title="Haz clic para aplicar cupón"
              >
                <span>MODA10</span>
                <span className="text-[10px] text-[#777777] font-sans">(-10%)</span>
              </button>
              <button
                id="coupon-badge-verano20"
                onClick={() => applyCoupon('VERANO20')}
                className="text-xs bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] px-2.5 py-1 rounded border border-[#EEEEEE] flex items-center gap-1.5 transition-colors font-mono cursor-pointer"
                title="Haz clic para aplicar cupón (+80€)"
              >
                <span>VERANO20</span>
                <span className="text-[10px] text-[#777777] font-sans">(-20% &gt;80€)</span>
              </button>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white border border-[#EEEEEE] space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A]">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#1A1A1A]">Stock en Tiempo Real</h3>
              <p className="text-[11px] text-[#777777] leading-relaxed">Control estricto de unidades por talla con reserva instantánea.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EEEEEE] space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#1A1A1A]">Pasarela Segura</h3>
              <p className="text-[11px] text-[#777777] leading-relaxed">Procesamiento cifrado con tarjeta, Bizum y PayPal.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EEEEEE] space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A]">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#1A1A1A]">Envío 24/48h</h3>
              <p className="text-[11px] text-[#777777] leading-relaxed">Gratis en compras superiores a 60€ con seguimiento.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EEEEEE] space-y-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A]">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#1A1A1A]">Devolución 30 Días</h3>
              <p className="text-[11px] text-[#777777] leading-relaxed">Garantía total sin compromiso y gestión ágil.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

