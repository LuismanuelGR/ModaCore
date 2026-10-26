/**
 * MODACORE - Aplicación Principal y Lógica Interactiva
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Estado Global ---
  let state = {
    cart: JSON.parse(localStorage.getItem('modacore_cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('modacore_wishlist')) || [],
    filter: 'all',
    searchQuery: '',
    sortBy: 'default',
    darkMode: localStorage.getItem('modacore_dark') === 'true'
  };

  // Umbral para envío gratuito en Euros
  const FREE_SHIPPING_THRESHOLD = 90.00;

  // --- Elementos del DOM ---
  const header = document.querySelector('.site-header');
  const productsGrid = document.getElementById('productsGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('catalogSearch');
  const sortSelect = document.getElementById('catalogSort');
  
  // Contadores
  const cartBadge = document.getElementById('cartBadge');
  const wishlistBadge = document.getElementById('wishlistBadge');

  // Drawer Carrito
  const cartDrawer = document.getElementById('cartDrawer');
  const cartBackdrop = document.getElementById('modalBackdrop');
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const shippingMsgEl = document.getElementById('shippingMsg');
  const shippingProgressEl = document.getElementById('shippingProgress');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // Modal Quick View
  const quickViewModal = document.getElementById('quickViewModal');
  const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');
  const qvImage = document.getElementById('qvImage');
  const qvCategory = document.getElementById('qvCategory');
  const qvTitle = document.getElementById('qvTitle');
  const qvPrice = document.getElementById('qvPrice');
  const qvOldPrice = document.getElementById('qvOldPrice');
  const qvDesc = document.getElementById('qvDesc');
  const qvSizes = document.getElementById('qvSizes');
  const qvAddToCartBtn = document.getElementById('qvAddToCartBtn');
  let currentQvProduct = null;
  let selectedQvSize = null;

  // Dark Mode Toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // Mobile Drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const closeMobileNavBtn = document.getElementById('closeMobileNavBtn');

  // Newsletter
  const newsletterForm = document.getElementById('newsletterForm');

  // --- Inicialización del Tema ---
  function updateThemeIcon() {
    if (!themeToggleBtn) return;
    if (state.darkMode) {
      themeToggleBtn.innerHTML = `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:20px;height:20px;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'Cambiar a Modo Claro');
    } else {
      themeToggleBtn.innerHTML = `
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:20px;height:20px;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'Cambiar a Modo Oscuro');
    }
  }

  if (state.darkMode) {
    document.body.classList.add('dark-mode');
  }
  updateThemeIcon();

  themeToggleBtn?.addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode', state.darkMode);
    localStorage.setItem('modacore_dark', state.darkMode);
    updateThemeIcon();
    showToast(state.darkMode ? 'Modo Oscuro activado' : 'Modo Claro activado', state.darkMode ? '🌙' : '☀️');
  });

  // Botón Favoritos en Cabecera
  const wishlistHeaderBtn = document.getElementById('wishlistHeaderBtn');
  wishlistHeaderBtn?.addEventListener('click', () => {
    if (state.wishlist.length === 0) {
      showToast('Aún no tienes favoritos. ¡Pulsa el corazón de una prenda!', '🤍');
      document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    state.filter = 'wishlist';
    filterBtns.forEach(b => b.classList.remove('active'));
    renderProducts();
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Mostrando tus ${state.wishlist.length} artículos favoritos`, '❤️');
  });

  // --- Scroll Header con Glassmorphism ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- Intersection Observer para Animaciones Fade-in ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function observeElements() {
    document.querySelectorAll('.fade-in-up:not(.visible)').forEach(el => {
      revealObserver.observe(el);
    });
  }

  // --- Fuente de Datos Reactiva con el ERP ---
  const currentPage = document.body.dataset.page || 'home';

  function getActiveCatalog() {
    return (typeof DB !== 'undefined') ? DB.getProducts() : PRODUCTS;
  }

  // Escuchar sincronización en tiempo real desde el ERP
  window.addEventListener('modacore_products_updated', () => {
    renderProducts();
    renderCart();
  });

  // --- Renderizado de Productos con Filtros y Búsqueda Temática ---
  function getFilteredProducts() {
    let all = getActiveCatalog();

    // 1. Contexto según la página dedicada
    if (currentPage === 'mujeres') {
      all = all.filter(item => item.category === 'mujeres');
    } else if (currentPage === 'hombres') {
      all = all.filter(item => item.category === 'hombres');
    } else if (currentPage === 'kids') {
      all = all.filter(item => item.category === 'kids');
    } else if (currentPage === 'calzado') {
      all = all.filter(item => item.type === 'calzado');
    } else if (currentPage === 'home') {
      // En Inicio mostramos una selección curada destacada (máximo 8 piezas estelares)
      if (state.filter === 'all' && state.searchQuery.trim() === '') {
        const featured = all.filter(item => item.badgeType === 'hot' || item.badgeType === 'new' || item.originalPrice).slice(0, 8);
        all = featured.length > 0 ? featured : all.slice(0, 8);
      }
    }

    // 2. Filtro local secundario (pills: ropa, calzado, etc.)
    return all.filter(item => {
      let matchesFilter = true;
      if (state.filter === 'all') {
        matchesFilter = true;
      } else if (state.filter === 'ropa' || state.filter === 'calzado') {
        matchesFilter = item.type === state.filter;
      } else if (state.filter === 'mujeres' || state.filter === 'hombres' || state.filter === 'kids') {
        matchesFilter = item.category === state.filter;
      } else if (state.filter === 'wishlist') {
        matchesFilter = state.wishlist.includes(item.id);
      }

      // Filtro de búsqueda
      let matchesSearch = true;
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase();
        matchesSearch = item.name.toLowerCase().includes(query) ||
                        item.description.toLowerCase().includes(query) ||
                        item.category.toLowerCase().includes(query) ||
                        item.type.toLowerCase().includes(query);
      }

      return matchesFilter && matchesSearch;
    }).sort((a, b) => {
      if (state.sortBy === 'price-asc') return a.price - b.price;
      if (state.sortBy === 'price-desc') return b.price - a.price;
      if (state.sortBy === 'rating') return b.rating - a.rating;
      return 0; // default order
    });
  }

  function renderProducts() {
    const filtered = getFilteredProducts();

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; color: var(--text-muted);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">No encontramos coincidencias</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Prueba a cambiar el filtro o el término de búsqueda.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(prod => {
      const isWishlisted = state.wishlist.includes(prod.id);
      const colorDots = prod.colors.map(c => `<span class="color-dot" style="background-color: ${c};"></span>`).join('');
      const badgeHtml = prod.tag ? `<span class="product-badge badge-${prod.badgeType || 'hot'}">${prod.tag}</span>` : '';

      return `
        <article class="product-card fade-in-up" data-id="${prod.id}">
          <div class="product-image-box">
            ${badgeHtml}
            <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" data-action="toggle-wishlist" data-id="${prod.id}" title="Añadir a Deseos" aria-label="Añadir a Deseos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <img class="product-img-primary" src="${prod.image}" alt="${prod.name}" loading="lazy" />
            <img class="product-img-hover" src="${prod.hoverImage || prod.image}" alt="${prod.name} detalle" loading="lazy" />
            
            <div class="quick-action-overlay">
              <button class="btn-quick-view" data-action="quick-view" data-id="${prod.id}">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista Rápida
              </button>
              <button class="btn-quick-add" data-action="quick-add" data-id="${prod.id}" title="Añadir al Carrito" aria-label="Añadir">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="product-details">
            <span class="product-cat-type">${prod.category} • ${prod.type}</span>
            <h4 class="product-title" data-action="quick-view" data-id="${prod.id}" style="cursor: pointer;">${prod.name}</h4>
            <div class="product-price-row">
              <span class="product-price">${prod.price.toFixed(2)}€</span>
              ${prod.originalPrice ? `<span class="product-original-price">${prod.originalPrice.toFixed(2)}€</span>` : ''}
            </div>
            <div class="product-colors-dots">
              ${colorDots}
            </div>
          </div>
        </article>
      `;
    }).join('');

    observeElements();
  }

  // --- Filtros de la Barra de Categorías ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filter = btn.dataset.filter;
      renderProducts();
    });
  });

  // Exponer función de filtro global para enlaces de secciones
  window.setCategoryFilter = function(categoryName) {
    state.filter = categoryName;
    filterBtns.forEach(btn => {
      if (btn.dataset.filter === categoryName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    renderProducts();

    // Desplazamiento suave al catálogo
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Búsqueda en Vivo
  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = e.target.value;
      renderProducts();
    }, 200);
  });

  // Ordenación
  sortSelect?.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderProducts();
  });

  // --- Interacciones con Productos (Event Delegation) ---
  productsGrid?.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const prodId = target.dataset.id;
    const product = PRODUCTS.find(p => p.id === prodId);

    if (action === 'toggle-wishlist') {
      e.stopPropagation();
      toggleWishlist(prodId);
    } else if (action === 'quick-view') {
      openQuickView(product);
    } else if (action === 'quick-add') {
      e.stopPropagation();
      addToCart(product, product.sizes[0], product.colors[0]);
    }
  });

  // --- Wishlist (Lista de Deseos) ---
  function toggleWishlist(prodId) {
    const index = state.wishlist.indexOf(prodId);
    if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast('Eliminado de tus favoritos', '🤍');
    } else {
      state.wishlist.push(prodId);
      showToast('¡Guardado en tus favoritos!', '❤️');
    }
    localStorage.setItem('modacore_wishlist', JSON.stringify(state.wishlist));
    updateBadges();
    renderProducts();
  }

  // --- Carrito de Compras ---
  function addToCart(product, size, color) {
    const chosenSize = size || product.sizes[0] || 'Única';
    const chosenColor = color || product.colors[0] || 'Default';

    const existingIndex = state.cart.findIndex(item => 
      item.id === product.id && item.size === chosenSize && item.color === chosenColor
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += 1;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        size: chosenSize,
        color: chosenColor,
        quantity: 1
      });
    }

    saveCart();
    renderCart();
    openCart();
    showToast(`"${product.name}" añadido a la bolsa`, '🛍️');
  }

  function removeFromCart(index) {
    state.cart.splice(index, 1);
    saveCart();
    renderCart();
    showToast('Artículo eliminado del carrito', '🗑️');
  }

  function updateQuantity(index, delta) {
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      removeFromCart(index);
    } else {
      saveCart();
      renderCart();
    }
  }

  function saveCart() {
    localStorage.setItem('modacore_cart', JSON.stringify(state.cart));
    updateBadges();
  }

  function renderCart() {
    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="empty-cart-state">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p style="font-weight: 600; font-size: 1.1rem; color: var(--text-main);">Tu bolsa de compra está vacía</p>
          <p style="font-size: 0.85rem;">Explora nuestras colecciones para Kids, Mujeres y Hombres.</p>
        </div>
      `;
      cartSubtotalEl.textContent = '0.00€';
      shippingMsgEl.innerHTML = `Envío gratis a partir de <strong>${FREE_SHIPPING_THRESHOLD.toFixed(2)}€</strong>`;
      shippingProgressEl.style.width = '0%';
      return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartSubtotalEl.textContent = `${subtotal.toFixed(2)}€`;

    // Cálculo de la barra de progreso de envío gratis
    const diff = FREE_SHIPPING_THRESHOLD - subtotal;
    if (diff <= 0) {
      shippingMsgEl.innerHTML = `<span style="color: #10B981; font-weight: 700;">¡Genial! Tienes Envío Gratis Express 🎉</span>`;
      shippingProgressEl.style.width = '100%';
      shippingProgressEl.style.backgroundColor = '#10B981';
    } else {
      const percentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
      shippingMsgEl.innerHTML = `Añade <strong>${diff.toFixed(2)}€</strong> más para <strong>Envío Gratis</strong>`;
      shippingProgressEl.style.width = `${percentage}%`;
      shippingProgressEl.style.backgroundColor = 'var(--accent-gold)';
    }

    cartItemsList.innerHTML = state.cart.map((item, index) => {
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
          <div class="cart-item-info">
            <h5 class="cart-item-name">${item.name}</h5>
            <div class="cart-item-meta">Talla: <strong>${item.size}</strong></div>
            <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)}€</div>
            <div class="cart-item-qty" style="margin-top: 6px;">
              <button class="qty-btn" data-cart-action="decrease" data-index="${index}">-</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" data-cart-action="increase" data-index="${index}">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-cart-action="remove" data-index="${index}" title="Eliminar artículo" aria-label="Eliminar">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      `;
    }).join('');
  }

  cartItemsList?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cart-action]');
    if (!btn) return;
    const action = btn.dataset.cartAction;
    const index = parseInt(btn.dataset.index, 10);

    if (action === 'increase') updateQuantity(index, 1);
    if (action === 'decrease') updateQuantity(index, -1);
    if (action === 'remove') removeFromCart(index);
  });

  function openCart() {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    if (!quickViewModal.classList.contains('open') && !mobileNavDrawer.classList.contains('open')) {
      cartBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  openCartBtn?.addEventListener('click', openCart);
  closeCartBtn?.addEventListener('click', closeCart);

  // --- Modal Quick View ---
  function openQuickView(product) {
    if (!product) return;
    currentQvProduct = product;
    selectedQvSize = product.sizes[0];

    qvImage.src = product.image;
    qvImage.alt = product.name;
    qvCategory.textContent = `${product.category} • ${product.type}`;
    qvTitle.textContent = product.name;
    qvPrice.textContent = `${product.price.toFixed(2)}€`;
    
    if (product.originalPrice) {
      qvOldPrice.style.display = 'inline';
      qvOldPrice.textContent = `${product.originalPrice.toFixed(2)}€`;
    } else {
      qvOldPrice.style.display = 'none';
    }

    qvDesc.textContent = product.description;

    // Render tallas
    qvSizes.innerHTML = product.sizes.map((s, idx) => `
      <button class="size-pill ${idx === 0 ? 'active' : ''}" data-size="${s}">${s}</button>
    `).join('');

    quickViewModal.classList.add('open');
    cartBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    quickViewModal.classList.remove('open');
    if (!cartDrawer.classList.contains('open') && !mobileNavDrawer.classList.contains('open')) {
      cartBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  closeQuickViewBtn?.addEventListener('click', closeQuickView);

  qvSizes?.addEventListener('click', (e) => {
    const pill = e.target.closest('.size-pill');
    if (!pill) return;
    qvSizes.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    selectedQvSize = pill.dataset.size;
  });

  qvAddToCartBtn?.addEventListener('click', () => {
    if (currentQvProduct) {
      addToCart(currentQvProduct, selectedQvSize, currentQvProduct.colors[0]);
      closeQuickView();
    }
  });

  // Cerrar cualquier drawer/modal al pulsar en el fondo
  cartBackdrop?.addEventListener('click', () => {
    closeCart();
    closeQuickView();
    closeMobileNav();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeQuickView();
      closeMobileNav();
    }
  });

  // --- Mobile Drawer ---
  function openMobileNav() {
    mobileNavDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNavDrawer.classList.remove('open');
    if (!cartDrawer.classList.contains('open') && !quickViewModal.classList.contains('open')) {
      cartBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  mobileMenuBtn?.addEventListener('click', openMobileNav);
  closeMobileNavBtn?.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // --- Actualizar Badges Numéricos ---
  function updateBadges() {
    const totalItems = state.cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';

    const wishlistCount = state.wishlist.length;
    wishlistBadge.textContent = wishlistCount;
    wishlistBadge.style.display = wishlistCount > 0 ? 'flex' : 'none';
  }

  // --- Modal Éxito Pedido (Sin alert nativo) ---
  const orderSuccessModal = document.getElementById('orderSuccessModal');
  const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');
  const confirmedOrderId = document.getElementById('confirmedOrderId');
  const confirmedOrderTotal = document.getElementById('confirmedOrderTotal');

  function closeOrderModal() {
    orderSuccessModal?.classList.remove('open');
    cartBackdrop?.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeOrderModalBtn?.addEventListener('click', closeOrderModal);
  continueShoppingBtn?.addEventListener('click', closeOrderModal);

  // --- Proceso de Checkout y Registro en ERP ---
  checkoutBtn?.addEventListener('click', () => {
    if (state.cart.length === 0) return;
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Crear el pedido en la base de datos del ERP
    const newOrder = (typeof DB !== 'undefined') ? DB.createOrder({
      items: [...state.cart],
      total: subtotal,
      paymentMethod: "Tarjeta de Crédito (Stripe)",
      customer: { name: "Cliente Tienda Web", email: "cliente@modacore.com", phone: "+34 600 000 000" },
      shippingAddress: "Paseo de Gracia 45, Barcelona"
    }) : { id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, total: subtotal };

    if (confirmedOrderId) confirmedOrderId.textContent = `#${newOrder.id}`;
    if (confirmedOrderTotal) confirmedOrderTotal.textContent = `${subtotal.toFixed(2)}€`;

    // Vaciar carrito
    state.cart = [];
    saveCart();
    renderCart();
    closeCart();

    // Abrir modal de confirmación con diseño exclusivo
    setTimeout(() => {
      orderSuccessModal?.classList.add('open');
      cartBackdrop?.classList.add('open');
      document.body.style.overflow = 'hidden';
      showToast('¡Pedido completado y registrado en el ERP!', '📦');
    }, 250);
  });

  // --- Suscripción a Newsletter ---
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    if (input && input.value) {
      showToast('¡Gracias por suscribirte al Club ModaCore! Tienes 10% de dto.', '✨');
      input.value = '';
    }
  });

  // --- Sistema de Toasts ---
  function showToast(message, icon = '✓') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-destrucción
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3200);
  }

  // Render inicial
  renderProducts();
  renderCart();
  updateBadges();
});
