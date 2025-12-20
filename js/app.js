// ====== Config / Estado ======
const API_URL = "https://fakestoreapi.com/products";
const CART_STORAGE_KEY = "fakeStoreCart";

let allProducts = [];
let cart = {};

// ====== DOM ======
const productsContainer = document.getElementById("products");

const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const cartSubtotalElement = document.getElementById("cart-subtotal");
const cartCountLabel = document.getElementById("cart-count-label");
const cartCountBadge = document.querySelector(".header__cart-count");

const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const sortSelect = document.getElementById("sort");

const toastEl = document.getElementById("toast");

// ====== API ======
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener productos");
    return await response.json();
  } catch (error) {
    console.error("Hubo un problema con la petición:", error);
    return [];
  }
}

// ====== Helpers productos ======
function getProductById(productId) {
  return allProducts.find((p) => p.id === productId) || null;
}

// ====== Productos: render ======
function createProductCard(product) {
  const article = document.createElement("article");
  article.classList.add("product-card");
  article.dataset.id = String(product.id);

  article.innerHTML = `
    <div class="product-card__image-wrapper">
      <img src="${product.image}" alt="${product.title}" class="product-card__image" />
    </div>

    <div class="product-card__body">
      <h3 class="product-card__title">${product.title}</h3>

      <p class="product-card__category">
        Categoría: <span>${product.category}</span>
      </p>

      <div class="product-card__price-row">
        <span class="product-card__price">$${product.price.toFixed(2)}</span>
      </div>

      <button class="btn btn--primary product-card__btn" type="button">
        Agregar al carrito
      </button>
    </div>
  `;

  return article;
}

function renderProducts(products) {
  productsContainer.innerHTML = "";
  products.forEach((p) => productsContainer.appendChild(createProductCard(p)));
}

