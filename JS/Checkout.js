let products = [];
let discount = 0;
const validCoupons = {
    'SAVE10': 0.10,
    'SAVE20': 0.20
};

// Fetch products from API
async function fetchProducts() {
    if (products.length === 0) {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            products = await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Failed to load products. Please try again.');
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    await fetchProducts();
    loadCartItems();
    loadSavedCoupon(); // Load any saved coupon
    setupEventListeners();
    loadSavedFormData();
});

// Load saved coupon if exists
function loadSavedCoupon() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const couponKey = `coupon_${currentUser.email}`;
            const savedCoupon = localStorage.getItem(couponKey);
            if (savedCoupon && validCoupons[savedCoupon]) {
                discount = validCoupons[savedCoupon];
                document.getElementById('couponCode').value = savedCoupon;
                showNotification(`Coupon restored: ${savedCoupon} (${discount * 100}% off)`, 'success');
            }
        }
    } catch (error) {
        console.error('Error loading saved coupon:', error);
    }
}

// Save coupon to localStorage
function saveCoupon(couponCode) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const couponKey = `coupon_${currentUser.email}`;
            if (couponCode && validCoupons[couponCode]) {
                localStorage.setItem(couponKey, couponCode);
            } else {
                localStorage.removeItem(couponKey);
            }
        }
    } catch (error) {
        console.error('Error saving coupon:', error);
    }
}

// Load cart items from localStorage
async function loadCartItems() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const cartKey = `cart_${currentUser.email}`;
            const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
            
            // Map stored cart items to full product details
            const cart = storedCart
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

            displayCartItems(cart);
            updateTotals(cart);
        } else {
            window.location.href = 'Login.html';
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        displayCartItems([]);
    }
}

// Display cart items in the order summary
function displayCartItems(cart) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (!cart || cart.length === 0) {
        productList.innerHTML = '<p>No items in cart</p>';
        return;
    }

    cart.forEach(item => {
        if (!item || !item.title || !item.price) return;
        
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-info">
                <img src="${item.image || ''}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover;">
                <div class="product-details">
                    <span class="product-title">${item.title}</span>
                    <small>Quantity: ${item.quantity}</small>
                </div>
            </div>
            <span class="product-price">$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        productList.appendChild(productElement);
    });
}

// Update subtotal and total amounts
function updateTotals(cart) {
    try {
        if (!cart || cart.length === 0) {
            document.getElementById('subtotal-amount').textContent = '$0.00';
            document.getElementById('total-amount').textContent = '$0.00';
            return;
        }

        const subtotal = cart.reduce((sum, item) => {
            if (!item || !item.price || !item.quantity) return sum;
            return sum + (item.price * item.quantity);
        }, 0);

        const discountedTotal = subtotal - (subtotal * discount);

        const subtotalElement = document.getElementById('subtotal-amount');
        const totalElement = document.getElementById('total-amount');

        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        totalElement.textContent = `$${discountedTotal.toFixed(2)}`; // Apply discount to total
    } catch (error) {
        console.error('Error updating totals:', error);
        document.getElementById('subtotal-amount').textContent = '$0.00';
        document.getElementById('total-amount').textContent = '$0.00';
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

// Save order to localStorage
function saveOrder(orderData) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const ordersKey = `orders_${currentUser.email}`;
            const existingOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];
            
            // Add order date and unique ID
            const newOrder = {
                ...orderData,
                orderId: `ORD-${Date.now()}`,
                orderDate: new Date().toISOString(),
                status: 'Pending'
            };

            existingOrders.push(newOrder);
            localStorage.setItem(ordersKey, JSON.stringify(existingOrders));
            return newOrder.orderId;
        }
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}

// Set up event listeners
function setupEventListeners() {
    const applyCouponBtn = document.getElementById('applyCoupon');
    const placeOrderBtn = document.getElementById('placeOrder');

    // Handle coupon application
    applyCouponBtn.addEventListener('click', async function() {
        const couponCode = document.getElementById('couponCode').value.trim().toUpperCase();

        if (validCoupons[couponCode]) {
            discount = validCoupons[couponCode];
            saveCoupon(couponCode); // Save the valid coupon
            try {
                const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
                if (currentUser && currentUser.email) {
                    const cartKey = `cart_${currentUser.email}`;
                    const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
                    const cart = storedCart
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

                    updateTotals(cart);
                    showNotification(`Coupon applied: ${couponCode} (${discount * 100}% off)`, 'success');
                }
            } catch (error) {
                console.error('Error applying coupon:', error);
                showNotification('Error applying coupon', 'error');
            }
        } else {
            discount = 0;
            saveCoupon(null); // Remove any saved coupon
            showNotification('Invalid coupon code!', 'error');
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (currentUser && currentUser.email) {
                const cartKey = `cart_${currentUser.email}`;
                const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
                const cart = storedCart
                    .map(item => {
                        const product = products.find(p => p.id === item.id);
                        return product ? { ...item, ...product } : null;
                    })
                    .filter(item => item !== null);
                updateTotals(cart);
            }
        }
    });

    // Handle form submission
    placeOrderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        try {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.email) {
                alert('Please log in to place an order!');
                window.location.href = 'Login.html';
                return;
            }

            const cartKey = `cart_${currentUser.email}`;
            const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
            if (storedCart.length === 0) {
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
                cart: storedCart.map(item => {
                    const product = products.find(p => p.id === item.id);
                    return {
                        ...item,
                        title: product.title,
                        price: product.price,
                        image: product.image
                    };
                }),
                subtotal: document.getElementById('subtotal-amount').textContent,
                total: document.getElementById('total-amount').textContent,
                appliedCoupon: discount > 0 ? document.getElementById('couponCode').value : null,
                discountAmount: discount,
                shippingAddress: {
                    firstName: document.getElementById('firstName').value,
                    companyName: document.getElementById('companyName').value,
                    streetAddress: document.getElementById('streetAddress').value,
                    apartment: document.getElementById('apartment').value,
                    townCity: document.getElementById('townCity').value
                }
            };

            // Save form data if checkbox is checked
            if (formData.saveInfo) {
                localStorage.setItem('checkoutFormData', JSON.stringify({
                    firstName: formData.firstName,
                    companyName: formData.companyName,
                    streetAddress: formData.streetAddress,
                    apartment: formData.apartment,
                    townCity: formData.townCity,
                    phone: formData.phone,
                    email: formData.email
                }));
            }

            // Save the order and get the order ID
            const orderId = saveOrder(formData);

            // Clear the cart and coupon after successful order
            localStorage.setItem(cartKey, '[]');
            saveCoupon(null);
            
            // Show success message with order ID
            alert(`Order placed successfully!\nYour order ID is: ${orderId}\nYou can track your order in your account.`);
            
            // Redirect to home page
            window.location.href = 'Home.html';
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred while placing your order. Please try again.');
        }
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