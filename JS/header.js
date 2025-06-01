// Dynamic Header Management
function initializeHeader() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const userGreeting = document.getElementById('user-greeting');
    const profileArea = document.getElementById('profile-area');

    // Remove any previous content
    profileArea.innerHTML = '';

    if (currentUser) {
        // User is logged in: show dropdown
        profileArea.innerHTML = `
            <div class="profile-dropdown">
                <span class="profile"><i class="fa-solid fa-circle-user"></i></span>
                <div class="dropdown-content">
                    <a href="User.html"><i class="fas fa-user"></i> Profile</a>
                    <a href="OrderHistory.html"><i class="fas fa-box"></i> Orders</a>
                    <a href="Wishlist.html"><i class="fas fa-heart"></i> Wishlist</a>
                    <a href="#"><i class="fas fa-cog"></i> Settings</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
        if (userGreeting) {
            const userName = currentUser.name || currentUser.email.split('@')[0];
            userGreeting.textContent = `Welcome, ${userName}!`;
            userGreeting.style.display = 'inline-block';
            userGreeting.style.visibility = 'visible';
        }
        updateCartCount();
    } else {
        // Not logged in: show Sign Up button
        profileArea.innerHTML = `
            <a href="Login.html" id="signup-btn" class="btn btn-primary" style="    
            margin-top: 20px;
            text-decoration: none;
            padding: 10px 20px;
            background-color: #d32f2f;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
">Sign Up</a>
        `;
        if (userGreeting) userGreeting.style.display = 'none';
        updateCartCount();
    }

    // Attach logout event if present
    setTimeout(() => {
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                sessionStorage.removeItem('currentUser');
                window.location.href = 'Login.html';
            });
        }
    }, 0);
}

function handleLogout() {
    sessionStorage.removeItem('currentUser');
    alert('Logged out successfully!');
    window.location.href = 'Login.html';
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const cartKey = currentUser ? `cart_${currentUser.email}` : 'cart';
        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    }
}

// Function to refresh cart count (can be called from other scripts)
window.refreshCartCount = function() {
    updateCartCount();
};

// Initialize header immediately since script is loaded at bottom of page
initializeHeader();

// Re-initialize header when user state changes (for single page apps)
window.addEventListener('storage', function(e) {
    if (e.key === 'currentUser') {
        initializeHeader();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear user session
            sessionStorage.removeItem('currentUser');
            // Redirect to login page
            window.location.href = 'Login.html';
        });
    }
});
let allProducts = [];

async function fetchAllProducts() {
    if (allProducts.length) return allProducts;
    const res = await fetch('https://fakestoreapi.com/products');
    allProducts = await res.json();
    return allProducts;
}

const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('search-suggestions');

searchInput.addEventListener('input', async function() {
    const query = this.value.trim().toLowerCase();
    if (!query) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
        return;
    }
    const products = await fetchAllProducts();
    const matches = products.filter(p => p.title.toLowerCase().includes(query)).slice(0, 6);
    if (matches.length === 0) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
        return;
    }
    suggestionsBox.innerHTML = matches.map(p => `
        <div class="suggestion-item" data-id="${p.id}">
            <img src="${p.image}" alt="${p.title}">
            <span class="product-name">${p.title}</span>
        </div>
    `).join('');
    suggestionsBox.style.display = 'block';
});

// Handle click on suggestion
suggestionsBox.addEventListener('click', function(e) {
    let item = e.target.closest('.suggestion-item');
    if (item) {
        const id = item.getAttribute('data-id');
        window.location.href = `OneProduct.html?id=${id}`;
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = 'none';
    }
});
