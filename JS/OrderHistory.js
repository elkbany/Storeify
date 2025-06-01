document.addEventListener('DOMContentLoaded', function() {
    initializeOrderHistory();
    setupFilters();
    setupCartFunctionality();
});

function initializeOrderHistory() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'Login.html';
        return;
    }

    displayOrders();
}

function displayOrders() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;

    const ordersKey = `orders_${currentUser.email}`;
    let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

    console.log('Current User:', currentUser);
    console.log('Orders from localStorage:', orders);

    const ordersList = document.getElementById('ordersList');
    const noOrders = document.getElementById('noOrders');

    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filteredOrders = orders.filter(order => {
        if (!order || !order.cart || !Array.isArray(order.cart)) {
            console.log('Invalid order format:', order);
            return false;
        }

        const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm) ||
            order.cart.some(item => item.title?.toLowerCase().includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || order.status?.toLowerCase() === statusFilter.toLowerCase();

        let orderDate;
        try {
            orderDate = new Date(order.orderDate);
            if (isNaN(orderDate.getTime())) {
                const [month, day, year] = order.orderDate.split(',')[0].split(' ');
                orderDate = new Date(`${month} ${day} ${year}`);
            }
        } catch (error) {
            console.error('Error parsing date:', error);
            orderDate = new Date();
        }

        const now = new Date();
        const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

        let matchesDate = true;
        if (dateFilter === 'last30') matchesDate = daysDiff <= 30;
        else if (dateFilter === 'last60') matchesDate = daysDiff <= 60;
        else if (dateFilter === 'last90') matchesDate = daysDiff <= 90;

        return matchesSearch && matchesStatus && matchesDate;
    });

    filteredOrders.sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        return dateB - dateA;
    });

    ordersList.innerHTML = '';

    if (filteredOrders.length === 0) {
        ordersList.style.display = 'none';
        noOrders.style.display = 'block';
        return;
    }

    ordersList.style.display = 'block';
    noOrders.style.display = 'none';

    filteredOrders.forEach(order => {
        try {
            const orderCard = createOrderCard(order);
            ordersList.appendChild(orderCard);
        } catch (error) {
            console.error('Error creating order card:', error, order);
        }
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';

    const header = document.createElement('div');
    header.className = 'order-header';
    header.innerHTML = `
        <div class="order-id">${order.orderId || 'N/A'}</div>
        <div class="order-date">${order.orderDate ? formatDate(order.orderDate) : 'N/A'}</div>
        <div class="order-status status-${(order.status || 'pending').toLowerCase()}">${capitalizeFirstLetter(order.status || 'pending')}</div>
    `;

    const details = document.createElement('div');
    details.className = 'order-details';

    const items = document.createElement('div');
    items.className = 'order-items';

    order.cart.forEach(item => {
        if (!item) return;

        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <img src="${item.image || '../assets/images/placeholder.jpg'}" alt="${item.title || 'Product'}" class="item-image">
            <div class="item-info">
                <div class="item-name">${item.title || 'Unknown Product'}</div>
                <div class="item-price">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                <div class="item-quantity">Quantity: ${item.quantity || 1}</div>
            </div>
        `;
        items.appendChild(itemElement);
    });

    const summary = document.createElement('div');
    summary.className = 'order-summary';
    summary.innerHTML = `
        <div class="shipping-info">
            <p><strong>Shipping Address:</strong></p>
            <p>${order.streetAddress || 'N/A'}</p>
            <p>${order.townCity || 'N/A'}</p>
            ${order.apartment ? `<p>Apt: ${order.apartment}</p>` : ''}
        </div>
        <div class="order-total">
            <div class="subtotal">Subtotal: $${order.subtotal || '0.00'}</div>
            ${order.discountAmount ? `<div class="discount">Discount: ${(order.discountAmount * 100).toFixed(0)}%</div>` : ''}
            <div class="total">Total: $${order.total || '0.00'}</div>
        </div>
    `;

    const actions = document.createElement('div');
    actions.className = 'order-actions';
    const orderDate = new Date(order.orderDate);
    const now = new Date();
    const hoursDiff = Math.floor((now - orderDate) / (1000 * 60 * 60));

    if (hoursDiff <= 24) {
        actions.innerHTML = `
            <button class="edit-btn" onclick="editOrder('${order.orderId}')">Edit</button>
            <button class="delete-btn" onclick="deleteOrder('${order.orderId}')">Delete</button>
        `;
    }

    details.appendChild(items);
    details.appendChild(summary);
    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(actions);

    return card;
}

function setupFilters() {
    const searchInput = document.getElementById('orderSearch');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');

    searchInput.addEventListener('input', displayOrders);
    statusFilter.addEventListener('change', displayOrders);
    dateFilter.addEventListener('change', displayOrders);
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            const [month, day, year] = dateString.split(',')[0].split(' ');
            return `${month} ${day}, ${year}`;
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function setupCartFunctionality() {
    const cartIcon = document.querySelector('.cart');
    const closeCart = document.querySelector('.close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const cartKey = currentUser ? `cart_${currentUser.email}` : 'cart';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    updateCartCount();

    cartIcon.addEventListener('click', function() {
        cartSidebar.style.right = '0';
        displayCartItems();
    });

    closeCart.addEventListener('click', function() {
        cartSidebar.style.right = '-700px';
    });
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const cartKey = currentUser ? `cart_${currentUser.email}` : 'cart';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

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

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;

    const progressPercentage = Math.min((subtotal / 50) * 100, 100);
    shippingProgress.style.width = `${progressPercentage}%`;

    const remaining = Math.max(50 - subtotal, 0);
    freeShippingRemaining.textContent = `$${remaining.toFixed(2)}`;
}

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

function editOrder(orderId) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const ordersKey = `orders_${currentUser.email}`;
    let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        const hoursDiff = Math.floor((now - orderDate) / (1000 * 60 * 60));
        if (hoursDiff > 24) {
            alert('Cannot edit order: More than 24 hours have passed.');
            return;
        }
        sessionStorage.setItem('editOrder', JSON.stringify(order));
        window.location.href = 'Checkout.html';
    }
}

function deleteOrder(orderId) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const ordersKey = `orders_${currentUser.email}`;
    let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        const orderDate = new Date(orders[orderIndex].orderDate);
        const now = new Date();
        const hoursDiff = Math.floor((now - orderDate) / (1000 * 60 * 60));
        if (hoursDiff > 24) {
            alert('Cannot delete order: More than 24 hours have passed.');
            return;
        }
        const cartKey = `cart_${currentUser.email}`;
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        cart = cart.concat(orders[orderIndex].cart);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        orders.splice(orderIndex, 1);
        localStorage.setItem(ordersKey, JSON.stringify(orders));
        displayOrders();
    }
}