// ====== Categorías ======
function populateCategories(products) {
  const categories = Array.from(new Set(products.map((p) => p.category))).sort();

  categorySelect.innerHTML = `<option value="all">Todas</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// ====== Filtros / Orden / Búsqueda ======
function normalizeText(text) {
  return String(text).toLowerCase().trim();
}

function filterBySearch(products, searchValue) {
  const q = normalizeText(searchValue);
  if (!q) return products;

  return products.filter((p) => {
    const title = normalizeText(p.title);
    const desc = normalizeText(p.description);
    return title.includes(q) || desc.includes(q);
  });
}

function filterByCategory(products, categoryValue) {
  if (!categoryValue || categoryValue === "all") return products;
  return products.filter((p) => p.category === categoryValue);
}

function sortProducts(products, sortValue) {
  const copy = [...products];

  if (sortValue === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sortValue === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sortValue === "name-asc") copy.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortValue === "name-desc") copy.sort((a, b) => b.title.localeCompare(a.title));

  return copy;
}

function applyFiltersAndRender() {
  const searchValue = searchInput.value;
  const categoryValue = categorySelect.value;
  const sortValue = sortSelect.value;

  let result = allProducts;
  result = filterBySearch(result, searchValue);
  result = filterByCategory(result, categoryValue);
  result = sortProducts(result, sortValue);

  renderProducts(result);
}

// ====== Carrito: storage ======
function saveCartToStorage() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function loadCartFromStorage() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Error al parsear carrito:", error);
    return {};
  }
}

// Si el carrito viene viejo (sin image), se completa usando allProducts
function hydrateCartFromProducts() {
  Object.keys(cart).forEach((key) => {
    const id = Number(key);
    if (!cart[id]) return;

    if (!cart[id].image) {
      const product = getProductById(id);
      if (product) cart[id].image = product.image;
    }
  });
}

// ====== Carrito: cálculos ======
function getCartQuantity() {
  return Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
}

function getCartTotal() {
  return Object.values(cart).reduce((acc, item) => acc + item.price * item.quantity, 0);
}

// ====== UI Animations (JS) ======
function animateCartBadge() {
  cartCountBadge.classList.remove("cart-badge-pop");
  void cartCountBadge.offsetWidth; // reflow para reiniciar animación
  cartCountBadge.classList.add("cart-badge-pop");
}

let toastTimeoutId = null;

function showToast(message) {
  if (!toastEl) return;

  toastEl.textContent = message;
  toastEl.classList.add("toast--show");

  clearTimeout(toastTimeoutId);
  toastTimeoutId = setTimeout(() => {
    toastEl.classList.remove("toast--show");
  }, 1400);
}

// ====== Carrito: render ======
function createCartItemRow(item) {
  const div = document.createElement("div");
  div.classList.add("cart-item");
  div.dataset.id = String(item.id);

  div.innerHTML = `
    <img class="cart-item__img" src="${item.image || ""}" alt="${item.title}" />

    <div class="cart-item__main">
      <div>
        <div class="cart-item__title">${item.title}</div>
        <div class="cart-item__meta">Precio unitario: $${item.price.toFixed(2)}</div>

        <div class="cart-item__actions">
          <div class="qty">
            <button class="qty__btn js-minus" type="button" aria-label="Disminuir">−</button>
            <span class="qty__value">${item.quantity}</span>
            <button class="qty__btn js-plus" type="button" aria-label="Aumentar">+</button>
          </div>

          <button class="cart-item__remove js-remove" type="button">
            Eliminar
          </button>
        </div>
      </div>

      <div class="cart-item__price">$${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `;

  return div;
}

function renderCart() {
  cartItemsContainer.innerHTML = "";

  const items = Object.values(cart);

  if (items.length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
  } else {
    items.forEach((item) => cartItemsContainer.appendChild(createCartItemRow(item)));
  }

  const totalQuantity = getCartQuantity();
  const total = getCartTotal();

  cartCountBadge.textContent = String(totalQuantity);
  cartCountLabel.textContent = `${totalQuantity} artículo${totalQuantity === 1 ? "" : "s"}`;

  cartSubtotalElement.textContent = `$${total.toFixed(2)}`;
  cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

function commitCart() {
  renderCart();
  saveCartToStorage();
}

// ====== Carrito: acciones ======
function addToCartById(productId) {
  const product = getProductById(productId);
  if (!product) return;

  if (cart[productId]) {
    cart[productId].quantity += 1;
  } else {
    cart[productId] = {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    };
  }

  commitCart();
  animateCartBadge();
  showToast("Producto agregado al carrito");
}

function decrementItem(productId) {
  if (!cart[productId]) return;

  if (cart[productId].quantity > 1) {
    cart[productId].quantity -= 1;
  } else {
    delete cart[productId];
  }

  commitCart();
}

function deleteItem(productId) {
  if (!cart[productId]) return;
  delete cart[productId];
  commitCart();
}

// ====== Eventos ======
productsContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".product-card__btn");
  if (!btn) return;

  const card = btn.closest(".product-card");
  if (!card) return;

  const productId = Number(card.dataset.id);
  if (Number.isNaN(productId)) return;

  addToCartById(productId);
});

cartItemsContainer.addEventListener("click", (event) => {
  const row = event.target.closest(".cart-item");
  if (!row) return;

  const productId = Number(row.dataset.id);
  if (Number.isNaN(productId)) return;

  if (event.target.closest(".js-plus")) addToCartById(productId);
  else if (event.target.closest(".js-minus")) decrementItem(productId);
  else if (event.target.closest(".js-remove")) deleteItem(productId);
});

searchInput.addEventListener("input", applyFiltersAndRender);
categorySelect.addEventListener("change", applyFiltersAndRender);
sortSelect.addEventListener("change", applyFiltersAndRender);

// ====== Init ======
async function init() {
  allProducts = await fetchProducts();

  populateCategories(allProducts);
  applyFiltersAndRender();

  cart = loadCartFromStorage();
  hydrateCartFromProducts();
  renderCart();
}

init();
