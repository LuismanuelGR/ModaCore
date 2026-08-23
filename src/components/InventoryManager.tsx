import React, { useState } from 'react';
import { 
  X, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  History, 
  PackagePlus, 
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, ProductSubcategory } from '../types';

export const InventoryManager: React.FC = () => {
  const { 
    isInventoryOpen, 
    setIsInventoryOpen, 
    products, 
    inventoryLogs, 
    updateStock, 
    quickAdjustStock,
    addNewProduct,
    editProduct,
    deleteProduct,
    resetToDefaultCatalog 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'inventory' | 'new-product' | 'logs'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'ropa' | 'calzado'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<ProductCategory>('ropa');
  const [newProdSubcat, setNewProdSubcat] = useState<ProductSubcategory>('camisetas');
  const [newProdPrice, setNewProdPrice] = useState<number>(39.99);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState<number>(0);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
  const [newProdColors, setNewProdColors] = useState('Negro, Blanco, Gris');
  const [newProdMaterial, setNewProdMaterial] = useState('100% Algodón Peinado');
  const [newProdSizes, setNewProdSizes] = useState<{ size: string; stock: number }[]>([
    { size: 'S', stock: 10 },
    { size: 'M', stock: 15 },
    { size: 'L', stock: 12 },
    { size: 'XL', stock: 5 },
  ]);

  if (!isInventoryOpen) return null;

  // Real-time Summary Calculations
  const totalStockUnits = products.reduce(
    (acc, p) => acc + p.sizes.reduce((sAcc, s) => sAcc + s.stock, 0),
    0
  );

  const totalValuation = products.reduce(
    (acc, p) => acc + p.sizes.reduce((sAcc, s) => sAcc + (s.stock * p.price), 0),
    0
  );

  const lowStockProducts = products.filter(p => {
    const total = p.sizes.reduce((acc, s) => acc + s.stock, 0);
    return total > 0 && total <= 5;
  });

  const outOfStockProducts = products.filter(p => {
    const total = p.sizes.reduce((acc, s) => acc + s.stock, 0);
    return total === 0;
  });

  // Filter products for table
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    
    const total = p.sizes.reduce((acc, s) => acc + s.stock, 0);
    let matchesStatus = true;
    if (filterStatus === 'low') matchesStatus = total > 0 && total <= 5;
    if (filterStatus === 'out') matchesStatus = total === 0;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleCategoryChangeForNew = (cat: ProductCategory) => {
    setNewProdCat(cat);
    if (cat === 'ropa') {
      setNewProdSubcat('camisetas');
      setNewProdSizes([
        { size: 'S', stock: 10 },
        { size: 'M', stock: 15 },
        { size: 'L', stock: 12 },
        { size: 'XL', stock: 5 },
      ]);
    } else {
      setNewProdSubcat('zapatillas');
      setNewProdSizes([
        { size: '39', stock: 5 },
        { size: '40', stock: 8 },
        { size: '41', stock: 10 },
        { size: '42', stock: 12 },
        { size: '43', stock: 6 },
      ]);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    addNewProduct({
      name: newProdName.trim(),
      category: newProdCat,
      subcategory: newProdSubcat,
      price: Number(newProdPrice),
      originalPrice: newProdOriginalPrice > 0 ? Number(newProdOriginalPrice) : undefined,
      description: newProdDesc || 'Prenda de ropa confeccionada con materiales prémium de alta resistencia y diseño moderno.',
      images: [newProdImage.trim() || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      colors: newProdColors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: newProdSizes,
      material: newProdMaterial,
      featured: false,
      isNew: true,
      rating: 5.0,
      reviewCount: 1,
    });

    // Reset form
    setNewProdName('');
    setActiveTab('inventory');
  };

  return (
    <div 
      id="inventory-manager-backdrop"
      className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={() => setIsInventoryOpen(false)}
    >
      <div 
        id="inventory-manager-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 flex flex-col my-4"
      >
        {/* Top Header */}
        <div className="p-5 bg-white text-[#1A1A1A] flex flex-wrap items-center justify-between gap-4 border-b border-[#EEEEEE] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-medium">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-[#1A1A1A]">Panel de Inventario</h2>
                <span className="flex items-center gap-1 text-[11px] font-medium bg-[#F5F5F5] text-[#1A1A1A] border border-[#EEEEEE] px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Sincronizado en tiempo real
                </span>
              </div>
              <p className="text-xs text-[#777777]">
                Gestión de existencias por tallas, reposiciones, alertas de stock y catálogo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reset-catalog-btn"
              onClick={resetToDefaultCatalog}
              className="px-3 py-1.5 text-xs text-[#555555] hover:text-[#1A1A1A] bg-[#F5F5F5] hover:bg-[#EEEEEE] rounded-lg border border-[#EEEEEE] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Restablecer a valores iniciales"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restablecer Catálogo</span>
            </button>

            <button
              id="close-inventory-btn"
              onClick={() => setIsInventoryOpen(false)}
              className="p-2 rounded-lg text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 p-4 bg-[#FAFAFA] border-b border-[#EEEEEE] shrink-0">
          
          <div className="p-3.5 bg-white rounded-xl border border-[#EEEEEE] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#777777] font-normal block">Unidades en Stock</span>
              <span className="text-base sm:text-lg font-semibold text-[#1A1A1A]">{totalStockUnits} uds.</span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#EEEEEE] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-[#777777] font-normal block">Valor Total</span>
              <span className="text-base sm:text-lg font-semibold text-[#1A1A1A]">{totalValuation.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#EEEEEE] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <span className="text-[11px] text-[#777777] font-normal block">Bajo Stock (&lt;5)</span>
              <span className="text-base sm:text-lg font-semibold text-[#1A1A1A]">{lowStockProducts.length} productos</span>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-[#EEEEEE] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] flex items-center justify-center">
              <Boxes className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="text-[11px] text-[#777777] font-normal block">Agotados</span>
              <span className="text-base sm:text-lg font-semibold text-[#1A1A1A]">{outOfStockProducts.length} productos</span>
            </div>
          </div>

        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between px-6 pt-2 border-b border-[#EEEEEE] bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button
              id="inv-tab-list"
              onClick={() => setActiveTab('inventory')}
              className={`py-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'border-black text-[#1A1A1A] font-semibold'
                  : 'border-transparent text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Control de Existencias ({products.length})</span>
            </button>

            <button
              id="inv-tab-add"
              onClick={() => setActiveTab('new-product')}
              className={`py-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'new-product'
                  ? 'border-black text-[#1A1A1A] font-semibold'
                  : 'border-transparent text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              <span>Añadir Producto</span>
            </button>

            <button
              id="inv-tab-logs"
              onClick={() => setActiveTab('logs')}
              className={`py-3 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'logs'
                  ? 'border-black text-[#1A1A1A] font-semibold'
                  : 'border-transparent text-[#777777] hover:text-[#1A1A1A]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Movimientos en Vivo ({inventoryLogs.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INVENTORY TABLE & REAL-TIME ADJUSTERS */}
        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 space-y-4">
            
            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="inv-search-input"
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F5F5F5] text-xs text-[#1A1A1A] pl-9 pr-3 py-2 rounded-lg border border-[#EEEEEE] focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  id="inv-filter-cat-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="bg-[#F5F5F5] text-xs font-medium text-[#1A1A1A] px-3 py-2 rounded-lg border border-[#EEEEEE] focus:outline-none cursor-pointer"
                >
                  <option value="all">Todas las Categorías</option>
                  <option value="ropa">Solo Ropa</option>
                  <option value="calzado">Solo Calzado</option>
                </select>

                <select
                  id="inv-filter-status-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-[#F5F5F5] text-xs font-medium text-[#1A1A1A] px-3 py-2 rounded-lg border border-[#EEEEEE] focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="low">Bajo Stock (&lt;5)</option>
                  <option value="out">Agotados (0)</option>
                </select>
              </div>

            </div>

            {/* Scrollable Table */}
            <div className="flex-1 overflow-y-auto border border-[#EEEEEE] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAFA] text-[#777777] font-medium sticky top-0 z-10 border-b border-[#EEEEEE]">
                  <tr>
                    <th className="p-3.5">Producto & SKU</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Precio</th>
                    <th className="p-3.5">Stock Total</th>
                    <th className="p-3.5">Gestión por Tallas</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#777777]">
                        No se encontraron productos con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const totalUnits = product.sizes.reduce((acc, s) => acc + s.stock, 0);

                      return (
                        <tr key={product.id} className="hover:bg-[#FAFAFA] transition-colors group">
                          
                          {/* Product Details */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-lg bg-[#F5F5F5] border border-[#EEEEEE] shrink-0"
                              />
                              <div>
                                <span className="font-medium text-[#1A1A1A] block line-clamp-1">
                                  {product.name}
                                </span>
                                <span className="font-mono text-[10px] text-[#999999]">
                                  {product.sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-3.5">
                            <span className="capitalize font-medium text-[#1A1A1A] bg-[#F5F5F5] px-2 py-0.5 rounded text-[11px]">
                              {product.category}
                            </span>
                            <span className="block text-[10px] text-[#777777] capitalize mt-0.5">
                              {product.subcategory}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="p-3.5 font-semibold text-[#1A1A1A]">
                            {product.price.toFixed(2)}€
                          </td>

                          {/* Total Stock Badge */}
                          <td className="p-3.5">
                            {totalUnits === 0 ? (
                              <span className="inline-flex items-center gap-1 font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-100">
                                0 uds (Agotado)
                              </span>
                            ) : totalUnits <= 5 ? (
                              <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-100">
                                {totalUnits} uds (Bajo)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-medium text-[#1A1A1A] bg-[#F5F5F5] px-2 py-0.5 rounded text-[11px] border border-[#EEEEEE]">
                                {totalUnits} uds
                              </span>
                            )}
                          </td>

                          {/* Live Size Adjusters */}
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {product.sizes.map((s) => (
                                <div
                                  key={s.size}
                                  className="flex items-center gap-1 px-1.5 py-1 rounded-lg border border-[#EEEEEE] bg-[#F5F5F5]"
                                >
                                  <span className="font-medium text-[11px] min-w-4 text-[#1A1A1A]">{s.size}:</span>
                                  
                                  {/* Quick -1 */}
                                  <button
                                    id={`stock-dec-${product.id}-${s.size}`}
                                    onClick={() => quickAdjustStock(product.id, s.size, -1)}
                                    className="w-4.5 h-4.5 rounded bg-white border border-[#EEEEEE] hover:bg-[#EEEEEE] text-[#1A1A1A] flex items-center justify-center text-[10px] font-medium cursor-pointer"
                                    title="Reducir 1 unidad"
                                  >
                                    -
                                  </button>

                                  {/* Input Field for Exact Stock */}
                                  <input
                                    type="number"
                                    min="0"
                                    value={s.stock}
                                    onChange={(e) => updateStock(product.id, s.size, parseInt(e.target.value) || 0)}
                                    className="w-9 text-center font-mono font-medium text-xs bg-white rounded border border-[#EEEEEE] focus:outline-none focus:border-black py-0.2"
                                  />

                                  {/* Quick +1 */}
                                  <button
                                    id={`stock-inc-${product.id}-${s.size}`}
                                    onClick={() => quickAdjustStock(product.id, s.size, 1)}
                                    className="w-4.5 h-4.5 rounded bg-white border border-[#EEEEEE] hover:bg-[#EEEEEE] text-[#1A1A1A] flex items-center justify-center text-[10px] font-medium cursor-pointer"
                                    title="Añadir 1 unidad"
                                  >
                                    +
                                  </button>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                id={`edit-prod-btn-${product.id}`}
                                onClick={() => setEditingProduct(product)}
                                className="p-1.5 rounded-lg text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                                title="Editar detalles"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`delete-prod-btn-${product.id}`}
                                onClick={() => deleteProduct(product.id)}
                                className="p-1.5 rounded-lg text-[#999999] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: CREATE NEW PRODUCT FORM */}
        {activeTab === 'new-product' && (
          <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
            
            <div className="border-b border-[#EEEEEE] pb-3">
              <h3 className="text-base font-semibold text-[#1A1A1A]">Registrar Nueva Prenda o Calzado</h3>
              <p className="text-xs text-[#777777]">
                Añade nuevos artículos al catálogo con stock inicial segmentado por tallas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sobrecamisa de Pana Oversize"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Categoría Principal *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChangeForNew('ropa')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      newProdCat === 'ropa' ? 'bg-black text-white border-black' : 'bg-[#F5F5F5] text-[#777777] border-[#EEEEEE]'
                    }`}
                  >
                    Ropa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryChangeForNew('calzado')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      newProdCat === 'calzado' ? 'bg-black text-white border-black' : 'bg-[#F5F5F5] text-[#777777] border-[#EEEEEE]'
                    }`}
                  >
                    Calzado
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Precio de Venta (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Precio Original / Descuento (€)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0 (opcional si está en rebaja)"
                  value={newProdOriginalPrice}
                  onChange={(e) => setNewProdOriginalPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">URL de Imagen del Producto *</label>
                <input
                  type="url"
                  required
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Descripción Detallada</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Descripción de la confección, caída, estilo y ocasión..."
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Colores (separados por coma)</label>
                <input
                  type="text"
                  value={newProdColors}
                  onChange={(e) => setNewProdColors(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#1A1A1A]">Material y Tejido</label>
                <input
                  type="text"
                  value={newProdMaterial}
                  onChange={(e) => setNewProdMaterial(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#EEEEEE] bg-[#F5F5F5] focus:border-black focus:bg-white focus:outline-none"
                />
              </div>

            </div>

            {/* Sizes Initial Stock Configuration */}
            <div className="space-y-2 pt-2 border-t border-[#EEEEEE]">
              <label className="text-xs font-medium text-[#1A1A1A] block">
                Definir Stock Inicial por Tallas:
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {newProdSizes.map((s, idx) => (
                  <div key={s.size} className="p-2.5 bg-[#F5F5F5] rounded-lg border border-[#EEEEEE] flex items-center justify-between">
                    <span className="font-medium text-xs text-[#1A1A1A]">Talla {s.size}</span>
                    <input
                      type="number"
                      min="0"
                      value={s.stock}
                      onChange={(e) => {
                        const updated = [...newProdSizes];
                        updated[idx].stock = parseInt(e.target.value) || 0;
                        setNewProdSizes(updated);
                      }}
                      className="w-12 text-center font-medium text-xs bg-white py-1 rounded border border-[#EEEEEE] focus:border-black focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EEEEEE] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#777777] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar e Inventariar</span>
              </button>
            </div>

          </form>
        )}

        {/* TAB 3: REAL-TIME INVENTORY ACTIVITY LOG */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-3">
              <div>
                <h3 className="text-base font-semibold text-[#1A1A1A]">Registro de Actividad</h3>
                <p className="text-xs text-[#777777]">
                  Histórico sincronizado de compras en la pasarela, reposiciones y ajustes manuales.
                </p>
              </div>
              <span className="text-xs font-normal text-[#777777] bg-[#F5F5F5] border border-[#EEEEEE] px-2.5 py-0.5 rounded-full">
                {inventoryLogs.length} eventos registrados
              </span>
            </div>

            <div className="space-y-2">
              {inventoryLogs.length === 0 ? (
                <div className="p-8 text-center text-[#777777] text-xs">
                  No hay movimientos registrados todavía.
                </div>
              ) : (
                inventoryLogs.map((log) => {
                  const isSale = log.type === 'venta';
                  const isRestock = log.type === 'reposicion';

                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-white rounded-xl border border-[#EEEEEE] flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSale
                            ? 'bg-rose-50 text-rose-600'
                            : isRestock
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-[#F5F5F5] text-[#1A1A1A]'
                        }`}>
                          {isSale ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs text-[#1A1A1A]">{log.productName}</span>
                            <span className="text-[10px] font-medium text-[#777777] bg-[#F5F5F5] px-1.5 py-0.5 rounded border border-[#EEEEEE]">
                              Talla {log.size}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#777777] mt-0.5">{log.reason}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`font-semibold text-xs block ${
                          isSale ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} uds.
                        </span>
                        <span className="text-[10px] text-[#999999] font-mono">{log.timestamp}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>

      {/* Quick Edit Modal */}
      {editingProduct && (
        <div 
          className="fixed inset-0 z-60 bg-zinc-950/60 flex items-center justify-center p-4"
          onClick={() => setEditingProduct(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-zinc-900">Editar {editingProduct.name}</h4>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-zinc-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Nombre</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Precio (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">Descripción</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  editProduct(editingProduct.id, editingProduct);
                  setEditingProduct(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
