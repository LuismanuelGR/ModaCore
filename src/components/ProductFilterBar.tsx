import React from 'react';
import { Filter, ArrowUpDown, Check, X, SlidersHorizontal } from 'lucide-react';
import { ProductCategory, ProductSubcategory } from '../types';

interface ProductFilterBarProps {
  activeCategory: 'todos' | ProductCategory | 'ofertas';
  onSelectCategory: (cat: 'todos' | ProductCategory | 'ofertas') => void;
  selectedSubcategory: string;
  onSelectSubcategory: (sub: string) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onlyInStock: boolean;
  onToggleOnlyInStock: () => void;
  totalResults: number;
}

const ROPA_SUBCATS: { id: ProductSubcategory; label: string }[] = [
  { id: 'camisetas', label: 'Camisetas' },
  { id: 'sudaderas', label: 'Sudaderas' },
  { id: 'chaquetas', label: 'Chaquetas' },
  { id: 'pantalones', label: 'Pantalones' },
  { id: 'vestidos', label: 'Vestidos' },
];

const CALZADO_SUBCATS: { id: ProductSubcategory; label: string }[] = [
  { id: 'zapatillas', label: 'Zapatillas' },
  { id: 'botas', label: 'Botas' },
  { id: 'casual', label: 'Casual' },
  { id: 'elegante', label: 'Elegantes' },
];

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const FOOTWEAR_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44'];

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory,
  selectedSize,
  onSelectSize,
  sortBy,
  onSortByChange,
  onlyInStock,
  onToggleOnlyInStock,
  totalResults,
}) => {
  const isClothing = activeCategory === 'ropa';
  const isFootwear = activeCategory === 'calzado';

  return (
    <div id="product-filter-bar" className="bg-white border-b border-[#EEEEEE] py-3.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        
        {/* Main row: Categories + Sort dropdown + In-stock toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full">
            <button
              id="filter-tab-all"
              onClick={() => {
                onSelectCategory('todos');
                onSelectSubcategory('all');
                onSelectSize('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'todos'
                  ? 'bg-black text-white font-semibold'
                  : 'bg-[#F5F5F5] text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              Todos
            </button>
            <button
              id="filter-tab-ropa"
              onClick={() => {
                onSelectCategory('ropa');
                onSelectSubcategory('all');
                onSelectSize('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'ropa'
                  ? 'bg-black text-white font-semibold'
                  : 'bg-[#F5F5F5] text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              Ropa
            </button>
            <button
              id="filter-tab-calzado"
              onClick={() => {
                onSelectCategory('calzado');
                onSelectSubcategory('all');
                onSelectSize('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'calzado'
                  ? 'bg-black text-white font-semibold'
                  : 'bg-[#F5F5F5] text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              Calzado
            </button>
            <button
              id="filter-tab-ofertas"
              onClick={() => {
                onSelectCategory('ofertas');
                onSelectSubcategory('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'ofertas'
                  ? 'bg-black text-white font-semibold'
                  : 'bg-[#F5F5F5] text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              Rebajas
            </button>
          </div>

          {/* Right Controls: Sort & Stock Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            
            {/* In Stock Only Switch */}
            <label 
              id="filter-in-stock-toggle" 
              className="flex items-center gap-2 cursor-pointer text-xs font-normal text-[#555555] bg-[#F5F5F5] hover:bg-[#EEEEEE] px-3 py-1.5 rounded-lg border border-[#EEEEEE] transition-colors select-none"
            >
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={onToggleOnlyInStock}
                className="rounded text-black focus:ring-black w-3.5 h-3.5 cursor-pointer accent-black"
              />
              <span>En stock</span>
            </label>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#F5F5F5] px-2.5 py-1.5 rounded-lg border border-[#EEEEEE]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#777777]" />
              <select
                id="sort-products-select"
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#1A1A1A] focus:outline-none cursor-pointer pr-1"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="stock-desc">Mayor Stock</option>
                <option value="rating">Mejor Valorados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subcategories Row (When filtering by ropa or calzado) */}
        {(isClothing || isFootwear) && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            <span className="text-[#999999] font-medium whitespace-nowrap text-[11px]">Tipo:</span>
            <button
              id="subcat-all"
              onClick={() => onSelectSubcategory('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                selectedSubcategory === 'all'
                  ? 'bg-black text-white'
                  : 'bg-[#F5F5F5] text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              Todos
            </button>
            {(isClothing ? ROPA_SUBCATS : CALZADO_SUBCATS).map(sub => (
              <button
                key={sub.id}
                id={`subcat-${sub.id}`}
                onClick={() => onSelectSubcategory(sub.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize cursor-pointer ${
                  selectedSubcategory === sub.id
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-[#777777] hover:text-[#1A1A1A]'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Sizes Quick Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EEEEEE]">
          <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
            <span className="text-[#999999] font-medium mr-1 whitespace-nowrap text-[11px]">Talla:</span>
            <button
              id="size-filter-all"
              onClick={() => onSelectSize('all')}
              className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                selectedSize === 'all'
                  ? 'bg-black text-white'
                  : 'bg-[#F5F5F5] text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              Todas
            </button>
            {(isFootwear ? FOOTWEAR_SIZES : isClothing ? CLOTHING_SIZES : [...CLOTHING_SIZES, ...FOOTWEAR_SIZES.slice(0, 5)]).map(size => (
              <button
                key={size}
                id={`size-filter-${size}`}
                onClick={() => onSelectSize(size)}
                className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                  selectedSize === size
                    ? 'bg-black text-white'
                    : 'bg-[#F5F5F5] text-[#777777] hover:text-[#1A1A1A]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#777777] font-normal">
            <span className="font-semibold text-[#1A1A1A]">{totalResults}</span> productos
          </div>
        </div>

      </div>
    </div>
  );
};
