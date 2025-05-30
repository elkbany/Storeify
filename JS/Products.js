let products = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 9;
let cart = [];

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        filteredProducts = [...products];
        loadUserCart();
        displayProducts();
        updatePagination();
        updateCartIcon();
        updateCartSidebar();
        updateCartSidebar();
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Load user-specific cart from localStorage
function loadUserCart() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const cartKey = `cart_${currentUser.email}`;
            cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        } else {
            cart = [];
        }

        // Validate cart items
        cart = cart.filter(item => item && item.id && item.title && item.price);

    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
}

// Save user-specific cart to localStorage
function saveUserCart() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const cartKey = `cart_${currentUser.email}`;
            localStorage.setItem(cartKey, JSON.stringify(cart));
        }
    } catch (error) {
        console.error('Error saving cart:', error);
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

        // Create elements separately to avoid string escaping issues
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.title;

        const titleLink = document.createElement('a');
        titleLink.href = `../HTML/OneProduct.html?id=${product.id}`;
        titleLink.className = 'product-title';
        titleLink.textContent = product.title;

        const price = document.createElement('p');
        price.className = 'price';
        price.textContent = `$${product.price.toFixed(2)}`;

        const addButton = document.createElement('button');
        addButton.className = 'add-to-cart-btn';
        addButton.textContent = 'Add to Cart';
        addButton.onclick = (e) => {
            e.preventDefault();
            handleAddToCart(addButton, product.id, product.title, product.price);
        };

        productCard.appendChild(img);
        productCard.appendChild(titleLink);
        productCard.appendChild(price);
        productCard.appendChild(addButton);

        productsGrid.appendChild(productCard);
    });
}

// Handle add to cart with button state management
function handleAddToCart(button, productId, productTitle, productPrice) {
    // Disable button and show loading state
    button.disabled = true;
    button.classList.add('loading');
    const originalText = button.textContent;
    button.textContent = 'Adding...';

    // Add to cart with a small delay to show loading state
    setTimeout(() => {
        addToCart(productId, productTitle, productPrice);

        // Reset button state
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = originalText;
    }, 300);
}

// Add to cart function
function addToCart(productId, productTitle, productPrice) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please log in to add items to your cart!');
            window.location.href = 'Login.html';
            return;
        }

        // Find the full product details
        const fullProduct = products.find(p => p.id === productId);
        if (!fullProduct) {
            alert('Product not found!');
            return;
        }

        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
        } else {
            cart.push({
                id: productId,
                title: productTitle,
                price: productPrice,
                quantity: 1,
                image: fullProduct.image,
                category: fullProduct.category
            });
        }

        saveUserCart();
        updateCartSidebar();
        updateCartIcon();

        // Show success feedback
        showAddToCartFeedback(productTitle);

        // Open cart sidebar to show the added item
        openCartSidebar();

    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

// Show feedback when item is added to cart
function showAddToCartFeedback(productTitle) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fa-solid fa-check-circle"></i>
        <span>${productTitle} added to cart!</span>
    `;

    document.body.appendChild(notification);

    // Add show class for animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
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
                    <p>Your cart is currently displayed in, the checkout will use USD at the most</p>
                </div>
                <div class="cart-actions">
                    <a href="./Cart.html">View Cart</a>
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
        saveUserCart();
        updateCartSidebar();
        updateCartIcon();
    }
}

// Open cart sidebar
function openCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        updateCartSidebar();
        updateCartSidebar();
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
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in to proceed to checkout!');
        window.location.href = 'Login.html';
        return;
    }
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
// Filter and sort products
function applyFiltersAndSort() {
    let tempProducts = [...products];

    const category = document.getElementById('category-filter').value;
    if (category) {
        tempProducts = tempProducts.filter(product => product.category === category);
    }

    const maxPrice = parseFloat(document.getElementById('price-range').value);
    tempProducts = tempProducts.filter(product => product.price <= maxPrice);

    // Get search term from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        tempProducts = tempProducts.filter(product => 
            product.title.toLowerCase().includes(searchLower) || 
            product.category.toLowerCase().includes(searchLower)
        );
    }

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

// Call applyFiltersAndSort on page load to apply URL search
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

    // Add event listener to search input (if needed on Products page)
    document.querySelector('.search-bar input')?.addEventListener('input', applyFiltersAndSort);
    document.querySelector('.search-bar button')?.addEventListener('click', (e) => {
        e.preventDefault();
        applyFiltersAndSort();
    });

    // Apply filters and sort on page load
    applyFiltersAndSort();
};

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

    // Add event listener to search input
    document.querySelector('.search-bar input').addEventListener('input', applyFiltersAndSort);

    // Add event listener to search button
    document.querySelector('.search-bar button').addEventListener('click', (e) => {
        e.preventDefault();
        applyFiltersAndSort();
    });

    document.querySelector('.cart').addEventListener('click', openCartSidebar);
};