// Variables
let products = [];
let filteredProducts = [];

// Fetch products from API
async function fetchFeaturedProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        filteredProducts = [...products];
        applyFiltersAndDisplay();
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('featuredProducts').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Apply filters and display products
function applyFiltersAndDisplay() {
    let tempProducts = [...filteredProducts];

    const category = document.getElementById('category-filter').value;
    if (category) {
        tempProducts = tempProducts.filter(product => product.category === category);
    }

    // Sort by rating and get top 6 products
    tempProducts = tempProducts.sort((a, b) => b.rating.rate - a.rating.rate).slice(0, 6);
    displayFeaturedProducts(tempProducts);
}

// Display featured products
function displayFeaturedProducts(products) {
    const featuredProductsDiv = document.getElementById('featuredProducts');
    featuredProductsDiv.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <a href="OneProduct.html?id=${product.id}" class="product-title">${product.title}</a>
            <p class="price">$${product.price.toFixed(2)}</p>
        `;
        featuredProductsDiv.appendChild(productCard);
    });
}

// Initialize Swiper Slider
function initializeSlider() {
    new Swiper('.swiper-container', {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        effect: 'fade',
        fadeEffect: {
            crossFade: true,
        },
    });
}

// Dynamic Offer Text based on time
function updateDynamicOffer() {
    const now = new Date();
    const hours = now.getHours();
    let offerText = "Discover the best products for you!";

    if (hours >= 6 && hours < 12) {
        offerText = "Morning Deal: 10% Off Everything!";
    } else if (hours >= 12 && hours < 18) {
        offerText = "Afternoon Special: Free Shipping on Orders Over $50!";
    } else {
        offerText = "Evening Offer: Buy 1 Get 1 Half Price!";
    }

    document.getElementById('dynamic-offer').textContent = offerText;
}

// Redirect to Products page with search term
document.getElementById('searchButton').addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        window.location.href = `Products.html?search=${encodeURIComponent(searchTerm)}`;
    }
});

// Allow Enter key to trigger search
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            window.location.href = `Products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }
});

// Event listener for category filter
document.getElementById('category-filter').addEventListener('change', applyFiltersAndDisplay);

// Load everything on page load
window.onload = function() {
    fetchFeaturedProducts();
    initializeSlider();
    updateDynamicOffer();
};