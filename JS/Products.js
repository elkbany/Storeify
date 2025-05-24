// Variables for pagination, filtering, sorting, and cart
let products = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 9;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        filteredProducts = [...products];
        displayProducts();
        updatePagination();
        updateCartIcon();
        updateCartSidebar(); // Add this to update the sidebar on load
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    document.getElementById('viewed-items').textContent = Math.min(end, filteredProducts.length);
    document.getElementById('total-items').textContent = filteredProducts.length;

    paginatedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <a href="../HTML/OneProduct.html?id=${product.id}" class="product-title">${product.title}</a>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id}, '${product.title}', ${product.price})">Add to Cart</button>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Add to cart function
function addToCart(productId, productTitle, productPrice) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: productId, title: productTitle, price: productPrice, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSidebar();
    updateCartIcon();
    openCartSidebar();
}

// Update cart icon with item count
function updateCartIcon() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartIcon = document.querySelector('.cart');
    cartIcon.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}`;
}

// Update cart sidebar
function updateCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        if (cart.length === 0) {
            cartSidebar.innerHTML = `
                <div class="cart-header">
                    <h3>Cart</h3>
                    <span class="close-cart" onclick="closeCartSidebar()">×</span>
                </div>
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <button onclick="closeCartSidebar()">Continue Shopping</button>
                </div>
            `;
        } else {
            cartSidebar.innerHTML = `
                <div class="cart-header">
                    <h3>Cart</h3>
                    <span class="close-cart" onclick="closeCartSidebar()">×</span>
                </div>
                <div class="free-shipping">
                    <p><strong>FREE SHIPPING ON ORDERS $100.00</strong></p>
                    <p>Spend $100.00 more and get free shipping!</p>
                    <div class="progress-bar"><div style="width: ${Math.min((cart.reduce((sum, item) => sum + item.price * item.quantity, 0) / 100) * 100, 100)}%;"></div></div>
                </div>
                ${cart.map(item => `
                    <div class="cart-item">
                        <img src="${products.find(p => p.id === item.id)?.image || ''}" alt="${item.title}">
                        <div class="item-details">
                            <p>${item.title}</p>
                            <p>$${item.price.toFixed(2)}</p>
                            <div class="quantity-control">
                                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="updateQuantity(${item.id}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="cart-total">
                    <p>Subtotal: $${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</p>
                    <p>Taxes and shipping calculated at checkout</p>
                    <p>our cart is currently displayed in, the checkout will use USD at the most</p>
                </div>
                <div class="cart-actions">
                    <button onclick="checkout()">Check Out</button>
                    <button onclick="closeCartSidebar()">View Cart</button>
                </div>
            `;
        }
    }
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartSidebar();
        updateCartIcon();
    }
}

// Open cart sidebar
function openCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        updateCartSidebar(); // Ensure content is updated before opening
        cartSidebar.style.right = '0';
    }
}

// Close cart sidebar
function closeCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.style.right = '-700px';
    }
}

// Placeholder checkout function
function checkout() {
    alert('Checkout functionality to be implemented!');
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    document.getElementById('page-info').textContent = currentPage;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Filter and sort products
function applyFiltersAndSort() {
    let tempProducts = [...products];

    const category = document.getElementById('category-filter').value;
    if (category) {
        tempProducts = tempProducts.filter(product => product.category === category);
    }

    const maxPrice = parseFloat(document.getElementById('price-range').value);
    tempProducts = tempProducts.filter(product => product.price <= maxPrice);

    const sortBy = document.getElementById('sort-by').value;
    if (sortBy === 'title-asc') {
        tempProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
        tempProducts.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'price-asc') {
        tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        tempProducts.sort((a, b) => b.price - a.price);
    }

    filteredProducts = tempProducts;
    currentPage = 1;
    displayProducts();
    updatePagination();
}

// Event listeners
window.onload = function() {
    fetchProducts();

    document.getElementById('category-filter').addEventListener('change', applyFiltersAndSort);

    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    priceRange.addEventListener('input', () => {
        priceValue.textContent = priceRange.value;
        applyFiltersAndSort();
    });

    document.getElementById('sort-by').addEventListener('change', applyFiltersAndSort);

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
            updatePagination();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts();
            updatePagination();
        }
    });

    // Add event listener to cart icon
    document.querySelector('.cart').addEventListener('click', openCartSidebar);
};