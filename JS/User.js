// Cart variables
let cart = [];

// Initialize the profile and cart
function initializeApp() {
    initializeProfile();
    setupCartFunctionality();
    setupImageUpload();
}

// Profile initialization
function initializeProfile() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const profileName = document.getElementById('profile-name');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const companyInput = document.getElementById('company');
    const jobTitleInput = document.getElementById('job-title');
    const bioInput = document.getElementById('bio');
    const profilePhoto = document.getElementById('profilePhoto');

    if (currentUser) {
        const nameParts = currentUser.name ? currentUser.name.split(' ') : ['User', ''];
        profileName.textContent = currentUser.name || currentUser.email;
        firstNameInput.value = nameParts[0] || '';
        lastNameInput.value = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        emailInput.value = currentUser.email || '';
        phoneInput.value = currentUser.phone || '';
        companyInput.value = currentUser.company || '';
        jobTitleInput.value = currentUser.jobTitle || '';
        bioInput.value = currentUser.bio || '';

        // Load profile photo if available
        if (currentUser.photo) {
            profilePhoto.src = currentUser.photo;
        }
    } else {
        // Redirect to login if not logged in
        window.location.href = 'Login.html';
    }
}

// Update profile information
function updateProfile() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please log in to update your profile!');
        window.location.href = 'Login.html';
        return;
    }

    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const company = document.getElementById('company').value;
    const jobTitle = document.getElementById('job-title').value;
    const bio = document.getElementById('bio').value;

    // Get the profile photo
    const profilePhoto = document.getElementById('profilePhoto').src;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === currentUser.email);

    if (userIndex !== -1) {
        const updatedUser = {
            ...users[userIndex],
            name: `${firstName} ${lastName}`,
            email,
            phone,
            company,
            jobTitle,
            bio,
            photo: profilePhoto
        };

        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));

        document.getElementById('profile-name').textContent = `${firstName} ${lastName}`;
        alert('Profile updated successfully!');
    }
}

// Cancel edits and reload profile
function cancelEdit() {
    initializeProfile();
}

// Set up image upload functionality
function setupImageUpload() {
    const imageInput = document.getElementById('profile-image-input');
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgData = e.target.result;
                document.getElementById('profilePhoto').src = imgData;

                // Save the image data to the user profile
                const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
                if (currentUser) {
                    currentUser.photo = imgData;
                    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

                    // Also update in localStorage users array
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    const userIndex = users.findIndex(u => u.email === currentUser.email);
                    if (userIndex !== -1) {
                        users[userIndex].photo = imgData;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Cart functionality
function setupCartFunctionality() {
    const cartIcon = document.querySelector('.cart');
    const closeCart = document.querySelector('.close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');

    // Get user-specific cart
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const cartKey = currentUser ? `cart_${currentUser.email}` : 'cart';
    cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    // Update cart count
    updateCartCount();

    // Open cart when cart icon is clicked
    cartIcon.addEventListener('click', function() {
        cartSidebar.style.right = '0';
        displayCartItems();
    });

    // Close cart when X is clicked
    closeCart.addEventListener('click', function() {
        cartSidebar.style.right = '-700px';
    });
}

// Update cart count in the header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const cartKey = currentUser ? `cart_${currentUser.email}` : 'cart';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Display cart items in the sidebar
function displayCartItems() {
    const cartItems = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('cart-subtotal');
    const shippingProgress = document.getElementById('shipping-progress');
    const freeShippingRemaining = document.getElementById('free-shipping-remaining');

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const cartKey = currentUser ? `cart_${currentUser.email}` : 'cart';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
        subtotalElement.textContent = '$0.00';
        shippingProgress.style.width = '0%';
        freeShippingRemaining.textContent = '$50.00';
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;

        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <p>${item.name}</p>
                <p>$${item.price.toFixed(2)}</p>
            </div>
            <div class="quantity-control">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        `;

        cartItems.appendChild(cartItemElement);
    });

    // Update subtotal
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;

    // Update shipping progress
    const progressPercentage = Math.min((subtotal / 50) * 100, 100);
    shippingProgress.style.width = `${progressPercentage}%`;

    // Update remaining amount for free shipping
    const remaining = Math.max(50 - subtotal, 0);
    freeShippingRemaining.textContent = `$${remaining.toFixed(2)}`;
}

// Update item quantity in cart
function updateQuantity(itemId, change) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const cartKey = currentUser ? `cart_${currentUser.email}` : 'cart';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        updateCartCount();
        displayCartItems();
    }
}

// Add event listener for logout
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

// Initialize the application when the window loads
window.onload = initializeApp;