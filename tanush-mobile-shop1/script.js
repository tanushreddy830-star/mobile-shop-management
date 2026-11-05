// ==========================================
// TANUSH MOBILE SHOP - MAIN JAVASCRIPT
// ==========================================

// Update this to the shop's real WhatsApp business number
// (country code + number, no spaces or symbols).
const WHATSAPP_NUMBER = "919000090000";


// ==========================================
// CART STATE
// ==========================================

let cart = JSON.parse(localStorage.getItem("tanushCart")) || [];

function saveCart() {
    localStorage.setItem("tanushCart", JSON.stringify(cart));
}

function cartCount() {
    return cart.reduce(function(sum, item) {
        return sum + item.qty;
    }, 0);
}

function priceToNumber(price) {
    return Number(String(price).replace("₹", "").replace(/,/g, "").trim()) || 0;
}

function addToCart(product) {

    const existing = cart.find(function(item) {
        return item.name === product.name && item.brand === product.brand;
    });

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            brand: product.brand,
            name: product.name,
            price: product.price,
            qty: 1
        });
    }

    saveCart();
    updateCartCount();
}


// Create cart icon (links to the cart page)
const header = document.querySelector(".header");

if (header) {

    const cartLink = document.createElement("a");

    cartLink.href = "cart.html";
    cartLink.className = "cart-box";
    cartLink.setAttribute("aria-label", "View shopping cart");

    cartLink.innerHTML = `
        🛒
        <span class="cart-number">${cartCount()}</span>
    `;

    header.appendChild(cartLink);

}


// Update cart count badge
function updateCartCount() {

    const cartNumber = document.querySelector(".cart-number");

    if (cartNumber) {
        cartNumber.textContent = cartCount();
    }

}


// ==========================================
// READ PRODUCT INFO FROM A CARD
// Supports both the homepage "product-card"
// markup and the products-page "shop-card" markup.
// ==========================================

function readProductFromCard(card) {

    const brandEl = card.querySelector(".brand-name, .shop-info small");
    const nameEl = card.querySelector(".product-info h3, .shop-info h3");
    const priceEl = card.querySelector(".price, .shop-info h4");

    return {
        brand: brandEl ? brandEl.textContent.trim() : "",
        name: nameEl ? nameEl.textContent.trim() : "",
        price: priceEl ? priceEl.textContent.trim() : "₹0"
    };
}


// ==========================================
// ADD TO CART BUTTONS (home + products page)
// ==========================================

const addButtons = document.querySelectorAll(".add-btn, .cart-btn");

addButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const card = button.closest(".shop-card, .product-card");

        if (!card) return;

        const product = readProductFromCard(card);
        const originalText = button.innerHTML;

        addToCart(product);

        // Button confirmation animation
        button.textContent = "✓ Added";
        button.classList.add("added");

        setTimeout(function() {
            button.innerHTML = originalText;
            button.classList.remove("added");
        }, 1200);

    });

});


// ==========================================
// BUY NOW BUTTONS (home + products page)
// Adds the item then sends the shopper straight
// to the cart to complete checkout.
// ==========================================

const buyButtons = document.querySelectorAll(".shop-buy, .buy-btn");

buyButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const card = button.closest(".shop-card, .product-card");

        if (!card) return;

        const product = readProductFromCard(card);

        addToCart(product);

        window.location.href = "cart.html";

    });

});


// ==========================================
// SEARCH BAR (products page)
// ==========================================

const shopSection = document.querySelector(".shop-section");

if (shopSection) {

    const filterBar = document.querySelector(".filter-bar");

    const searchBox = document.createElement("div");

    searchBox.className = "search-box";

    searchBox.innerHTML = `
        <input
            type="text"
            id="productSearch"
            placeholder="🔍 Search smartphones..."
        >
    `;

    shopSection.insertBefore(searchBox, filterBar);

    const searchInput = document.getElementById("productSearch");
    const productCards = document.querySelectorAll(".shop-card");

    searchInput.addEventListener("input", function() {

        const searchValue = searchInput.value.toLowerCase();

        // Typing a search resets any active brand filter
        // so results aren't hidden by both filters at once.
        document.querySelectorAll(".filter").forEach(function(btn) {
            btn.classList.remove("active-filter");
        });

        const allBtn = document.querySelector(".filter");
        if (allBtn) allBtn.classList.add("active-filter");

        productCards.forEach(function(card) {

            const productText = card.textContent.toLowerCase();

            card.style.display = productText.includes(searchValue)
                ? "block"
                : "none";

        });

    });

}


// ==========================================
// BRAND FILTERS (products page)
// ==========================================

