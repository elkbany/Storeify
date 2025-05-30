// Dynamic Header Management
function initializeHeader() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const authLink = document.getElementById('auth-link');
    const userGreeting = document.getElementById('user-greeting');

    if (currentUser) {
        // User is logged in
        if (authLink) {
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = function(e) {
                e.preventDefault();
                handleLogout();
            };
        }

        // Add user greeting if element exists
        if (userGreeting) {
            const userName = currentUser.name || currentUser.email.split('@')[0];
            userGreeting.textContent = `Welcome, ${userName}!`;
            userGreeting.style.display = 'inline-block';
            userGreeting.style.visibility = 'visible';
        }

        // Update cart count for logged-in user
        updateCartCount();
    } else {
        // User is not logged in
        if (authLink) {
            authLink.textContent = 'Sign Up';
            authLink.href = 'Login.html';
            authLink.onclick = null;
        }

        // Hide user greeting if element exists
        if (userGreeting) {
            userGreeting.style.display = 'none';
        }

        // Reset cart count for guest user
        updateCartCount();
    }
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
