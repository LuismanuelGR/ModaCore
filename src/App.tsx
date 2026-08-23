import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductFilterBar } from './components/ProductFilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { InventoryManager } from './components/InventoryManager';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { NotificationToast } from './components/NotificationToast';
import { ProductCategory } from './types';
import { 
  ShoppingBag, 
  Boxes, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Sparkles, 
  CreditCard, 
  Heart,
  SlidersHorizontal,
  ArrowUp
} from 'lucide-react';

function StoreMainContent() {
  const { 
    products, 
    selectedProduct, 
    setSelectedProduct, 
    setIsInventoryOpen, 
    setIsCartOpen,
    cart
  } = useStore();

  const [activeCategory, setActiveCategory] = useState<'todos' | ProductCategory | 'ofertas'>('todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesSubcat = product.subcategory.toLowerCase().includes(q);
        const matchesSize = product.sizes.some(s => s.size.toLowerCase() === q);
        if (!matchesName && !matchesSku && !matchesDesc && !matchesSubcat && !matchesSize) {
          return false;
        }
      }

      // 2. Category
      if (activeCategory === 'ropa' && product.category !== 'ropa') return false;
      if (activeCategory === 'calzado' && product.category !== 'calzado') return false;
      if (activeCategory === 'ofertas' && !product.originalPrice) return false;

      // 3. Subcategory
      if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) {
        return false;
      }

      // 4. Size Filter
      if (selectedSize !== 'all') {
        const hasSpecificSize = product.sizes.some(s => s.size === selectedSize && s.stock > 0);
        if (!hasSpecificSize) return false;
      }

      // 5. Only in stock filter
      if (onlyInStock) {
        const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
        if (totalStock <= 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'stock-desc') {
        const stockA = a.sizes.reduce((sum, s) => sum + s.stock, 0);
        const stockB = b.sizes.reduce((sum, s) => sum + s.stock, 0);
        return stockB - stockA;
      }
      // 'featured'
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [products, searchQuery, activeCategory, selectedSubcategory, selectedSize, onlyInStock, sortBy]);

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const resetAllFilters = () => {
    setActiveCategory('todos');
    setSelectedSubcategory('all');
    setSelectedSize('all');
    setSearchQuery('');
    setOnlyInStock(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] flex flex-col font-sans selection:bg-black selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSelectedSubcategory('all');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Banner with collection highlights & active coupons */}
      <HeroBanner
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSelectedSubcategory('all');
        }}
      />

      {/* Filter and Sorting Toolbar */}
      <ProductFilterBar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectSubcategory={setSelectedSubcategory}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onlyInStock={onlyInStock}
        onToggleOnlyInStock={() => setOnlyInStock(!onlyInStock)}
        totalResults={filteredProducts.length}
      />

      {/* Main Catalog Grid Section */}
      <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
        
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#1A1A1A] tracking-tight">
              {activeCategory === 'todos' && 'Catálogo de Colección'}
              {activeCategory === 'ropa' && 'Ropa & Prendas de Temporada'}
              {activeCategory === 'calzado' && 'Calzado & Sneakers'}
              {activeCategory === 'ofertas' && 'Rebajas & Precios Especiales'}
            </h2>
            <p className="text-xs text-[#777777] mt-0.5">
              Stock verificado en tiempo real con reserva por talla
            </p>
          </div>

          {(activeCategory !== 'todos' || selectedSubcategory !== 'all' || selectedSize !== 'all' || searchQuery || onlyInStock) && (
            <button
              id="clear-all-filters-btn"
              onClick={resetAllFilters}
              className="text-xs font-medium text-[#1A1A1A] bg-white hover:bg-[#F5F5F5] px-3 py-1.5 rounded-lg border border-[#EEEEEE] transition-colors cursor-pointer"
            >
              ✕ Restablecer Filtros
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center border border-[#EEEEEE] shadow-xs max-w-md mx-auto space-y-3 my-8">
            <div className="w-12 h-12 rounded-lg bg-[#F5F5F5] text-[#777777] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A]">No hay productos coincidentes</h3>
              <p className="text-xs text-[#777777] mt-1">
                Prueba ajustando los filtros de talla, categoría o término de búsqueda.
              </p>
            </div>
            <button
              id="reset-search-state-btn"
              onClick={resetAllFilters}
              className="px-4 py-2 bg-black text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Ver Todos los Productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </main>

      {/* Floating Action Buttons for quick navigation */}
      <div className="fixed bottom-6 left-6 z-30 flex flex-col gap-2.5">
        <button
          id="floating-inventory-btn"
          onClick={() => setIsInventoryOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium border border-zinc-700 shadow-lg transition-all hover:scale-102 active:scale-98 cursor-pointer"
          title="Abrir Panel de Control de Inventario en Tiempo Real"
        >
          <Boxes className="w-3.5 h-3.5 text-white" />
          <span>Gestión de Stock</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
      </div>

      {/* Footer */}
      <footer id="main-footer" className="bg-white text-[#555555] border-t border-[#EEEEEE] mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#EEEEEE]">
            
            {/* Brand column */}
            <div className="space-y-2.5 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-black text-white flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <span className="font-semibold text-sm text-[#1A1A1A] tracking-wider">
                  MODA & CALZADO
                </span>
              </div>
              <p className="text-[#777777] text-xs leading-relaxed">
                Tienda de moda y calzado con control de existencias en tiempo real y pasarela de pago segura.
              </p>
              <div className="flex items-center gap-1.5 text-[#1A1A1A] text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Inventario y pagos sincronizados</span>
              </div>
            </div>

            {/* Guarantees */}
            <div className="space-y-2">
              <h4 className="font-semibold text-[#1A1A1A] uppercase text-[11px] tracking-wider">Pasarela & Pagos</h4>
              <ul className="space-y-1.5 text-[#777777]">
                <li className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-[#1A1A1A]" /> Tarjetas Visa, Mastercard, AMEX</li>
                <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#1A1A1A]" /> Bizum Instantáneo</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#1A1A1A]" /> Encriptación SSL 256-bit</li>
              </ul>
            </div>

            {/* Logística */}
            <div className="space-y-2">
              <h4 className="font-semibold text-[#1A1A1A] uppercase text-[11px] tracking-wider">Envíos & Garantía</h4>
              <ul className="space-y-1.5 text-[#777777]">
                <li className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#1A1A1A]" /> Envíos 24/48h a toda la península</li>
                <li className="flex items-center gap-1.5"><Boxes className="w-3.5 h-3.5 text-[#1A1A1A]" /> Reserva automática de stock</li>
                <li className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-[#1A1A1A]" /> 30 días para devoluciones</li>
              </ul>
            </div>

            {/* Quick Access */}
            <div className="space-y-2">
              <h4 className="font-semibold text-[#1A1A1A] uppercase text-[11px] tracking-wider">Administración</h4>
              <p className="text-[11px] text-[#777777]">
                Acceso para administración y visualización de existencias por talla en tiempo real.
              </p>
              <button
                id="footer-open-inv-btn"
                onClick={() => setIsInventoryOpen(true)}
                className="mt-1 text-xs font-medium text-[#1A1A1A] hover:underline cursor-pointer flex items-center gap-1"
              >
                Abrir Panel de Inventario →
              </button>
            </div>

          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[#999999] text-[11px]">
            <p>© {new Date().getFullYear()} MODA & CALZADO. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4 text-[#777777]">
              <span className="hover:text-[#1A1A1A] cursor-pointer">Aviso Legal</span>
              <span>&bull;</span>
              <span className="hover:text-[#1A1A1A] cursor-pointer">Política de Privacidad</span>
              <span>&bull;</span>
              <span className="hover:text-[#1A1A1A] cursor-pointer">Términos y Condiciones</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer />
      <CheckoutModal />
      <InventoryManager />
      <OrderHistoryModal />
      <NotificationToast />

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreMainContent />
    </StoreProvider>
  );
}