const filterButtons = document.querySelectorAll(".filter");

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        filterButtons.forEach(function(btn) {
            btn.classList.remove("active-filter");
        });

        button.classList.add("active-filter");

        const searchInput = document.getElementById("productSearch");
        if (searchInput) searchInput.value = "";

        const selectedBrand = button.textContent.trim().toLowerCase();
        const products = document.querySelectorAll(".shop-card");

        products.forEach(function(product) {

            const brandEl = product.querySelector(".shop-info small");
            const brand = brandEl ? brandEl.textContent.toLowerCase() : "";

            const matches =
                selectedBrand === "all phones" ||
                brand.includes(selectedBrand);

            product.style.display = matches ? "block" : "none";

        });

    });

});


// ==========================================
// CART PAGE
// ==========================================

const cartItemsContainer = document.getElementById("cartItems");

if (cartItemsContainer) {

    const emptyCart = document.getElementById("emptyCart");
    const itemCount = document.getElementById("itemCount");
    const summaryItems = document.getElementById("summaryItems");
    const subtotalElement = document.getElementById("subtotal");
    const totalElement = document.getElementById("total");
    const checkoutButton = document.getElementById("checkoutButton");

    function displayCart() {

        cartItemsContainer.innerHTML = "";

        const totalItems = cartCount();

        if (cart.length === 0) {

            emptyCart.style.display = "block";
            itemCount.textContent = "0 Items";
            summaryItems.textContent = "0";
            subtotalElement.textContent = "₹0";
            totalElement.textContent = "₹0";
            if (checkoutButton) checkoutButton.disabled = true;

            return;
        }

        emptyCart.style.display = "none";
        if (checkoutButton) checkoutButton.disabled = false;

        let total = 0;

        cart.forEach(function(product, index) {

            const lineTotal = priceToNumber(product.price) * product.qty;
            total += lineTotal;

            const productElement = document.createElement("div");

            productElement.className = "cart-product";

            productElement.innerHTML = `

                <div class="cart-product-phone">
                    ${product.brand}
                </div>

                <div class="cart-product-info">

                    <small>
                        ${product.brand}
                    </small>

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ${product.price} × ${product.qty} =
                        ₹${lineTotal.toLocaleString("en-IN")}
                    </p>

                </div>

                <div class="cart-qty">

                    <button
                        class="qty-btn"
                        aria-label="Decrease quantity"
                        onclick="changeQty(${index}, -1)"
                    >−</button>

                    <span>${product.qty}</span>

                    <button
                        class="qty-btn"
                        aria-label="Increase quantity"
                        onclick="changeQty(${index}, 1)"
                    >+</button>

                </div>

                <button
                    class="remove-btn"
                    onclick="removeFromCart(${index})"
                >
                    Remove
                </button>

            `;

            cartItemsContainer.appendChild(productElement);

        });

        itemCount.textContent = totalItems + (totalItems === 1 ? " Item" : " Items");
        summaryItems.textContent = totalItems;

        const formattedTotal = "₹" + total.toLocaleString("en-IN");

        subtotalElement.textContent = formattedTotal;
        totalElement.textContent = formattedTotal;

    }

    displayCart();

    if (checkoutButton) {

        checkoutButton.addEventListener("click", function() {

            if (cart.length === 0) return;

            let message = "Hi Tanush Mobile Shop, I'd like to order:%0A";

            let total = 0;

            cart.forEach(function(item) {
                const lineTotal = priceToNumber(item.price) * item.qty;
                total += lineTotal;
                message += `%0A• ${item.name} (${item.brand}) x${item.qty} - ${item.price} each`;
            });

            message += `%0A%0ATotal: ₹${total.toLocaleString("en-IN")}`;

            window.open(
                `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
                "_blank"
            );

        });

    }

}


// ==========================================
// QUANTITY + REMOVE (cart page)
// ==========================================

function changeQty(index, delta) {

    if (!cart[index]) return;

    cart[index].qty += delta;

    if (cart[index].qty < 1) {
        cart.splice(index, 1);
    }

    saveCart();
    location.reload();

}

function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();
    updateCartCount();

    location.reload();

}


// ==========================================
// CONTACT FORM
// ==========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    const formSuccess = document.getElementById("formSuccess");

    contactForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const subjectSelect = document.getElementById("subject");
        const subject = subjectSelect.options[subjectSelect.selectedIndex].text;
        const messageText = document.getElementById("message").value.trim();

        if (!name || !phone || !messageText) {
            contactForm.reportValidity();
            return;
        }

        let waMessage =
            `Hi Tanush Mobile Shop, my name is ${name}.%0A` +
            `Phone: ${phone}%0A`;

        if (email) waMessage += `Email: ${email}%0A`;
        if (subject && subject !== "Select an option") {
            waMessage += `Regarding: ${subject}%0A`;
        }

        waMessage += `%0AMessage: ${messageText}`;

        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`,
            "_blank"
        );

        if (formSuccess) formSuccess.classList.add("show");

        contactForm.reset();

        setTimeout(function() {
            if (formSuccess) formSuccess.classList.remove("show");
        }, 6000);

    });

}


// ==========================================
// INITIALIZE
// ==========================================

updateCartCount();
