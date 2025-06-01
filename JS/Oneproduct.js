let products = [];
let cart = [];
let quantity = 1;
let selectedColor = '#fff';
let selectedSize = 'M';
let currentProduct = null;

// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get('id'));

const productContainer = document.getElementById('productContainer');
const relatedProductsGrid = document.getElementById('relatedProductsGrid');

if (!productId) {
    productContainer.innerHTML = '<p>Product not found.</p>';
} else {
    loadProduct();
}

// Fetch all products
async function fetchProducts() {
    if (products.length === 0) {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            products = await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('Failed to load products.', 'error');
        }
    }
}

// Load user-specific cart
async function loadUserCart() {
    await fetchProducts();
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const cartKey = `cart_${currentUser.email}`;
            const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
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
        updateCartIcon();
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
        updateCartIcon();
    }
}

// Save user-specific cart
function saveUserCart() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const cartKey = `cart_${currentUser.email}`;
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

// Load product details
async function loadProduct() {
    try {
        const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
        currentProduct = await response.json();
        await fetchProducts();
        await loadUserCart();

        const colors = ['#fff', '#d32f2f', '#7c4dff'];
        const sizes = ['XS', 'S', 'M', 'L', 'XL'];
        productContainer.innerHTML = `
            <div class="product-image">
                <img id="mainProductImage" src="${currentProduct.image}" alt="${currentProduct.title}">
                <div class="thumbnail-gallery">
                    <img src="${currentProduct.image}" alt="Thumbnail" onclick="changeImage('${currentProduct.image}')">
                </div>
            </div>
            <div class="product-details">
                <div class="product-title">${currentProduct.title}</div>
                <div class="product-price">$${currentProduct.price.toFixed(2)}</div>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.round(currentProduct.rating.rate))}</span>
                    <span class="stars">${'☆'.repeat(5 - Math.round(currentProduct.rating.rate))}</span>
                    <span class="reviews">(${currentProduct.rating.count} Reviews)</span>
                </div>
                <div class="product-description">${currentProduct.description}</div>
                <div class="options">
                    <div>
                        <label>Colours:</label>
                        <div class="color-options">
                            ${colors.map((color, i) => `
                                <div class="color-circle${i === 0 ? ' selected' : ''}" style="background-color: ${color};" onclick="selectColor('${color}')"></div>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <label>Size:</label>
                        <div class="size-options">
                            <select onchange="selectSize(this.value)">
                                ${sizes.map(size => `
                                    <option value="${size}"${size === 'M' ? ' selected' : ''}>${size}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="quantity-control">
                    <button onclick="updateQuantity(-1)">-</button>
                    <span id="quantity">${quantity}</span>
                    <button onclick="updateQuantity(1)">+</button>
                </div>
                <div class="action-buttons">
                    <button class="add-to-cart-btn" onclick="addToCart(${currentProduct.id}, \`${currentProduct.title.replace(/`/g, '\\`')}\`, ${currentProduct.price})">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="buy-now-btn" onclick="buyNow()">Buy Now</button>
                    <button class="wishlist-btn" onclick="addToWishlist(${currentProduct.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="delivery-info">
                    <div>
                        <i class="fas fa-truck"></i>
                        <p>Free Delivery <a href="#">Enter your postal code for Delivery Availability</a></p>
                    </div>
                    <div>
                        <i class="fas fa-undo"></i>
                        <p>Return Delivery Free 30 Days Delivery Returns. <a href="#">Details</a></p>
                    </div>
                </div>
            </div>`;
        fetchRelatedProducts(currentProduct.category, currentProduct.id);
    } catch (e) {
        productContainer.innerHTML = '<p>Product not found.</p>';
    }
}

// Change main image
window.changeImage = function(imageSrc) {
    document.getElementById('mainProductImage').src = imageSrc;
};

// Select color
window.selectColor = function(color) {
    selectedColor = color;
    const circles = document.querySelectorAll('.color-circle');
    circles.forEach(circle => {
        circle.classList.remove('selected');
        if (circle.style.backgroundColor.replace(/ /g, '') === color.replace(/ /g, '')) {
            circle.classList.add('selected');
        }
    });
};

// Select size
window.selectSize = function(size) {
    selectedSize = size;
};

// Update quantity
window.updateQuantity = function(change) {
    quantity = Math.max(1, quantity + change);
    document.getElementById('quantity').textContent = quantity;
};

// Add to cart
window.addToCart = async function(id, title, price) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            showNotification('Please log in to add items to your cart!', 'error');
            setTimeout(() => {
                window.location.href = 'Login.html';
            }, 1000);
            return;
        }

        const product = products.find(p => p.id === id);
        if (!product) {
            showNotification('Product not found!', 'error');
            return;
        }

        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += quantity;
        } else {
            cart.push({
                id: id,
                quantity: quantity,
                title: product.title,
                price: product.price,
                image: product.image,
                category: product.category
            });
        }

        saveUserCart();
        updateCartIcon();
        showNotification(`${title} added to cart!`, 'success');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add item to cart. Please try again.', 'error');
    }
};

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `
        <i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
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

// Buy now
window.buyNow = function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Please log in to proceed to checkout!', 'error');
        setTimeout(() => {
            window.location.href = 'Login.html';
        }, 1000);
        return;
    }
    window.location.href = 'Checkout.html';
};

// // Add to wishlist
// window.addToWishlist = function(id) {
//     const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
//     if (!wishlist.includes(id)) {
//         wishlist.push(id);
//         localStorage.setItem('wishlist', JSON.stringify(wishlist));
//         showNotification('Added to wishlist!', 'success');
//     } else {
//         showNotification('Already in wishlist!', 'warning');
//     }
// };
//
// Fetch related products
async function fetchRelatedProducts(category, currentId) {
    try {
        const response = await fetch(`https://fakestoreapi.com/products/category/${encodeURIComponent(category)}?limit=4`);
        const relatedProducts = await response.json();
        relatedProductsGrid.innerHTML = '';
        const filteredProducts = relatedProducts.filter(product => product.id !== currentId);
        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'related-product-card';
            card.innerHTML = `
                <a href="OneProduct.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.title}">
                    <div class="product-title">${product.title}</div>
                </a>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="rating">★ ${product.rating.rate.toFixed(1)} (${product.rating.count})</div>
                <button class="wishlist-btn" onclick="addToWishlist(${product.id});event.stopPropagation();">
                    <i class="fas fa-heart"></i>
                </button>`;
            relatedProductsGrid.appendChild(card);
        });
    } catch (error) {
        relatedProductsGrid.innerHTML = '<p>Error loading related products.</p>';
    }
};

// Update cart icon
function updateCartIcon() {
    const cartIcon = document.querySelector('.cart');
    if (cartIcon) {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartIcon.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}`;
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
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = 'Login.html';
        });
        userGreeting.textContent = `Welcome, ${currentUser.email.split('@')[0]}`;
        userGreeting.style.display = 'block';
    } else {
        authLink.textContent = 'Sign Up';
        authLink.href = 'Login.html';
        userGreeting.style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateAuthLink();
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