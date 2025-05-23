// Sample products data
const products = [
    {
        id: 1,
        name: "LCD Monitor",
        price: 850,
        image: "https://via.placeholder.com/50"
    },
    {
        id: 2,
        name: "HI Gamepad",
        price: 900,
        image: "https://via.placeholder.com/50"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    updateTotals();
    setupEventListeners();
});

// Display products in the order summary
function displayProducts() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-info">
                <img src="${product.image}" alt="${product.name}">
                <span>${product.name}</span>
            </div>
            <span>$${product.price}</span>
        `;
        productList.appendChild(productElement);
    });
}

// Update subtotal and total amounts
function updateTotals() {
    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const subtotalElement = document.getElementById('subtotal-amount');
    const totalElement = document.getElementById('total-amount');

    subtotalElement.textContent = `$${subtotal}`;
    totalElement.textContent = `$${subtotal}`; // Since shipping is free
}

// Set up event listeners
function setupEventListeners() {
    const form = document.getElementById('checkout-form');
    const applyCouponBtn = document.getElementById('applyCoupon');
    const placeOrderBtn = document.getElementById('placeOrder');

    // Handle coupon application
    applyCouponBtn.addEventListener('click', function() {
        const couponCode = document.getElementById('couponCode').value;
        if (couponCode.trim() !== '') {
            alert('Coupon applied successfully!');
            // Add your coupon logic here
        } else {
            alert('Please enter a valid coupon code');
        }
    });

    // Handle form submission
    placeOrderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Basic form validation
        const requiredFields = ['firstName', 'streetAddress', 'townCity', 'phone', 'email'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#dc3545';
            } else {
                input.style.borderColor = '#ddd';
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields');
            return;
        }

        // Get selected payment method
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            companyName: document.getElementById('companyName').value,
            streetAddress: document.getElementById('streetAddress').value,
            apartment: document.getElementById('apartment').value,
            townCity: document.getElementById('townCity').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            saveInfo: document.getElementById('saveInfo').checked,
            paymentMethod: paymentMethod
        };

        // Here you would typically send this data to your server
        console.log('Order placed:', formData);
        alert('Order placed successfully!');
    });

    // Handle input validation on blur
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#ddd';
            }
        });
    });
}

// Save form data to localStorage if checkbox is checked
function saveFormData() {
    if (document.getElementById('saveInfo').checked) {
        const formData = {
            firstName: document.getElementById('firstName').value,
            companyName: document.getElementById('companyName').value,
            streetAddress: document.getElementById('streetAddress').value,
            apartment: document.getElementById('apartment').value,
            townCity: document.getElementById('townCity').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        };
        localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    }
}

// Load saved form data if available
function loadSavedFormData() {
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.value = formData[field];
            }
        });
    }
}


// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    updateTotals();
    setupEventListeners();
    loadSavedFormData();
});

// Load cart items from localStorage
function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    displayCartItems(cart);
}

// Display cart items in the order summary
function displayCartItems(cart) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (cart.length === 0) {
        productList.innerHTML = '<p>No items in cart</p>';
        return;
    }

    cart.forEach(item => {
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-info">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <span>${item.name}</span>
                    <small>Quantity: ${item.quantity}</small>
                </div>
            </div>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        productList.appendChild(productElement);
    });
}

// Update subtotal and total amounts
function updateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const subtotalElement = document.getElementById('subtotal-amount');
    const totalElement = document.getElementById('total-amount');

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${subtotal.toFixed(2)}`; // Since shipping is free
}

// Set up event listeners
function setupEventListeners() {
    const form = document.getElementById('checkout-form');
    const applyCouponBtn = document.getElementById('applyCoupon');
    const placeOrderBtn = document.getElementById('placeOrder');

    // Handle coupon application
    applyCouponBtn.addEventListener('click', function() {
        const couponCode = document.getElementById('couponCode').value;
        if (couponCode.trim() !== '') {
            alert('Coupon applied successfully!');
            // Add your coupon logic here
        } else {
            alert('Please enter a valid coupon code');
        }
    });

    // Handle form submission
    placeOrderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Basic form validation
        const requiredFields = ['firstName', 'streetAddress', 'townCity', 'phone', 'email'];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#dc3545';
            } else {
                input.style.borderColor = '#ddd';
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields');
            return;
        }

        // Get selected payment method
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        // Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            companyName: document.getElementById('companyName').value,
            streetAddress: document.getElementById('streetAddress').value,
            apartment: document.getElementById('apartment').value,
            townCity: document.getElementById('townCity').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            saveInfo: document.getElementById('saveInfo').checked,
            paymentMethod: paymentMethod,
            cart: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        // Here you would typically send this data to your server
        console.log('Order placed:', formData);
        alert('Order placed successfully!');
        
        // Clear cart after successful order
        localStorage.removeItem('cart');
        
        // Redirect to products page
        window.location.href = 'products.html';
    });

    // Handle input validation on blur
    const requiredFields = ['firstName', 'streetAddress', 'townCity', 'phone', 'email'];
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#ddd';
            }
        });
    });
}

// Save form data to localStorage if checkbox is checked
function saveFormData() {
    if (document.getElementById('saveInfo').checked) {
        const formData = {
            firstName: document.getElementById('firstName').value,
            companyName: document.getElementById('companyName').value,
            streetAddress: document.getElementById('streetAddress').value,
            apartment: document.getElementById('apartment').value,
            townCity: document.getElementById('townCity').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        };
        localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    }
}

// Load saved form data if available
function loadSavedFormData() {
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.value = formData[field];
            }
        });
    }
}