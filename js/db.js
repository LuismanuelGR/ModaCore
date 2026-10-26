/**
 * MODACORE - Sistema de Base de Datos Local y Sincronización ERP
 * Sincroniza datos entre la Tienda (Storefront) y el ERP Administrador
 */

const DB = {
  // Claves de almacenamiento
  KEYS: {
    PRODUCTS: 'modacore_products_db',
    ORDERS: 'modacore_orders_db',
    CUSTOMERS: 'modacore_customers_db',
    PAYMENT_METHODS: 'modacore_payments_db',
    SETTINGS: 'modacore_settings_db'
  },

  // Inicialización de la base de datos
  init() {
    // Inicializar Productos
    if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
      // Usar PRODUCTS de products.js como semilla inicial con stock
      const initialProducts = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).map(p => ({
        ...p,
        stock: p.stock !== undefined ? p.stock : Math.floor(Math.random() * 25) + 8,
        sku: p.sku || `MC-${p.category.substring(0, 1).toUpperCase()}${p.type.substring(0, 1).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      }));
      this.saveProducts(initialProducts);
    }

    // Inicializar Pedidos Demo
    if (!localStorage.getItem(this.KEYS.ORDERS)) {
      const initialOrders = [
        {
          id: "ORD-7821",
          customer: { name: "Elena Rostova", email: "elena.r@example.com", phone: "+34 612 345 678" },
          date: "2026-10-25 18:42",
          items: [
            { id: "m-01", name: "Trench Coat Estructurado Beige", size: "M", price: 139.95, qty: 1 }
          ],
          total: 139.95,
          paymentMethod: "Tarjeta de Crédito (Stripe)",
          status: "Entregado",
          shippingAddress: "Paseo de Gracia 45, 3ºB, Barcelona"
        },
        {
          id: "ORD-7822",
          customer: { name: "Marcos Villanueva", email: "m.villanueva@example.com", phone: "+34 688 234 112" },
          date: "2026-10-26 10:15",
          items: [
            { id: "h-01", name: "Sobrecamisa Heavy Cotton Raw Canvas", size: "L", price: 98.00, qty: 1 },
            { id: "h-02", name: "Sneakers Retro Minimalist Leather", size: "43", price: 110.00, qty: 1 }
          ],
          total: 208.00,
          paymentMethod: "Apple Pay",
          status: "Enviado",
          shippingAddress: "Calle Velázquez 12, Madrid"
        },
        {
          id: "ORD-7823",
          customer: { name: "Sofía Arismendi", email: "sofia.kids@example.com", phone: "+34 654 987 321" },
          date: "2026-10-26 14:30",
          items: [
            { id: "k-01", name: "Sudadera Cozy Organic Mustard", size: "5-6 Años", price: 38.00, qty: 2 },
            { id: "k-02", name: "Sneakers Mini Colorblock Flex", size: "28", price: 49.95, qty: 1 }
          ],
          total: 125.95,
          paymentMethod: "Bizum",
          status: "En Preparación",
          shippingAddress: "Avenida de la Libertad 8, San Sebastián"
        },
        {
          id: "ORD-7824",
          customer: { name: "David Alarcón", email: "david.a@example.com", phone: "+34 600 123 456" },
          date: "2026-10-26 15:10",
          items: [
            { id: "h-04", name: "Zapatos Derby Artesanales Cuero Miel", size: "42", price: 155.00, qty: 1 }
          ],
          total: 155.00,
          paymentMethod: "PayPal",
          status: "Pendiente",
          shippingAddress: "Calle Sierpes 24, Sevilla"
        }
      ];
      this.saveOrders(initialOrders);
    }

    // Inicializar Clientes Demo
    if (!localStorage.getItem(this.KEYS.CUSTOMERS)) {
      const initialCustomers = [
        {
          id: "CUST-001",
          name: "Elena Rostova",
          email: "elena.r@example.com",
          phone: "+34 612 345 678",
          city: "Barcelona",
          totalOrders: 6,
          totalSpent: 840.50,
          status: "VIP",
          registeredDate: "2025-11-12"
        },
        {
          id: "CUST-002",
          name: "Marcos Villanueva",
          email: "m.villanueva@example.com",
          phone: "+34 688 234 112",
          city: "Madrid",
          totalOrders: 3,
          totalSpent: 412.00,
          status: "Activo",
          registeredDate: "2026-02-04"
        },
        {
          id: "CUST-003",
          name: "Sofía Arismendi",
          email: "sofia.kids@example.com",
          phone: "+34 654 987 321",
          city: "San Sebastián",
          totalOrders: 4,
          totalSpent: 389.90,
          status: "Activo",
          registeredDate: "2026-04-18"
        },
        {
          id: "CUST-004",
          name: "David Alarcón",
          email: "david.a@example.com",
          phone: "+34 600 123 456",
          city: "Sevilla",
          totalOrders: 1,
          totalSpent: 155.00,
          status: "Nuevo",
          registeredDate: "2026-10-26"
        },
        {
          id: "CUST-005",
          name: "Lucía Morales",
          email: "lucia.m@example.com",
          phone: "+34 677 889 900",
          city: "Valencia",
          totalOrders: 8,
          totalSpent: 1220.00,
          status: "VIP",
          registeredDate: "2025-08-30"
        }
      ];
      this.saveCustomers(initialCustomers);
    }

    // Inicializar Métodos de Pago
    if (!localStorage.getItem(this.KEYS.PAYMENT_METHODS)) {
      const initialPayments = [
        {
          id: "stripe",
          name: "Tarjeta de Crédito / Débito (Stripe)",
          type: "card",
          badge: "Recomendado",
          active: true,
          fee: "0%",
          environment: "Live",
          description: "Pagos seguros con Visa, Mastercard, AMEX y 3D Secure 2.0"
        },
        {
          id: "paypal",
          name: "PayPal Express",
          type: "wallet",
          badge: "Popular",
          active: true,
          fee: "1.5%",
          environment: "Live",
          description: "Cobro instantáneo mediante cuenta PayPal o tarjetas asociadas"
        },
        {
          id: "bizum",
          name: "Bizum Comercio",
          type: "instant",
          badge: "España",
          active: true,
          fee: "0%",
          environment: "Live",
          description: "Pago móvil inmediato sin comisión para el comprador"
        },
        {
          id: "apple_pay",
          name: "Apple Pay / Google Pay",
          type: "mobile",
          badge: "1-Click",
          active: true,
          fee: "0%",
          environment: "Live",
          description: "Checkout biométrico seguro en un toque"
        },
        {
          id: "klarna",
          name: "Klarna — Paga en 3 plazos",
          type: "installments",
          badge: "Financiación",
          active: true,
          fee: "0%",
          environment: "Live",
          description: "Divide el pago en 3 mensualidades sin intereses"
        },
        {
          id: "transfer",
          name: "Transferencia Bancaria Directa",
          type: "bank",
          badge: "Manual",
          active: false,
          fee: "0%",
          environment: "Manual",
          description: "Envío del pedido una vez verificado el comprobante bancario"
        }
      ];
      this.savePaymentMethods(initialPayments);
    }

    // Inicializar Ajustes Generales
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      const initialSettings = {
        storeName: "MODACORE Atelier",
        currency: "EUR (€)",
        vatTaxRate: 21,
        freeShippingThreshold: 90.00,
        contactEmail: "admin@modacore.com",
        ordersAlertEmail: true,
        lowStockThreshold: 5,
        maintenanceMode: false
      };
      this.saveSettings(initialSettings);
    }
  },

  // --- MÉTODOS DE PRODUCTOS ---
  getProducts() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS)) || [];
    } catch (e) {
      return typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
    }
  },

  saveProducts(products) {
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('modacore_products_updated', { detail: products }));
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  addProduct(productData) {
    const products = this.getProducts();
    const newId = productData.id || `mc-${Date.now().toString().slice(-6)}`;
    const newProduct = {
      ...productData,
      id: newId,
      sku: productData.sku || `MC-${productData.category.substring(0, 1).toUpperCase()}${productData.type.substring(0, 1).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      rating: productData.rating || 5.0,
      reviews: productData.reviews || 0,
      sizes: Array.isArray(productData.sizes) ? productData.sizes : (productData.sizes || "S, M, L").split(',').map(s => s.trim()),
      colors: Array.isArray(productData.colors) ? productData.colors : (productData.colors || "#121212, #FAFAFA").split(',').map(c => c.trim()),
      stock: parseInt(productData.stock, 10) || 15
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  },

  updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updatedFields,
      price: parseFloat(updatedFields.price),
      originalPrice: updatedFields.originalPrice ? parseFloat(updatedFields.originalPrice) : null,
      stock: parseInt(updatedFields.stock, 10)
    };

    if (typeof updatedFields.sizes === 'string') {
      products[index].sizes = updatedFields.sizes.split(',').map(s => s.trim());
    }
    if (typeof updatedFields.colors === 'string') {
      products[index].colors = updatedFields.colors.split(',').map(c => c.trim());
    }

    this.saveProducts(products);
    return products[index];
  },

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
  },

  // --- MÉTODOS DE PEDIDOS ---
  getOrders() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.ORDERS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveOrders(orders) {
    localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('modacore_orders_updated', { detail: orders }));
  },

  createOrder(orderData) {
    const orders = this.getOrders();
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder = {
      id: orderId,
      customer: orderData.customer || { name: "Cliente Invitado", email: "cliente@modacore.com", phone: "+34 600 000 000" },
      date: formattedDate,
      items: orderData.items || [],
      total: orderData.total,
      paymentMethod: orderData.paymentMethod || "Tarjeta de Crédito (Stripe)",
      status: "Pendiente",
      shippingAddress: orderData.shippingAddress || "Dirección de envío proporcionada"
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);

    // Descontar inventario
    const products = this.getProducts();
    newOrder.items.forEach(item => {
      const prod = products.find(p => p.id === item.id);
      if (prod && prod.stock > 0) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    this.saveProducts(products);

    return newOrder;
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveOrders(orders);
    }
    return order;
  },

  // --- MÉTODOS DE CLIENTES ---
  getCustomers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CUSTOMERS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveCustomers(customers) {
    localStorage.setItem(this.KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  addCustomer(customerData) {
    const customers = this.getCustomers();
    const newCust = {
      id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      ...customerData,
      totalOrders: 0,
      totalSpent: 0,
      status: "Nuevo",
      registeredDate: new Date().toISOString().split('T')[0]
    };
    customers.unshift(newCust);
    this.saveCustomers(customers);
    return newCust;
  },

  // --- MÉTODOS DE PAGO ---
  getPaymentMethods() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.PAYMENT_METHODS)) || [];
    } catch (e) {
      return [];
    }
  },

  savePaymentMethods(methods) {
    localStorage.setItem(this.KEYS.PAYMENT_METHODS, JSON.stringify(methods));
  },

  togglePaymentMethod(id) {
    const methods = this.getPaymentMethods();
    const method = methods.find(m => m.id === id);
    if (method) {
      method.active = !method.active;
      this.savePaymentMethods(methods);
    }
    return method;
  },

  // --- AJUSTES ---
  getSettings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || {};
    } catch (e) {
      return {};
    }
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  }
};

// Auto-inicializar DB
DB.init();
