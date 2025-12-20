// Clave para localStorage y estructura del carrito
const CART_STORAGE_KEY = "fakeStoreCart";
let cart = {};

// URL de la API
const API_URL = "https://fakestoreapi.com/products";

// Referencias al DOM
const productsContainer = document.getElementById("products");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const cartCountElement = document.querySelector(".header__cart-count");

/* ========= API ========= */

async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error al obtener productos");
    }

    const data = await response.json();
    return data; // arreglo de productos
  } catch (error) {
    console.error("Hubo un problema con la petición:", error);
    return [];
  }
}

/* ========= Renderizado de productos ========= */

function createProductCard(product) {
  const article = document.createElement("article");
  article.classList.add("product-card");
  article.dataset.id = product.id;

  article.innerHTML = `
    <div class="product-card__image-wrapper">
      <img
        src="${product.image}"
        alt="${product.title}"
        class="product-card__image"
      />
    </div>

    <div class="product-card__body">
      <h3 class="product-card__title">
        ${product.title}
      </h3>

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

  products.forEach((product) => {
    const card = createProductCard(product);
    productsContainer.appendChild(card);
  });
}

/* ========= Utilidades de carrito ========= */

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

function saveCartToStorage(cartObj) {
  const cartString = JSON.stringify(cartObj);
  localStorage.setItem(CART_STORAGE_KEY, cartString);
}

function loadCartFromStorage() {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!storedCart) {
    return {};
  }

  try {
    const parsed = JSON.parse(storedCart);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Error al parsear carrito desde localStorage:", error);
    return {};
  }
}

/* ========= Renderizado del carrito ========= */

function renderCart() {
  cartItemsContainer.innerHTML = "";

  if (Object.keys(cart).length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
  } else {
    for (const key in cart) {
      const item = cart[key];

      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.dataset.id = item.id;

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
    }
  }

  const total = getCartTotal(cart);
  const totalQuantity = getCartQuantity(cart);

  cartTotalElement.textContent = `$${total.toFixed(2)}`;
  cartCountElement.textContent = totalQuantity;
}

/* ========= Lógica de carrito ========= */

function addToCart(product) {
  const id = product.id;

  if (cart[id]) {
    cart[id].quantity += 1;
  } else {
    cart[id] = {
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1
    };
  }

  renderCart();
  saveCartToStorage(cart);
}

function removeFromCart(productId) {
  const id = productId;

  if (!cart[id]) return;

  if (cart[id].quantity > 1) {
    cart[id].quantity -= 1;
  } else {
    delete cart[id];
  }

  renderCart();
  saveCartToStorage(cart);
}

/* ========= Eventos ========= */

// Clicks en productos (Agregar al carrito)
productsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("product-card__btn")) {
    const card = event.target.closest(".product-card");
    if (!card) return;

    const productId = card.dataset.id;
    const title = card.querySelector(".product-card__title").textContent.trim();
    const priceText = card
      .querySelector(".product-card__price")
      .textContent.replace("$", "");
    const price = parseFloat(priceText);

    addToCart({
      id: Number(productId),
      title,
      price
    });
  }
});

// Clicks en carrito (Eliminar)
cartItemsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("cart-item__remove")) {
    const itemDiv = event.target.closest(".cart-item");
    if (!itemDiv) return;

    const itemId = itemDiv.dataset.id;
    removeFromCart(Number(itemId));
  }
});

/* ========= Inicialización ========= */

async function init() {
  const productsFromApi = await fetchProducts();
  renderProducts(productsFromApi);

  cart = loadCartFromStorage();
  renderCart();
}

init();
