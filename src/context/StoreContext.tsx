import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  InventoryLog, 
  Coupon, 
  ShippingDetails, 
  PaymentDetails 
} from '../types';
import { INITIAL_PRODUCTS, AVAILABLE_COUPONS } from '../data/mockProducts';

interface ToastInfo {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  inventoryLogs: InventoryLog[];
  appliedCoupon: Coupon | null;
  toast: ToastInfo | null;
  
  // UI states
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isInventoryOpen: boolean;
  setIsInventoryOpen: (open: boolean) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Cart operations
  addToCart: (product: Product, size: string, color: string, quantity: number) => { success: boolean; message: string };
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => boolean;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; discount: number; shipping: number; tax: number; total: number };
  
  // Coupon
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Inventory actions
  updateStock: (productId: string, size: string, newStock: number, reason?: string) => void;
  quickAdjustStock: (productId: string, size: string, delta: number) => void;
  addNewProduct: (productData: Omit<Product, 'id' | 'sku'>) => void;
  editProduct: (productId: string, updated: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  resetToDefaultCatalog: () => void;
  getProductStock: (productId: string, size?: string) => number;

  // Checkout
  processCheckout: (shipping: ShippingDetails, payment: PaymentDetails) => Promise<{ success: boolean; order?: Order; error?: string }>;
  
  // Toasts
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'moda_store_products_v2',
  CART: 'moda_store_cart_v2',
  WISHLIST: 'moda_store_wishlist_v2',
  ORDERS: 'moda_store_orders_v2',
  LOGS: 'moda_store_inventory_logs_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial Product state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_PRODUCTS;
  });

  // 2. Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // 3. Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // 4. Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // 5. Inventory Logs
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'log-init-1',
        timestamp: new Date(Date.now() - 3600000 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productId: 'prod-7',
        productName: 'Zapatillas Retro Runner Pro Leather',
        size: '42',
        type: 'reposicion',
        quantityChange: 10,
        newStock: 10,
        reason: 'Ingreso lote de producción',
      },
      {
        id: 'log-init-2',
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productId: 'prod-1',
        productName: 'Camiseta Oversize Heavyweight Cotton',
        size: 'M',
        type: 'reposicion',
        quantityChange: 14,
        newStock: 14,
        reason: 'Reabastecimiento general',
      }
    ];
  });

  // 6. UI Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 7. Applied Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // 8. Toast notification
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4000);
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products", e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders", e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(inventoryLogs));
    } catch (e) {
      console.error("Failed to save inventory logs", e);
    }
  }, [inventoryLogs]);

  // Helper to query current stock
  const getProductStock = useCallback((productId: string, size?: string): number => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return 0;
    if (!size) {
      return prod.sizes.reduce((acc, curr) => acc + curr.stock, 0);
    }
    const sizeItem = prod.sizes.find(s => s.size === size);
    return sizeItem ? sizeItem.stock : 0;
  }, [products]);

  // Wishlist toggle
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Producto eliminado de favoritos', 'info');
        return prev.filter(id => id !== productId);
      } else {
        showToast('¡Añadido a tus favoritos!', 'success');
        return [...prev, productId];
      }
    });
  }, [showToast]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  // Add to cart with real-time stock check
  const addToCart = useCallback((product: Product, size: string, color: string, quantity: number) => {
    const currentStock = getProductStock(product.id, size);
    
    if (currentStock <= 0) {
      showToast(`La talla ${size} está agotada en este momento`, 'error');
      return { success: false, message: 'Producto agotado en esta talla' };
    }

    let existingCartQuantity = 0;
    const existingItem = cart.find(
      item => item.productId === product.id && item.selectedSize === size && item.selectedColor === color
    );
    if (existingItem) {
      existingCartQuantity = existingItem.quantity;
    }

    if (existingCartQuantity + quantity > currentStock) {
      showToast(`Solo quedan ${currentStock} unidades disponibles en talla ${size}`, 'warning');
      return { 
        success: false, 
        message: `No hay suficiente stock. Disponibles: ${currentStock}` 
      };
    }

    setCart(prev => {
      const idx = prev.findIndex(
        item => item.productId === product.id && item.selectedSize === size && item.selectedColor === color
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity
        };
        return updated;
      }
      return [...prev, {
        productId: product.id,
        product,
        selectedSize: size,
        selectedColor: color,
        quantity,
      }];
    });

    showToast(`Añadido al carrito (${size} - ${color})`, 'success');
    return { success: true, message: 'Producto añadido con éxito' };
  }, [cart, getProductStock, showToast]);

  // Remove from cart
  const removeFromCart = useCallback((productId: string, size: string, color: string) => {
    setCart(prev => prev.filter(
      item => !(item.productId === productId && item.selectedSize === size && item.selectedColor === color)
    ));
    showToast('Producto eliminado del carrito', 'info');
  }, [showToast]);

  // Update quantity
  const updateCartQuantity = useCallback((productId: string, size: string, color: string, quantity: number): boolean => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return true;
    }

    const currentStock = getProductStock(productId, size);
    if (quantity > currentStock) {
      showToast(`Stock máximo alcanzado (${currentStock} disponibles)`, 'warning');
      return false;
    }

    setCart(prev => prev.map(item => {
      if (item.productId === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity };
      }
      return item;
    }));
    return true;
  }, [getProductStock, removeFromCart, showToast]);

  // Clear Cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Cart Calculations
  const getCartTotal = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    let discount = 0;
    if (appliedCoupon) {
      if (!appliedCoupon.minSpend || subtotal >= appliedCoupon.minSpend) {
        discount = (subtotal * appliedCoupon.discountPercentage) / 100;
      }
    }
    const shipping = subtotal > 60 || subtotal === 0 ? 0 : 4.95;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.21; // 21% IVA incluido
    const total = taxableAmount + shipping;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }, [cart, appliedCoupon]);

  // Apply Coupon
  const applyCoupon = useCallback((code: string) => {
    const found = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      showToast('El código de cupón no es válido', 'error');
      return { success: false, message: 'Cupón no válido' };
    }

    const { subtotal } = getCartTotal();
    if (found.minSpend && subtotal < found.minSpend) {
      showToast(`Este cupón requiere una compra mínima de ${found.minSpend}€`, 'warning');
      return { success: false, message: `Compra mínima de ${found.minSpend}€ requerida` };
    }

    setAppliedCoupon(found);
    showToast(`¡Cupón "${found.code}" aplicado con éxito! (-${found.discountPercentage}%)`, 'success');
    return { success: true, message: 'Cupón aplicado' };
  }, [getCartTotal, showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Cupón eliminado', 'info');
  }, [showToast]);

  // Real-time Inventory adjustment
  const updateStock = useCallback((productId: string, size: string, newStock: number, reason?: string) => {
    const safeStock = Math.max(0, Math.floor(newStock));
    
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        if (prod.id !== productId) return prod;
        
        const oldSize = prod.sizes.find(s => s.size === size);
        const oldStock = oldSize ? oldSize.stock : 0;
        const diff = safeStock - oldStock;

        // Log the change
        const newLog: InventoryLog = {
          id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          productId: prod.id,
          productName: prod.name,
          size,
          type: diff > 0 ? 'reposicion' : 'ajuste',
          quantityChange: diff,
          newStock: safeStock,
          reason: reason || (diff > 0 ? 'Ajuste manual de reposición' : 'Ajuste de inventario'),
        };
        setInventoryLogs(logs => [newLog, ...logs]);

        const updatedSizes = prod.sizes.map(s => {
          if (s.size === size) return { ...s, stock: safeStock };
          return s;
        });

        // If size didn't exist, add it
        if (!prod.sizes.some(s => s.size === size)) {
          updatedSizes.push({ size, stock: safeStock });
        }

        return { ...prod, sizes: updatedSizes };
      });
    });

    showToast(`Stock actualizado en tiempo real: ${size} -> ${safeStock} uds.`, 'success');
  }, [showToast]);

  const quickAdjustStock = useCallback((productId: string, size: string, delta: number) => {
    const current = getProductStock(productId, size);
    const target = Math.max(0, current + delta);
    updateStock(productId, size, target, delta > 0 ? 'Incremento rápido de stock' : 'Reducción rápida de stock');
  }, [getProductStock, updateStock]);

  const addNewProduct = useCallback((productData: Omit<Product, 'id' | 'sku'>) => {
    const newId = 'prod-' + Date.now();
    const skuPrefix = productData.category === 'ropa' ? 'ROP' : 'CAL';
    const sku = `${skuPrefix}-${productData.subcategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newProd: Product = {
      ...productData,
      id: newId,
      sku,
      rating: 5.0,
      reviewCount: 1,
    };

    setProducts(prev => [newProd, ...prev]);

    // Log the initial stock
    const totalAdded = productData.sizes.reduce((sum, s) => sum + s.stock, 0);
    const newLog: InventoryLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      productId: newId,
      productName: productData.name,
      size: 'Todas',
      type: 'nuevo',
      quantityChange: totalAdded,
      newStock: totalAdded,
      reason: 'Creación de nuevo producto en catálogo',
    };
    setInventoryLogs(logs => [newLog, ...logs]);

    showToast(`¡Nuevo producto "${newProd.name}" creado e inventariado!`, 'success');
  }, [showToast]);

  const editProduct = useCallback((productId: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updated } : p));
    showToast('Producto actualizado correctamente', 'success');
  }, [showToast]);

  const deleteProduct = useCallback((productId: string) => {
    const prod = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(item => item.productId !== productId));
    showToast(`Producto "${prod?.name || ''}" eliminado`, 'info');
  }, [products, showToast]);

  const resetToDefaultCatalog = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setWishlist([]);
    showToast('Inventario y catálogo restablecidos a los valores por defecto', 'info');
  }, [showToast]);

  // Real-time Checkout Process
  const processCheckout = useCallback(async (
    shipping: ShippingDetails, 
    payment: PaymentDetails
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'El carrito está vacío' };
    }

    // Step 1: Real-time stock re-verification
    for (const item of cart) {
      const currentStock = getProductStock(item.productId, item.selectedSize);
      if (currentStock < item.quantity) {
        return {
          success: false,
          error: `Stock insuficiente para "${item.product.name}" (Talla ${item.selectedSize}). Disponibles: ${currentStock}`
        };
      }
    }

    // Step 2: Simulate Payment Gateway transaction network roundtrip
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Step 3: Atomic stock deduction in real time
    const newLogs: InventoryLog[] = [];
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const cartItemsForProd = cart.filter(ci => ci.productId === prod.id);
        if (cartItemsForProd.length === 0) return prod;

        let updatedSizes = [...prod.sizes];
        for (const cItem of cartItemsForProd) {
          updatedSizes = updatedSizes.map(s => {
            if (s.size === cItem.selectedSize) {
              const newQty = Math.max(0, s.stock - cItem.quantity);
              newLogs.push({
                id: 'log-sale-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                timestamp: timestampStr,
                productId: prod.id,
                productName: prod.name,
                size: cItem.selectedSize,
                type: 'venta',
                quantityChange: -cItem.quantity,
                newStock: newQty,
                reason: `Venta online de ${cItem.quantity} uds.`,
              });
              return { ...s, stock: newQty };
            }
            return s;
          });
        }
        return { ...prod, sizes: updatedSizes };
      });
    });

    if (newLogs.length > 0) {
      setInventoryLogs(prev => [...newLogs, ...prev]);
    }

    // Step 4: Create Order Record
    const totals = getCartTotal();
    const newOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0],
        size: item.selectedSize,
        color: item.selectedColor,
        price: item.product.price,
        quantity: item.quantity,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      shippingDetails: shipping,
      paymentMethod: payment.method,
      status: 'completado',
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);

    return { success: true, order: newOrder };
  }, [cart, getProductStock, getCartTotal, clearCart]);

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        inventoryLogs,
        appliedCoupon,
        toast,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isInventoryOpen,
        setIsInventoryOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        selectedProduct,
        setSelectedProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        isInWishlist,
        updateStock,
        quickAdjustStock,
        addNewProduct,
        editProduct,
        deleteProduct,
        resetToDefaultCatalog,
        getProductStock,
        processCheckout,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
