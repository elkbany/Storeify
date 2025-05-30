let cart = [];
let discount = 0;
const validCoupons = {
    'SAVE10': 0.10,
    'SAVE20': 0.20
};

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
        updateCartDisplay();
        updateCartIcon();
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
        updateCartDisplay();
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

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="products.html" class="return-btn">Continue Shopping</a>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="product">
                    <img src="${item.image}" alt="${item.title}">
                    <p>${item.title}</p>
                </div>
                <div class="price">$${item.price.toFixed(2)}</div>
                <div class="quantity">
                    <div class="quantity-control">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="subtotal">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="action">
                    <span class="delete-btn" onclick="deleteItem(${item.id})"><i class="fa-solid fa-trash"></i></span>
                </div>
            </div>
        `).join('');
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountedTotal = subtotal - (subtotal * discount);
    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${discountedTotal.toFixed(2)}`;
}

// Update cart icon
function updateCartIcon() {
    const cartIcon = document.querySelector('.cart');
    if (cartIcon) {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartIcon.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}`;
    }
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
            showNotification(`${item.title} removed from cart!`, 'success');
        } else {
            showNotification(`${item.title} quantity updated!`, 'success');
        }
        saveUserCart();
        updateCartDisplay();
        updateCartIcon();
    }
}

// Delete item
function deleteItem(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        cart = cart.filter(item => item.id !== productId);
        showNotification(`${item.title} removed from cart!`, 'success');
        saveUserCart();
        updateCartDisplay();
        updateCartIcon();
    }
}

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

// Handle coupon application
function setupCouponButton() {
    const applyBtn = document.querySelector('.coupon button');
    const input = document.querySelector('.coupon input');

    applyBtn.addEventListener('click', () => {
        const code = input.value.trim().toUpperCase();
        if (validCoupons[code]) {
            discount = validCoupons[code];
            showNotification(`Coupon applied: ${code} (${discount * 100}% off)`, 'success');
        } else {
            discount = 0;
            showNotification('Invalid coupon code!', 'error');
        }
        updateCartDisplay();
    });
}

// Handle checkout
function setupCheckoutButton() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            showNotification('Please log in to proceed to checkout!', 'error');
            setTimeout(() => {
                window.location.href = 'Login.html';
            }, 1000);
            return;
        }
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        window.location.href = 'Checkout.html';
    });
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
    loadUserCart();
    setupCouponButton();
    setupCheckoutButton();
    updateAuthLink();
});