import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  SlidersHorizontal, 
  PackageCheck, 
  Search, 
  Boxes, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCategory } from '../types';

interface NavbarProps {
  activeCategory: 'todos' | ProductCategory | 'ofertas';
  onSelectCategory: (cat: 'todos' | ProductCategory | 'ofertas') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const { 
    cart, 
    orders, 
    products,
    setIsCartOpen, 
    setIsInventoryOpen, 
    setIsOrderHistoryOpen 
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Check low stock count across inventory
  const lowStockCount = products.filter(p => {
    const totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
    return totalStock > 0 && totalStock <= 6;
  }).length;

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-[#1A1A1A] border-b border-[#EEEEEE] transition-all">
      {/* Top micro announcement bar */}
      <div id="top-announcement-bar" className="bg-[#F9F9F9] text-[#777777] border-b border-[#EEEEEE] px-4 py-1.5 text-center text-xs font-normal tracking-tight flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
        <span>Envío gratis a partir de 60€ &bull; Usa el cupón <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-mono font-medium">MODA10</span> para un 10% dto.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button 
              id="brand-logo-btn"
              onClick={() => onSelectCategory('todos')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xs tracking-tighter">
                MC
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tighter text-[#1A1A1A] block leading-none">
                  MODERN&bull;STORE
                </span>
                <span className="text-[10px] font-medium text-[#999999] tracking-widest uppercase mt-0.5 block">
                  Moda & Calzado
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav id="desktop-category-nav" className="hidden md:flex items-center gap-1">
              <button
                id="nav-cat-all"
                onClick={() => onSelectCategory('todos')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === 'todos'
                    ? 'bg-black text-white font-semibold'
                    : 'text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]'
                }`}
              >
                Todo
              </button>
              <button
                id="nav-cat-ropa"
                onClick={() => onSelectCategory('ropa')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === 'ropa'
                    ? 'bg-black text-white font-semibold'
                    : 'text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]'
                }`}
              >
                Ropa
              </button>
              <button
                id="nav-cat-calzado"
                onClick={() => onSelectCategory('calzado')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === 'calzado'
                    ? 'bg-black text-white font-semibold'
                    : 'text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]'
                }`}
              >
                Calzado
              </button>
              <button
                id="nav-cat-ofertas"
                onClick={() => onSelectCategory('ofertas')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === 'ofertas'
                    ? 'bg-black text-white font-semibold'
                    : 'text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5]'
                }`}
              >
                Rebajas
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="desktop-search-input"
              type="text"
              placeholder="Buscar productos, tallas..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#F5F5F5] text-xs text-[#1A1A1A] placeholder-[#999999] pl-9 pr-7 py-2 rounded-lg border border-[#EEEEEE] focus:bg-white focus:border-black focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                id="clear-search-btn"
                onClick={() => onSearchChange('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#1A1A1A] text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Inventory Real-Time Manager Button */}
            <button
              id="open-inventory-btn"
              onClick={() => setIsInventoryOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-[#F5F5F5] border border-[#EEEEEE] text-[#1A1A1A] font-medium text-xs transition-all group"
              title="Gestión de Inventario en Tiempo Real"
            >
              <Boxes className="w-3.5 h-3.5 text-[#555555]" />
              <span className="hidden sm:inline">Inventario</span>
              {lowStockCount > 0 && (
                <span className="bg-[#F5F5F5] border border-[#EEEEEE] text-[#777777] text-[10px] font-medium px-1.5 py-0.5 rounded">
                  {lowStockCount} alertas
                </span>
              )}
            </button>

            {/* Orders History Button */}
            {orders.length > 0 && (
              <button
                id="open-orders-btn"
                onClick={() => setIsOrderHistoryOpen(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-lg bg-white hover:bg-[#F5F5F5] border border-[#EEEEEE] text-[#1A1A1A] text-xs font-medium flex items-center gap-1.5 transition-all"
                title="Mis Pedidos"
              >
                <PackageCheck className="w-3.5 h-3.5 text-[#555555]" />
                <span className="hidden md:inline">Pedidos</span>
                <span className="bg-[#F5F5F5] text-[#1A1A1A] text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {orders.length}
                </span>
              </button>
            )}

            {/* Cart Button */}
            <button
              id="open-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white font-medium text-xs transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-3.5 h-3.5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="hidden xs:inline">Cesta</span>
              {totalCartItems > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white border border-[#EEEEEE] text-[#1A1A1A] hover:bg-[#F5F5F5]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-dropdown-menu" className="md:hidden py-3 border-t border-[#EEEEEE] space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Buscar ropa, calzado..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#F5F5F5] text-xs text-[#1A1A1A] placeholder-[#999999] pl-8 pr-3 py-2 rounded-lg border border-[#EEEEEE] focus:bg-white focus:border-black focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="mobile-cat-all"
                onClick={() => { onSelectCategory('todos'); setMobileMenuOpen(false); }}
                className={`p-2 rounded-lg text-xs font-medium text-center ${
                  activeCategory === 'todos' ? 'bg-black text-white' : 'bg-[#F5F5F5] text-[#555555]'
                }`}
              >
                Todo
              </button>
              <button
                id="mobile-cat-ropa"
                onClick={() => { onSelectCategory('ropa'); setMobileMenuOpen(false); }}
                className={`p-2 rounded-lg text-xs font-medium text-center ${
                  activeCategory === 'ropa' ? 'bg-black text-white' : 'bg-[#F5F5F5] text-[#555555]'
                }`}
              >
                Ropa
              </button>
              <button
                id="mobile-cat-calzado"
                onClick={() => { onSelectCategory('calzado'); setMobileMenuOpen(false); }}
                className={`p-2 rounded-lg text-xs font-medium text-center ${
                  activeCategory === 'calzado' ? 'bg-black text-white' : 'bg-[#F5F5F5] text-[#555555]'
                }`}
              >
                Calzado
              </button>
              <button
                id="mobile-cat-ofertas"
                onClick={() => { onSelectCategory('ofertas'); setMobileMenuOpen(false); }}
                className={`p-2 rounded-lg text-xs font-medium text-center ${
                  activeCategory === 'ofertas' ? 'bg-black text-white' : 'bg-[#F5F5F5] text-[#555555]'
                }`}
              >
                Rebajas
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

