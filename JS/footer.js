// Dynamic Footer Management
function initializeFooter() {
    // Check if footer already exists
    let footer = document.querySelector('footer');
    
    // If footer doesn't exist, create it
    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    
    // Set the footer content
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-section">
                <h3>SHOP</h3>
                <ul>
                    <li><a href="products.html">Energy Drinks</a></li>
                    <li><a href="products.html">Protein</a></li>
                    <li><a href="products.html">Pre-Workout</a></li>
                    <li><a href="products.html">Plant Therapy</a></li>
                    <li><a href="products.html">Creatine</a></li>
                    <li><a href="products.html">Weight Loss</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>ACCOUNT</h3>
                <ul>
                    <li><a href="Cart.html">Cart</a></li>
                    <li><a href="User.html">My Account</a></li>
                    <li><a href="User.html">My Orders</a></li>
                    <li><a href="#" onclick="toggleWishlist()">Wishlist</a></li>
                    <li><a href="#" onclick="showAffiliateInfo()">Affiliate Program</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>INFORMATION</h3>
                <ul>
                    <li><a href="#" onclick="showTrackOrder()">Track Order</a></li>
                    <li><a href="#" onclick="showReturns()">Returns</a></li>
                    <li><a href="#" onclick="showShippingInfo()">Shipping Info</a></li>
                    <li><a href="#" onclick="showHelp()">Help</a></li>
                    <li><a href="#" onclick="showCareers()">Careers</a></li>
                    <li><a href="#" onclick="showGiftCards()">Gift Cards</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>CUSTOMER SERVICES</h3>
                <ul>
                    <li><a href="#" onclick="showTrackOrder()">Track Order</a></li>
                    <li><a href="#" onclick="showReturns()">Returns</a></li>
                    <li><a href="#" onclick="showShippingInfo()">Shipping Info</a></li>
                    <li><a href="#" onclick="showRecalls()">Recalls & Advisories</a></li>
                    <li><a href="#" onclick="showStoreLocator()">Store Locator</a></li>
                    <li><a href="#" onclick="showHelp()">Help</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2025 - Storeify. All Rights Reserved.</p>
            <div class="social-links">
                <a href="#" onclick="openSocial('facebook')" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="#" onclick="openSocial('twitter')" aria-label="Twitter"><i class="fa-brands fa-twitter"></i></a>
                <a href="#" onclick="openSocial('instagram')" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                <a href="#" onclick="openSocial('linkedin')" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
            </div>
            <div class="payment-methods">
                <img src="../assets/images/payment/payment.png" alt="Payment Methods" loading="lazy">
            </div>
        </div>
    `;
}

// Footer link handlers
function toggleWishlist() {
    alert('Wishlist feature coming soon!');
}

function showAffiliateInfo() {
    alert('Affiliate Program: Join our program and earn commissions on every sale!');
}

function showTrackOrder() {
    alert('Track Order: Please enter your order number to track your shipment.');
}

function showReturns() {
    alert('Returns: We offer 30-day free returns on all items.');
}

function showShippingInfo() {
    alert('Shipping Info: Free shipping on orders over $50. Standard delivery 3-5 business days.');
}

function showHelp() {
    alert('Help: Contact us at support@storeify.com or call 1-800-STOREIFY');
}

function showCareers() {
    alert('Careers: Join our team! Visit our careers page for current openings.');
}

function showGiftCards() {
    alert('Gift Cards: Perfect for any occasion! Available in denominations from $25 to $500.');
}

function showRecalls() {
    alert('Recalls & Advisories: No current product recalls. Check back regularly for updates.');
}

function showStoreLocator() {
    alert('Store Locator: Find a Storeify location near you. Currently available in 50+ cities.');
}

function openSocial(platform) {
    const urls = {
        facebook: 'https://facebook.com/storeify',
        twitter: 'https://twitter.com/storeify',
        instagram: 'https://instagram.com/storeify',
        linkedin: 'https://linkedin.com/company/storeify'
    };
    
    if (urls[platform]) {
        window.open(urls[platform], '_blank');
    }
}

// Initialize footer immediately since script is loaded at bottom of page
initializeFooter();
