/**
 * MODACORE ERP ADMINISTRADOR - Lógica de Control y Gestión
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Estado Local del ERP ---
  let erpState = {
    currentTab: 'dashboard',
    searchQuery: '',
    categoryFilter: 'all',
    stockFilter: 'all',
    editingProductId: null,
    deletingProductId: null
  };

  // Cupones Promocionales en memoria / localStorage
  let promoCodes = JSON.parse(localStorage.getItem('modacore_coupons')) || [
    { code: "BIENVENIDA10", discount: "10%", type: "percentage", active: true, usageCount: 42 },
    { code: "SUMMER20", discount: "20%", type: "percentage", active: true, usageCount: 88 },
    { code: "ENVIOGRATIS", discount: "Envío 0€", type: "shipping", active: true, usageCount: 115 },
    { code: "KIDSVIP", discount: "15%", type: "percentage", active: false, usageCount: 19 }
  ];

  function saveCoupons() {
    localStorage.setItem('modacore_coupons', JSON.stringify(promoCodes));
  }

  // --- Elementos del DOM ---
  const navItems = document.querySelectorAll('.erp-nav-item');
  const pageTitle = document.getElementById('pageTitle');
  const viewSections = document.querySelectorAll('.erp-view');
  const globalSearchInput = document.getElementById('erpGlobalSearch');
  const erpThemeToggleBtn = document.getElementById('erpThemeToggle');

  // Modales
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const productModalTitle = document.getElementById('productModalTitle');
  const closeProductModalBtn = document.getElementById('closeProductModalBtn');
  const cancelProductBtn = document.getElementById('cancelProductBtn');

  const confirmDeleteModal = document.getElementById('confirmDeleteModal');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  const orderDetailModal = document.getElementById('orderDetailModal');
  const closeOrderDetailBtn = document.getElementById('closeOrderDetailBtn');

  const newCouponModal = document.getElementById('newCouponModal');
  const couponForm = document.getElementById('couponForm');
  const closeCouponModalBtn = document.getElementById('closeCouponModalBtn');
  const cancelCouponBtn = document.getElementById('cancelCouponBtn');

  // --- Inicialización de Tema ERP ---
  if (localStorage.getItem('modacore_erp_light') === 'true') {
    document.body.classList.add('erp-light');
  }

  erpThemeToggleBtn?.addEventListener('click', () => {
    document.body.classList.toggle('erp-light');
    const isLight = document.body.classList.contains('erp-light');
    localStorage.setItem('modacore_erp_light', isLight);
    showErpToast(isLight ? 'Modo Claro activado' : 'Modo Oscuro activado', isLight ? '☀️' : '🌙');
  });

  // --- Navegación entre Vistas del ERP ---
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      if (!tab) return;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      erpState.currentTab = tab;
      switchView(tab);
    });
  });

  function switchView(tabName) {
    viewSections.forEach(sec => {
      sec.style.display = (sec.id === `view-${tabName}`) ? 'block' : 'none';
    });

    // Actualizar Título
    const titles = {
      dashboard: 'Panel General & Métricas',
      inventory: 'Gestión de Inventario & Productos',
      pricing: 'Precios, Rebajas & Cupones',
      payments: 'Pasarelas & Métodos de Pago',
      customers: 'Directorio de Clientes',
      orders: 'Control de Pedidos & Envíos',
      settings: 'Configuración General de la Tienda'
    };
    if (pageTitle) pageTitle.textContent = titles[tabName] || 'ERP Administrador';

    // Cargar contenido específico de la pestaña
    if (tabName === 'dashboard') renderDashboard();
    if (tabName === 'inventory') renderInventory();
    if (tabName === 'pricing') renderPricing();
    if (tabName === 'payments') renderPaymentMethods();
    if (tabName === 'customers') renderCustomers();
    if (tabName === 'orders') renderOrders();
    if (tabName === 'settings') loadSettingsForm();
  }

  // --- 1. VISTA DASHBOARD ---
  function renderDashboard() {
    const products = DB.getProducts();
    const orders = DB.getOrders();
    const customers = DB.getCustomers();

    // KPIs
    const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'Cancelado' ? o.total : 0), 0);
    const lowStockCount = products.filter(p => p.stock <= 5).length;

    const kpiSalesEl = document.getElementById('kpiTotalSales');
    const kpiOrdersEl = document.getElementById('kpiTotalOrders');
    const kpiCustomersEl = document.getElementById('kpiTotalCustomers');
    const kpiStockEl = document.getElementById('kpiLowStock');

    if (kpiSalesEl) kpiSalesEl.textContent = `${totalSales.toFixed(2)}€`;
    if (kpiOrdersEl) kpiOrdersEl.textContent = orders.length;
    if (kpiCustomersEl) kpiCustomersEl.textContent = customers.length;
    if (kpiStockEl) kpiStockEl.textContent = lowStockCount;

    // Badges contadores en sidebar
    const badgeOrders = document.getElementById('sidebarOrdersCount');
    const badgeStock = document.getElementById('sidebarStockCount');
    if (badgeOrders) badgeOrders.textContent = orders.length;
    if (badgeStock) badgeStock.textContent = products.length;

    // Pedidos Recientes en Dashboard
    const recentOrdersTable = document.getElementById('dashboardRecentOrders');
    if (recentOrdersTable) {
      const recent = orders.slice(0, 5);
      recentOrdersTable.innerHTML = recent.map(o => `
        <tr>
          <td><strong style="color: var(--accent-gold);">#${o.id}</strong></td>
          <td>${o.customer.name}</td>
          <td>${o.date}</td>
          <td><strong>${o.total.toFixed(2)}€</strong></td>
          <td>${getOrderStatusBadge(o.status)}</td>
          <td>
            <button class="table-btn" onclick="openOrderDetail('${o.id}')" title="Ver Detalle">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Alertas de Stock Bajo
    const lowStockContainer = document.getElementById('dashboardLowStock');
    if (lowStockContainer) {
      const lowStockItems = products.filter(p => p.stock <= 5).slice(0, 5);
      if (lowStockItems.length === 0) {
        lowStockContainer.innerHTML = `<div style="color: var(--accent-green); padding: 1rem; text-align: center; font-size: 0.9rem;">✓ Todos los productos tienen inventario óptimo (>5 unidades)</div>`;
      } else {
        lowStockContainer.innerHTML = lowStockItems.map(p => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--erp-border);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${p.image}" style="width: 36px; height: 44px; border-radius: 4px; object-fit: cover;" />
              <div>
                <div style="font-weight: 600; font-size: 0.85rem;">${p.name}</div>
                <div style="font-size: 0.72rem; color: var(--erp-text-dim);">${p.category} • ${p.sku}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="status-pill status-low-stock">${p.stock} unid.</span>
              <button class="btn-erp-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="quickAdjustStock('${p.id}', 10)">+10 Reponer</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // --- 2. VISTA INVENTARIO & PRODUCTOS ---
  function renderInventory() {
    const products = DB.getProducts();
    const inventoryTable = document.getElementById('inventoryTableBody');
    if (!inventoryTable) return;

    let filtered = products.filter(p => {
      let matchesCat = (erpState.categoryFilter === 'all') || (p.category === erpState.categoryFilter);
      let matchesSearch = (erpState.searchQuery.trim() === '') ||
        p.name.toLowerCase().includes(erpState.searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(erpState.searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(erpState.searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      inventoryTable.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--erp-text-muted);">No se encontraron productos con estos criterios.</td></tr>`;
      return;
    }

    inventoryTable.innerHTML = filtered.map(p => {
      let stockBadgeClass = p.stock > 5 ? 'status-in-stock' : (p.stock > 0 ? 'status-low-stock' : 'status-out-stock');
      let stockText = p.stock > 5 ? `${p.stock} en stock` : (p.stock > 0 ? `Stock bajo (${p.stock})` : 'Agotado (0)');

      return `
        <tr>
          <td>
            <div class="table-prod-cell">
              <img class="table-prod-img" src="${p.image}" alt="${p.name}" />
              <div>
                <div class="table-prod-name">${p.name}</div>
                <div class="table-prod-sku">${p.sku}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="text-transform: capitalize; font-weight: 600;">${p.category}</span>
            <span style="color: var(--erp-text-dim); font-size: 0.78rem;"> • ${p.type}</span>
          </td>
          <td>
            <strong>${p.price.toFixed(2)}€</strong>
            ${p.originalPrice ? `<span style="text-decoration: line-through; color: var(--erp-text-dim); font-size: 0.78rem; margin-left: 4px;">${p.originalPrice.toFixed(2)}€</span>` : ''}
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="status-pill ${stockBadgeClass}">${stockText}</span>
              <div style="display: inline-flex; border: 1px solid var(--erp-border); border-radius: var(--radius-sm); overflow: hidden;">
                <button style="padding: 2px 7px; background: var(--erp-sidebar); color: var(--erp-text);" onclick="quickAdjustStock('${p.id}', -1)">-</button>
                <button style="padding: 2px 7px; background: var(--erp-sidebar); color: var(--erp-text);" onclick="quickAdjustStock('${p.id}', 1)">+</button>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size: 0.78rem; color: var(--erp-text-muted);">${Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes}</span>
          </td>
          <td>
            <span class="status-pill" style="background: var(--erp-border); color: var(--erp-text);">${p.tag || 'Estándar'}</span>
          </td>
          <td>
            <div class="action-buttons-cell">
              <button class="table-btn" onclick="openEditProductModal('${p.id}')" title="Editar Producto">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button class="table-btn delete-btn" onclick="openDeleteModal('${p.id}')" title="Eliminar Producto">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Filtros de categoría en Inventario
  document.querySelectorAll('.inv-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.inv-filter-btn').forEach(b => b.classList.remove('btn-erp-primary'));
      document.querySelectorAll('.inv-filter-btn').forEach(b => b.classList.add('btn-erp-secondary'));
      btn.classList.remove('btn-erp-secondary');
      btn.classList.add('btn-erp-primary');
      erpState.categoryFilter = btn.dataset.cat;
      renderInventory();
    });
  });

  // Búsqueda en Inventario
  const invSearch = document.getElementById('inventorySearch');
  invSearch?.addEventListener('input', (e) => {
    erpState.searchQuery = e.target.value;
    renderInventory();
  });

  // Ajuste rápido de Stock
  window.quickAdjustStock = function(productId, delta) {
    const prod = DB.getProductById(productId);
    if (!prod) return;
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    DB.updateProduct(productId, { stock: newStock });
    renderInventory();
    if (erpState.currentTab === 'dashboard') renderDashboard();
    showErpToast(`Stock de "${prod.name}" ajustado a ${newStock} unid.`, '📦');
  };

  // --- MODAL DE PRODUCTO (CREAR / EDITAR) ---
  const openNewProductBtn = document.getElementById('openNewProductBtn');
  openNewProductBtn?.addEventListener('click', () => {
    erpState.editingProductId = null;
    if (productModalTitle) productModalTitle.textContent = 'Nuevo Producto para la Tienda';
    productForm.reset();
    document.getElementById('prodId').value = '';
    document.getElementById('prodStock').value = '15';
    openModal(productModal);
  });

  window.openEditProductModal = function(productId) {
    const p = DB.getProductById(productId);
    if (!p) return;
    erpState.editingProductId = productId;
    if (productModalTitle) productModalTitle.textContent = `Editar: ${p.name}`;

    document.getElementById('prodId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodType').value = p.type;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodOriginalPrice').value = p.originalPrice || '';
    document.getElementById('prodStock').value = p.stock || 0;
    document.getElementById('prodTag').value = p.tag || '';
    document.getElementById('prodImage').value = p.image || '';
    document.getElementById('prodSizes').value = Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes;
    document.getElementById('prodColors').value = Array.isArray(p.colors) ? p.colors.join(', ') : p.colors;
    document.getElementById('prodDesc').value = p.description || '';

    openModal(productModal);
  };

  productForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('prodName').value,
      category: document.getElementById('prodCategory').value,
      type: document.getElementById('prodType').value,
      price: parseFloat(document.getElementById('prodPrice').value),
      originalPrice: document.getElementById('prodOriginalPrice').value ? parseFloat(document.getElementById('prodOriginalPrice').value) : null,
      stock: parseInt(document.getElementById('prodStock').value, 10),
      tag: document.getElementById('prodTag').value,
      image: document.getElementById('prodImage').value || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      sizes: document.getElementById('prodSizes').value.split(',').map(s => s.trim()),
      colors: document.getElementById('prodColors').value.split(',').map(c => c.trim()),
      description: document.getElementById('prodDesc').value
    };

    if (erpState.editingProductId) {
      DB.updateProduct(erpState.editingProductId, formData);
      showErpToast(`Producto "${formData.name}" actualizado con éxito`, '✓');
    } else {
      DB.addProduct(formData);
      showErpToast(`Nuevo producto "${formData.name}" agregado a la tienda`, '🎉');
    }

    closeModal(productModal);
    renderInventory();
    if (erpState.currentTab === 'dashboard') renderDashboard();
  });

  closeProductModalBtn?.addEventListener('click', () => closeModal(productModal));
  cancelProductBtn?.addEventListener('click', () => closeModal(productModal));

  // --- MODAL ELIMINAR PRODUCTO (SIN CONFIRM NATIVO) ---
  window.openDeleteModal = function(productId) {
    const p = DB.getProductById(productId);
    if (!p) return;
    erpState.deletingProductId = productId;
    const msg = document.getElementById('deleteConfirmMessage');
    if (msg) msg.textContent = `¿Seguro que deseas eliminar "${p.name}"? Se quitará inmediatamente del catálogo de la tienda.`;
    openModal(confirmDeleteModal);
  };

  confirmDeleteBtn?.addEventListener('click', () => {
    if (erpState.deletingProductId) {
      const p = DB.getProductById(erpState.deletingProductId);
      DB.deleteProduct(erpState.deletingProductId);
      showErpToast(`Producto "${p?.name || ''}" eliminado del catálogo`, '🗑️');
      erpState.deletingProductId = null;
      closeModal(confirmDeleteModal);
      renderInventory();
      if (erpState.currentTab === 'dashboard') renderDashboard();
    }
  });

  closeDeleteModalBtn?.addEventListener('click', () => closeModal(confirmDeleteModal));
  cancelDeleteBtn?.addEventListener('click', () => closeModal(confirmDeleteModal));

  // --- 3. VISTA PRECIOS & PROMOCIONES ---
  function renderPricing() {
    const products = DB.getProducts();
    const pricingTable = document.getElementById('pricingTableBody');
    if (pricingTable) {
      pricingTable.innerHTML = products.map(p => {
        const discountPct = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
        return `
          <tr>
            <td>
              <div class="table-prod-cell">
                <img class="table-prod-img" src="${p.image}" alt="${p.name}" />
                <div>
                  <div class="table-prod-name">${p.name}</div>
                  <div class="table-prod-sku">${p.category}</div>
                </div>
              </div>
            </td>
            <td>
              <input type="number" step="0.05" value="${p.price.toFixed(2)}" 
                style="width: 100px; padding: 6px 10px; background: var(--erp-sidebar); border: 1px solid var(--erp-border); border-radius: 4px; font-weight: 700;"
                onchange="quickUpdatePrice('${p.id}', this.value)" /> €
            </td>
            <td>
              <input type="number" step="0.05" value="${p.originalPrice ? p.originalPrice.toFixed(2) : ''}" placeholder="Sin rebaja"
                style="width: 100px; padding: 6px 10px; background: var(--erp-sidebar); border: 1px solid var(--erp-border); border-radius: 4px;"
                onchange="quickUpdateOriginalPrice('${p.id}', this.value)" /> €
            </td>
            <td>
              ${discountPct > 0 ? `<span class="status-pill status-badge-pending">-${discountPct}%</span>` : `<span style="color: var(--erp-text-dim); font-size: 0.8rem;">Precio habitual</span>`}
            </td>
            <td>
              <button class="btn-erp-secondary" style="padding: 5px 12px; font-size: 0.78rem;" onclick="openEditProductModal('${p.id}')">Editar Todo</button>
            </td>
          </tr>
        `;
      }).join('');
    }

    renderCoupons();
  }

  window.quickUpdatePrice = function(productId, newPrice) {
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;
    DB.updateProduct(productId, { price: priceNum });
    showErpToast(`Precio actualizado a ${priceNum.toFixed(2)}€`, '🏷️');
    renderPricing();
  };

  window.quickUpdateOriginalPrice = function(productId, newOriginalPrice) {
    const val = newOriginalPrice.trim() === '' ? null : parseFloat(newOriginalPrice);
    DB.updateProduct(productId, { originalPrice: val });
    showErpToast(`Precio de oferta modificado`, '🏷️');
    renderPricing();
  };

  // Descuento masivo
  window.applyBulkDiscount = function(percent) {
    const products = DB.getProducts();
    const factor = (100 - percent) / 100;
    products.forEach(p => {
      if (!p.originalPrice) p.originalPrice = p.price;
      p.price = parseFloat((p.originalPrice * factor).toFixed(2));
      p.tag = `-${percent}%`;
    });
    DB.saveProducts(products);
    renderPricing();
    showErpToast(`¡Rebaja masiva del ${percent}% aplicada a toda la tienda!`, '🔥');
  };

  window.resetDiscounts = function() {
    const products = DB.getProducts();
    products.forEach(p => {
      if (p.originalPrice) {
        p.price = p.originalPrice;
        p.originalPrice = null;
        if (p.tag && p.tag.includes('%')) p.tag = '';
      }
    });
    DB.saveProducts(products);
    renderPricing();
    showErpToast('Rebajas restablecidas a precios estándar', '✓');
  };

  // Cupones Promocionales
  function renderCoupons() {
    const couponsTable = document.getElementById('couponsTableBody');
    if (!couponsTable) return;
    couponsTable.innerHTML = promoCodes.map((c, index) => `
      <tr>
        <td><strong style="color: var(--accent-gold); font-family: monospace; font-size: 1rem;">${c.code}</strong></td>
        <td><strong>${c.discount}</strong></td>
        <td>${c.usageCount} veces</td>
        <td>
          <label class="switch-label">
            <input type="checkbox" ${c.active ? 'checked' : ''} onchange="toggleCoupon(${index})">
            <span class="switch-slider"></span>
          </label>
        </td>
        <td>
          <button class="table-btn delete-btn" onclick="deleteCoupon(${index})" title="Eliminar cupón">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.toggleCoupon = function(index) {
    promoCodes[index].active = !promoCodes[index].active;
    saveCoupons();
    showErpToast(`Cupón "${promoCodes[index].code}" ${promoCodes[index].active ? 'activado' : 'desactivado'}`, '🎟️');
  };

  window.deleteCoupon = function(index) {
    const code = promoCodes[index].code;
    promoCodes.splice(index, 1);
    saveCoupons();
    renderCoupons();
    showErpToast(`Cupón "${code}" eliminado`, '🗑️');
  };

  const openNewCouponBtn = document.getElementById('openNewCouponBtn');
  openNewCouponBtn?.addEventListener('click', () => {
    couponForm.reset();
    openModal(newCouponModal);
  });

  couponForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newC = {
      code: document.getElementById('couponCode').value.toUpperCase().trim(),
      discount: document.getElementById('couponDiscount').value.trim(),
      type: "percentage",
      active: true,
      usageCount: 0
    };
    promoCodes.push(newC);
    saveCoupons();
    closeModal(newCouponModal);
    renderCoupons();
    showErpToast(`Cupón "${newC.code}" creado con éxito`, '✨');
  });

  closeCouponModalBtn?.addEventListener('click', () => closeModal(newCouponModal));
  cancelCouponBtn?.addEventListener('click', () => closeModal(newCouponModal));

  // --- 4. VISTA MÉTODOS DE PAGO ---
  function renderPaymentMethods() {
    const methods = DB.getPaymentMethods();
    const grid = document.getElementById('paymentMethodsGrid');
    if (!grid) return;

    grid.innerHTML = methods.map(m => `
      <div class="payment-method-card">
        <div class="pm-header">
          <div class="pm-info">
            <h4>
              ${m.name}
              <span class="status-pill status-in-stock" style="font-size: 0.65rem;">${m.badge}</span>
            </h4>
            <p>${m.description}</p>
          </div>
          <label class="switch-label">
            <input type="checkbox" ${m.active ? 'checked' : ''} onchange="handlePaymentToggle('${m.id}')">
            <span class="switch-slider"></span>
          </label>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--erp-border); font-size: 0.78rem; color: var(--erp-text-dim);">
          <span>Comisión de transacción: <strong style="color: var(--erp-text);">${m.fee}</strong></span>
          <span>Entorno: <strong style="color: var(--accent-green);">${m.environment}</strong></span>
        </div>
      </div>
    `).join('');
  }

  window.handlePaymentToggle = function(methodId) {
    const updated = DB.togglePaymentMethod(methodId);
    showErpToast(`Pasarela "${updated.name}" ${updated.active ? 'activada' : 'desactivada'}`, '💳');
  };

  // --- 5. VISTA CLIENTES ---
  function renderCustomers() {
    const customers = DB.getCustomers();
    const customersTable = document.getElementById('customersTableBody');
    if (!customersTable) return;

    customersTable.innerHTML = customers.map(c => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--erp-card-hover); border: 1px solid var(--erp-border); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.82rem; color: var(--accent-gold);">
              ${c.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style="font-weight: 600;">${c.name}</div>
              <div style="font-size: 0.72rem; color: var(--erp-text-dim);">${c.id}</div>
            </div>
          </div>
        </td>
        <td>
          <div>${c.email}</div>
          <div style="font-size: 0.75rem; color: var(--erp-text-dim);">${c.phone}</div>
        </td>
        <td>${c.city}</td>
        <td><strong>${c.totalOrders}</strong></td>
        <td><strong style="color: var(--accent-gold);">${c.totalSpent.toFixed(2)}€</strong></td>
        <td>
          <span class="status-pill ${c.status === 'VIP' ? 'status-badge-pending' : 'status-in-stock'}">${c.status}</span>
        </td>
      </tr>
    `).join('');
  }

  // --- 6. VISTA PEDIDOS ---
  function renderOrders() {
    const orders = DB.getOrders();
    const ordersTable = document.getElementById('ordersTableBody');
    if (!ordersTable) return;

    ordersTable.innerHTML = orders.map(o => `
      <tr>
        <td><strong style="color: var(--accent-gold); font-size: 0.95rem;">#${o.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${o.customer.name}</div>
          <div style="font-size: 0.75rem; color: var(--erp-text-dim);">${o.customer.email}</div>
        </td>
        <td><span style="font-size: 0.8rem; color: var(--erp-text-muted);">${o.date}</span></td>
        <td>
          <span style="font-size: 0.82rem; font-weight: 500;">${o.items.length} prenda(s)</span>
        </td>
        <td><strong style="font-size: 1rem;">${o.total.toFixed(2)}€</strong></td>
        <td>
          <select class="order-status-select" onchange="handleOrderStatusChange('${o.id}', this.value)">
            <option value="Pendiente" ${o.status === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
            <option value="En Preparación" ${o.status === 'En Preparación' ? 'selected' : ''}>⚙️ En Preparación</option>
            <option value="Enviado" ${o.status === 'Enviado' ? 'selected' : ''}>🚚 Enviado</option>
            <option value="Entregado" ${o.status === 'Entregado' ? 'selected' : ''}>✓ Entregado</option>
            <option value="Cancelado" ${o.status === 'Cancelado' ? 'selected' : ''}>✕ Cancelado</option>
          </select>
        </td>
        <td>
          <button class="table-btn" onclick="openOrderDetail('${o.id}')" title="Ver Desglose del Pedido">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.handleOrderStatusChange = function(orderId, newStatus) {
    DB.updateOrderStatus(orderId, newStatus);
    showErpToast(`Pedido #${orderId} actualizado a estado "${newStatus}"`, '📦');
    if (erpState.currentTab === 'dashboard') renderDashboard();
  };

  window.openOrderDetail = function(orderId) {
    const orders = DB.getOrders();
    const o = orders.find(ord => ord.id === orderId);
    if (!o) return;

    document.getElementById('odOrderId').textContent = `#${o.id}`;
    document.getElementById('odDate').textContent = o.date;
    document.getElementById('odStatusBadge').innerHTML = getOrderStatusBadge(o.status);
    document.getElementById('odCustomerName').textContent = o.customer.name;
    document.getElementById('odCustomerEmail').textContent = o.customer.email;
    document.getElementById('odCustomerPhone').textContent = o.customer.phone || 'No especificado';
    document.getElementById('odAddress').textContent = o.shippingAddress || 'Dirección estándar';
    document.getElementById('odPayment').textContent = o.paymentMethod || 'Pasarela Web';
    document.getElementById('odTotal').textContent = `${o.total.toFixed(2)}€`;

    const itemsContainer = document.getElementById('odItemsList');
    itemsContainer.innerHTML = o.items.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--erp-border);">
        <div>
          <div style="font-weight: 600; font-size: 0.9rem;">${item.name}</div>
          <div style="font-size: 0.78rem; color: var(--erp-text-dim);">Talla: ${item.size || 'Estándar'} • Cantidad: ${item.quantity || item.qty || 1}</div>
        </div>
        <strong>${((item.price) * (item.quantity || item.qty || 1)).toFixed(2)}€</strong>
      </div>
    `).join('');

    openModal(orderDetailModal);
  };

  closeOrderDetailBtn?.addEventListener('click', () => closeModal(orderDetailModal));

  function getOrderStatusBadge(status) {
    const classes = {
      'Entregado': 'status-badge-delivered',
      'Enviado': 'status-badge-shipped',
      'Pendiente': 'status-badge-pending',
      'En Preparación': 'status-badge-preparing',
      'Cancelado': 'status-out-stock'
    };
    return `<span class="status-pill ${classes[status] || 'status-badge-pending'}">${status}</span>`;
  }

  // --- 7. VISTA CONFIGURACIÓN ---
  function loadSettingsForm() {
    const s = DB.getSettings();
    if (!s) return;
    document.getElementById('setStoreName').value = s.storeName || '';
    document.getElementById('setCurrency').value = s.currency || 'EUR (€)';
    document.getElementById('setVat').value = s.vatTaxRate || 21;
    document.getElementById('setFreeShipping').value = s.freeShippingThreshold || 90;
    document.getElementById('setEmail').value = s.contactEmail || '';
    document.getElementById('setAlertEmail').checked = !!s.ordersAlertEmail;
  }

  const settingsForm = document.getElementById('settingsForm');
  settingsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      storeName: document.getElementById('setStoreName').value,
      currency: document.getElementById('setCurrency').value,
      vatTaxRate: parseFloat(document.getElementById('setVat').value),
      freeShippingThreshold: parseFloat(document.getElementById('setFreeShipping').value),
      contactEmail: document.getElementById('setEmail').value,
      ordersAlertEmail: document.getElementById('setAlertEmail').checked
    };
    DB.saveSettings(updated);
    showErpToast('Ajustes generales guardados correctamente', '💾');
  });

  // --- FUNCIONES AUXILIARES DE MODAL (SIN ALERTAS NATIVAS) ---
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('open');
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('open');
  }

  // Cerrar modales al presionar la tecla ESC o fondo
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(productModal);
      closeModal(confirmDeleteModal);
      closeModal(orderDetailModal);
      closeModal(newCouponModal);
    }
  });

  document.querySelectorAll('.erp-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // --- TOAST NOTIFICATIONS ERP ---
  function showErpToast(message, icon = '✓') {
    const container = document.getElementById('erpToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'erp-toast';
    toast.innerHTML = `
      <span style="font-size: 1.1rem; color: var(--accent-gold);">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  }

  // Carga inicial
  switchView('dashboard');
});
