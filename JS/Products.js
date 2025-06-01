let products = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 9;
let cart = [];

// Fetch products from API using AJAX
function fetchProducts() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://fakestoreapi.com/products', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    products = JSON.parse(xhr.responseText);
                    filteredProducts = [...products];
                    loadUserCart();
                    displayProducts();
                    updatePagination();
                    updateCartIcon();
                    updateCartSidebar();
                    updateAuthLink();
                } catch (error) {
                    console.error('Error parsing products:', error);
                    document.getElementById('productsGrid').innerHTML = '<p>Error loading products. Please try again later.</p>';
                }
            } else {
                console.error('Error fetching products:', xhr.status);
                document.getElementById('productsGrid').innerHTML = '<p>Error loading products. Please try again later.</p>';
            }
        }
    };
    xhr.send();
}

// Load user-specific cart from localStorage
function loadUserCart() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const cartKey = `cart_${currentUser.email}`;
            const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
            // Reconstruct cart with product details
            cart = storedCart
                .filter(item => item && item.id && Number.isInteger(item.quantity) && item.quantity > 0)
                .map(item => {
                    const product = products.find(p => p.id === item.id);
                    if (product) {
                        return {
                            id: item.id,
                            quantity: item.quantity,
                            title: product.title,
                            price: product.price,
                            image: product.image,
                            category: product.category
                        };
                    }
                    return null;
                })
                .filter(item => item !== null);
        } else {
            cart = [];
        }
        updateCartSidebar();
        updateCartIcon();
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
            // Save only id and quantity
            const cartToSave = cart.map(item => ({
                id: item.id,
                quantity: item.quantity
            }));
            localStorage.setItem(cartKey, JSON.stringify(cartToSave));
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
    button.disabled = true;
    button.classList.add('loading');
    const originalText = button.textContent;
    button.textContent = 'Adding...';

    setTimeout(() => {
        addToCart(productId, productTitle, productPrice);
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
        showAddToCartFeedback(productTitle);
        openCartSidebar();
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

// Show feedback when item is added to cart
function showAddToCartFeedback(productTitle) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fa-solid fa-check-circle"></i>
        <span>${productTitle} added to cart!</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

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
    if (cartIcon) {
        cartIcon.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}`;
    }
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
                ${cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return `
                        <div class="cart-item">
                            <img src="${product?.image || ''}" alt="${item.title}">
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
                    `;
            }).join('')}
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

// Update authentication link
function updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    if (currentUser && currentUser.email) {
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'Login.html';
        });
        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${currentUser.email.split('@')[0]}`;
            userGreeting.style.display = 'block';
        }
    } else {
        authLink.textContent = 'Sign Up';
        authLink.href = 'Login.html';
        if (userGreeting) {
            userGreeting.style.display = 'none';
        }
    }
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

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    document.getElementById('page-info').textContent = currentPage;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
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

    document.querySelector('.search-bar input')?.addEventListener('input', applyFiltersAndSort);
    document.querySelector('.search-bar button')?.addEventListener('click', (e) => {
        e.preventDefault();
        applyFiltersAndSort();
    });

    document.querySelector('.cart').addEventListener('click', openCartSidebar);
});

function addToWishlist(productId) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (currentUser && currentUser.email) {
        const wishlistKey = `wishlist_${currentUser.email}`;
        let wishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
        if (!wishlist.includes(productId)) {
            wishlist.push(productId);
            localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
            showNotification('Item added to wishlist!', 'success');
        } else {
            showNotification('Item already in wishlist!', 'error');
        }
    } else {
        showNotification('Please log in to add to wishlist!', 'error');
        setTimeout(() => {
            window.location.href = 'Login.html';
        }, 1000);
    }
}

// Placeholder for notification function (to be added in CSS)
function showNotification(message, type) {
    console.log(`${type}: ${message}`); // Placeholder, add actual notification logic with CSS
}