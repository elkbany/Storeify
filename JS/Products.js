
// Variables for pagination, filtering, and sorting
let products = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 9;

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        filteredProducts = [...products];
        displayProducts();
        updatePagination();
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('productsGrid').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    // Calculate start and end indices for pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    // Update viewed items
    document.getElementById('viewed-items').textContent = Math.min(end, filteredProducts.length);
    document.getElementById('total-items').textContent = filteredProducts.length;

    paginatedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price.toFixed(2)}</p>
            <button onclick="addToCart('${product.title}')">Add to Cart</button>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Add to cart (placeholder function)
function addToCart(productName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(productName);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${productName} added to cart!`);
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    document.getElementById('page-info').textContent = currentPage;
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// Filter and sort products
function applyFiltersAndSort() {
    let tempProducts = [...products];

    // Category filter
    const category = document.getElementById('category-filter').value;
    if (category) {
        tempProducts = tempProducts.filter(product => product.category === category);
    }

    // Price filter
    const maxPrice = parseFloat(document.getElementById('price-range').value);
    tempProducts = tempProducts.filter(product => product.price <= maxPrice);

    // Sort
    const sortBy = document.getElementById('sort-by').value;
    if (sortBy === 'title-asc') {
        tempProducts.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
        tempProducts.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'price-asc') {
        tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        tempProducts.sort((a, b) => b.price - a.price);
    }

    filteredProducts = tempProducts;
    currentPage = 1; // Reset to first page
    displayProducts();
    updatePagination();
}

// Event listeners
window.onload = function() {
    fetchProducts();

    // Category filter
    document.getElementById('category-filter').addEventListener('change', applyFiltersAndSort);

    // Price filter
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    priceRange.addEventListener('input', () => {
        priceValue.textContent = priceRange.value;
        applyFiltersAndSort();
    });

    // Sort
    document.getElementById('sort-by').addEventListener('change', applyFiltersAndSort);

    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
            updatePagination();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts();
            updatePagination();
        }
    });
};