// Define discount and valid coupons
let discount = 0;
const validCoupons = {
    'SAVE10': 0.10,
    'SAVE20': 0.20
};

document.addEventListener('DOMContentLoaded', () => {
    setupQuantityListeners();
    setupDeleteButtons();
    setupCouponButton();
    setupCheckoutButton();
    updateCart(); // Initial update
});

// Update quantity subtotal and overall cart total
function setupQuantityListeners() {
    const quantityInputs = document.querySelectorAll('.quantity input');
    quantityInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateSubtotal(input);
            updateCart();
        });
    });
}

// Update subtotal for a single cart item
function updateSubtotal(input) {
    const item = input.closest('.cart-item');
    const price = parseFloat(item.querySelector('.price').textContent.replace('$', ''));
    const quantity = parseInt(input.value);
    const subtotal = price * quantity;
    item.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
}

// Update entire cart totals
function updateCart() {
    const items = document.querySelectorAll('.cart-item');
    let total = 0;

    items.forEach(item => {
        const price = parseFloat(item.querySelector('.price').textContent.replace('$', ''));
        const quantity = parseInt(item.querySelector('.quantity input').value);
        const subtotal = price * quantity;
        item.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
        total += subtotal;
    });

    const discountedTotal = total - (total * discount);
    document.querySelector('.cart-total p:nth-child(2) span:last-child').textContent = `$${total.toFixed(2)}`;
    document.querySelector('.cart-total p:nth-child(4) strong:last-child').textContent = `$${discountedTotal.toFixed(2)}`;
}

// Handle delete buttons
function setupDeleteButtons() {
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.cart-item');
            item.remove();
            updateCart();
        });
    });
}

// Handle coupon application
function setupCouponButton() {
    const applyBtn = document.querySelector('.coupon button');
    const input = document.querySelector('.coupon input');

    applyBtn.addEventListener('click', () => {
        const code = input.value.trim().toUpperCase();
        if (validCoupons[code]) {
            discount = validCoupons[code];
            alert(`Coupon applied: ${code} (${discount * 100}% off)`);
        } else {
            discount = 0;
            alert('Invalid coupon code!');
        }
        updateCart();
    });
}

// Checkout button redirection
function setupCheckoutButton() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        window.location.href = '../HTML/Checkout.html';
    });
}
