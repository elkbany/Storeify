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
            showNotification('Failed to load products. Please try again.', 'error');
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    await fetchProducts();
    loadCartItems();
    loadSavedCoupon();
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

// Load cart items from localStorage or editOrder
async function loadCartItems() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.email) {
            showNotification('Please log in to view your cart!', 'error');
            setTimeout(() => {
                window.location.href = 'Login.html';
            }, 1000);
            return;
        }

        let cart = [];
        const editOrder = JSON.parse(sessionStorage.getItem('editOrder'));

        if (editOrder && editOrder.cart) {
            // If editing an order, use the cart from editOrder
            cart = editOrder.cart.map(item => ({
                id: item.id,
                quantity: item.quantity,
                title: item.title,
                price: item.price,
                image: item.image,
                category: item.category || ''
            }));
            // Populate form with saved address
            if (editOrder.shippingAddress) {
                document.getElementById('firstName').value = editOrder.shippingAddress.firstName || '';
                document.getElementById('companyName').value = editOrder.shippingAddress.companyName || '';
                document.getElementById('streetAddress').value = editOrder.shippingAddress.streetAddress || '';
                document.getElementById('apartment').value = editOrder.shippingAddress.apartment || '';
                document.getElementById('townCity').value = editOrder.shippingAddress.townCity || '';
                document.getElementById('phone').value = editOrder.phone || '';
                document.getElementById('email').value = editOrder.email || '';
            }
            // Restore coupon if it was applied
            if (editOrder.appliedCoupon && validCoupons[editOrder.appliedCoupon]) {
                discount = editOrder.discountAmount || 0;
                document.getElementById('couponCode').value = editOrder.appliedCoupon;
                showNotification(`Coupon restored: ${editOrder.appliedCoupon} (${discount * 100}% off)`, 'success');
            }
        } else {
            // Otherwise, load from cart in localStorage
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
        }

        displayCartItems(cart);
        updateTotals(cart);
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
        totalElement.textContent = `$${discountedTotal.toFixed(2)}`;
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

// Save or update order to localStorage
function saveOrder(orderData) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.email) {
            const ordersKey = `orders_${currentUser.email}`;
            const existingOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];
            const editOrder = JSON.parse(sessionStorage.getItem('editOrder'));

            let orderId;
            let orderIndex = -1;

            if (editOrder) {
                orderId = editOrder.orderId;
                orderIndex = existingOrders.findIndex(order => order.orderId === orderId);
            }

            const newOrder = {
                ...orderData,
                orderId: orderId || `ORD-${Date.now()}`,
                orderDate: new Date().toISOString(),
                status: 'Pending'
            };

            if (orderIndex !== -1) {
                // Update existing order
                existingOrders[orderIndex] = newOrder;
            } else {
                // Add new order
                existingOrders.push(newOrder);
            }

            localStorage.setItem(ordersKey, JSON.stringify(existingOrders));
            return newOrder.orderId;
        }
    } catch (error) {
        console.error('Error saving order:', error);
        throw error;
    }
}

// Load saved form data for the current user
function loadSavedFormData() {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.email) return;

        const formData = {};
        let useUserData = false;

        // Check current user's profile data
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === currentUser.email);

        if (user) {
            const hasEditedProfile = (
                (user.name && user.name.trim() && user.name.trim() !== user.email) ||
                (user.phone && user.phone.trim()) ||
                (user.company && user.company.trim())
            );

            if (hasEditedProfile) {
                useUserData = true;
                const nameParts = user.name ? user.name.trim().split(' ') : [];
                formData.firstName = nameParts[0] || '';
                formData.email = user.email || '';
                formData.phone = user.phone || '';
                formData.companyName = user.company || '';
            }
        }

        // Load address data from user-specific checkout data
        const checkoutKey = `checkoutFormData_${currentUser.email}`;
        const savedCheckoutData = localStorage.getItem(checkoutKey);
        if (savedCheckoutData) {
            const checkoutData = JSON.parse(savedCheckoutData);
            formData.streetAddress = checkoutData.streetAddress || '';
            formData.apartment = checkoutData.apartment || '';
            formData.townCity = checkoutData.townCity || '';
            if (!useUserData) {
                formData.firstName = checkoutData.firstName || '';
                formData.companyName = checkoutData.companyName || '';
                formData.phone = checkoutData.phone || '';
                formData.email = checkoutData.email || '';
            }
        }

        // Populate form fields (only if not already populated by editOrder)
        const editOrder = JSON.parse(sessionStorage.getItem('editOrder'));
        if (!editOrder) {
            Object.keys(formData).forEach(field => {
                const input = document.getElementById(field);
                if (input && formData[field]) {
                    input.value = formData[field];
                }
            });
        }
    } catch (error) {
        console.error('Error loading saved form data:', error);
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
            saveCoupon(couponCode);
            try {
                const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
                if (currentUser && currentUser.email) {
                    let cart = [];
                    const editOrder = JSON.parse(sessionStorage.getItem('editOrder'));
                    if (editOrder && editOrder.cart) {
                        cart = editOrder.cart;
                    } else {
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
                    }
                    updateTotals(cart);
                    showNotification(`Coupon applied: ${couponCode} (${discount * 100}% off)`, 'success');
                }
            } catch (error) {
                console.error('Error applying coupon:', error);
                showNotification('Error applying coupon', 'error');
            }
        } else {
            discount = 0;
            saveCoupon(null);
            showNotification('Invalid coupon code!', 'error');
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (currentUser && currentUser.email) {
                let cart = [];
                const editOrder = JSON.parse(sessionStorage.getItem('editOrder'));
                if (editOrder && editOrder.cart) {
                    cart = editOrder.cart;
                } else {
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
                }
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
                showNotification('Please log in to place an order!', 'error');
                setTimeout(() => {
                    window.location.href = 'Login.html';
                }, 1000);
                return;
            }

            let cart = [];
            const editOrder = JSON.parse(sessionStorage.getItem('editOrder'));
            const cartKey = `cart_${currentUser.email}`;
            const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];

            if (editOrder && editOrder.cart) {
                cart = editOrder.cart;
            } else {
                cart = storedCart
                    .filter(item => item && item.id && Number.isInteger(item.quantity) && item.quantity > 0)
                    .map(item => {
                        const product = products.find(p => p.id === item.id);
                        return product ? {
                            id: item.id,
                            quantity: item.quantity,
                            title: product.title,
                            price: product.price,
                            image: product.image
                        } : null;
                    })
                    .filter(item => item !== null);
            }

            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
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
                showNotification('Please fill in all required fields', 'error');
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
                localStorage.setItem(`checkoutFormData_${currentUser.email}`, JSON.stringify({
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

            // Clear the cart, editOrder, and coupon after successful order
            localStorage.setItem(cartKey, '[]');
            sessionStorage.removeItem('editOrder');
            saveCoupon(null);

            // Show success message with order ID
            showNotification(`Order ${editOrder ? 'updated' : 'placed'} successfully! Your order ID is: ${orderId}`, 'success');
            setTimeout(() => {
                window.location.href = 'Home.html';
            }, 2000);
        } catch (error) {
            console.error('Error placing order:', error);
            showNotification('An error occurred while placing your order. Please try again.', 'error');
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