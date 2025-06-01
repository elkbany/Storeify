let wishlist = [];
let products = [];

async function fetchProducts() {
    if (products.length === 0) {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            products = await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('Failed to load products. Please try again.', 'error');
        }
    }
}

async function loadUserWishlist() {
    await fetchProducts();
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const wishlistKey = `wishlist_${currentUser.email}`;
            const storedWishlist = JSON.parse(localStorage.getItem(wishlistKey)) || [];
            wishlist = storedWishlist
                .filter(id => products.some(p => p.id === id))
                .map(id => ({ id }));
        } else {
            wishlist = [];
        }
        updateWishlistDisplay();
    } catch (error) {
        console.error('Error loading wishlist:', error);
        wishlist = [];
        updateWishlistDisplay();
    }
}

function saveUserWishlist() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const wishlistKey = `wishlist_${currentUser.email}`;
            const wishlistToSave = wishlist.map(item => item.id);
            localStorage.setItem(wishlistKey, JSON.stringify(wishlistToSave));
        }
    } catch (error) {
        console.error('Error saving wishlist:', error);
    }
}

function updateWishlistDisplay() {
    const wishlistItemsContainer = document.getElementById('wishlist-items');
    if (!wishlistItemsContainer) return;

    if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = `
            <div class="empty-wishlist">
                <p>Your wishlist is empty</p>
            </div>
        `;
    } else {
        wishlistItemsContainer.innerHTML = wishlist.map(item => {
            const product = products.find(p => p.id === item.id);
            return product ? `
                <div class="wishlist-item">
                    <div class="product">
                        <img src="${product.image || ''}" alt="${product.title}">
                        <p>${product.title}</p>
                    </div>
                    <div class="price">$${product.price.toFixed(2)}</div>
                    <div class="action">
                        <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                        <button class="remove-btn" onclick="removeFromWishlist(${product.id})">Remove</button>
                    </div>
                </div>
            ` : '';
        }).join('');
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const cartKey = `cart_${currentUser.email}`;
            let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 0) + 1;
            } else {
                cart.push({ id: productId, quantity: 1 });
            }
            localStorage.setItem(cartKey, JSON.stringify(cart));
            showNotification(`${product.title} added to cart!`, 'success');
            updateCartIcon();
        } else {
            showNotification('Please log in to add to cart!', 'error');
            setTimeout(() => {
                window.location.href = 'Login.html';
            }, 1000);
        }
    }
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    saveUserWishlist();
    updateWishlistDisplay();
    showNotification('Item removed from wishlist!', 'success');
}

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

function updateCartIcon() {
    const cartIcon = document.querySelector('.cart');
    if (cartIcon) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const cartKey = `cart_${currentUser.email}`;
            const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartIcon.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}`;
        }
    }
}

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
        userGreeting.textContent = `Welcome, ${currentUser.email.split('@')[0]}`;
        userGreeting.style.display = 'block';
    } else {
        authLink.textContent = 'Sign Up';
        authLink.href = 'Login.html';
        userGreeting.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserWishlist();
    updateAuthLink();
});