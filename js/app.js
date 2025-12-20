// ====== Config / Estado ======
const API_URL = "https://fakestoreapi.com/products";
const CART_STORAGE_KEY = "fakeStoreCart";

let cart = {};
let allProducts = [];

// ====== Referencias al DOM ======
const productsContainer = document.getElementById("products");

const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const cartCountElement = document.querySelector(".header__cart-count");

const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const sortSelect = document.getElementById("sort");

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

// ====== Helpers (productos) ======
function getProductById(products, productId) {
  return products.find((p) => p.id === productId) || null;
}

// ====== Renderizado de productos ======
function createProductCard(product) {
  const article = document.createElement("article");
  article.classList.add("product-card");
  article.dataset.id = String(product.id);

  article.innerHTML = `
    <div class="product-card__image-wrapper">
      <img
        src="${product.image}"
        alt="${product.title}"
        class="product-card__image"
      />
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
  products.forEach((product) => productsContainer.appendChild(createProductCard(product)));
}

// ====== Categorías (select dinámico) ======
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
  if (sortValue === "price-desc") copy.sort((a, b) => b.price - a.price);
  if (sortValue === "name-asc") copy.sort((a, b) => a.title.localeCompare(b.title));
  if (sortValue === "name-desc") copy.sort((a, b) => b.title.localeCompare(a.title));

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

// ====== Carrito: utilidades ======
function getCartTotal(cartObj) {
  let total = 0;
  for (const key in cartObj) {
    const item = cartObj[key];
    total += item.price * item.quantity;
  }
  return total;
}

function getCartQuantity(cartObj) {
  let quantity = 0;
  for (const key in cartObj) {
    quantity += cartObj[key].quantity;
  }
  return quantity;
}

// ====== localStorage ======
function saveCartToStorage(cartObj) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartObj));
}

function loadCartFromStorage() {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!storedCart) return {};

  try {
    const parsed = JSON.parse(storedCart);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Error al parsear carrito desde localStorage:", error);
    return {};
  }
}

// ====== Renderizado del carrito ======
function renderCart() {
  cartItemsContainer.innerHTML = "";

  const keys = Object.keys(cart);
  if (keys.length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
  } else {
    keys.forEach((key) => {
      const item = cart[key];

      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.dataset.id = String(item.id);

      div.innerHTML = `
        <div class="cart-item__info">
          <span class="cart-item__title">${item.title}</span>
          <span class="cart-item__quantity">x${item.quantity}</span>
        </div>
        <div class="cart-item__price-block">
          <span class="cart-item__price">$${item.price.toFixed(2)}</span>
          <button class="cart-item__remove" type="button">Eliminar</button>
        </div>
      `;

      cartItemsContainer.appendChild(div);
    });
  }

  cartTotalElement.textContent = `$${getCartTotal(cart).toFixed(2)}`;
  cartCountElement.textContent = String(getCartQuantity(cart));
}

// Centraliza: render + storage
function commitCart() {
  renderCart();
  saveCartToStorage(cart);
}

// ====== Carrito: lógica ======
function addToCartById(productId) {
  const product = getProductById(allProducts, productId);
  if (!product) return;

  if (cart[productId]) {
    cart[productId].quantity += 1;
  } else {
    cart[productId] = {
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1
    };
  }

  commitCart();
}

function removeFromCart(productId) {
  if (!cart[productId]) return;

  if (cart[productId].quantity > 1) {
    cart[productId].quantity -= 1;
  } else {
    delete cart[productId];
  }

  commitCart();
}

// ====== Eventos ======

// Productos: click en "Agregar al carrito"
productsContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".product-card__btn");
  if (!btn) return;

  const card = btn.closest(".product-card");
  if (!card) return;

  const productId = Number(card.dataset.id);
  if (Number.isNaN(productId)) return;

  addToCartById(productId);
});

// Carrito: click en "Eliminar"
cartItemsContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".cart-item__remove");
  if (!btn) return;

  const itemDiv = btn.closest(".cart-item");
  if (!itemDiv) return;

  const productId = Number(itemDiv.dataset.id);
  if (Number.isNaN(productId)) return;

  removeFromCart(productId);
});

// Búsqueda / filtros
searchInput.addEventListener("input", applyFiltersAndRender);
categorySelect.addEventListener("change", applyFiltersAndRender);
sortSelect.addEventListener("change", applyFiltersAndRender);

// ====== Inicialización ======
async function init() {
  allProducts = await fetchProducts();

  populateCategories(allProducts);
  applyFiltersAndRender();

  cart = loadCartFromStorage();
  renderCart();
}

init();
