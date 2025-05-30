// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const productContainer = document.getElementById('productContainer');
const relatedProductsGrid = document.getElementById('relatedProductsGrid');

let quantity = 1;
let selectedColor = 'Default';
let selectedSize = 'M';
let mainImage = '';

if (!productId) {
    productContainer.innerHTML = '<p>Product not found.</p>';
} else {
    loadProduct();
}

async function loadProduct() {
    try {
        var response = await fetch('https://fakestoreapi.com/products/' + productId);
        var product = await response.json();
        mainImage = product.image;
        // Example color/size options (since API doesn't provide)
        var colors = ['#fff', '#d32f2f', '#7c4dff'];
        var sizes = ['XS', 'S', 'M', 'L', 'XL'];
        productContainer.innerHTML = 
            '<div class="product-image">' +
                '<img id="mainProductImage" src="' + mainImage + '" alt="' + product.title + '">' +
                '<div class="thumbnail-gallery">' +
                    '<img src="' + product.image + '" alt="Thumbnail" onclick="changeImage(\'' + product.image + '\')">' +
                '</div>' +
            '</div>' +
            '<div class="product-details">' +
                '<div class="product-title">' + product.title + '</div>' +
                '<div class="product-price">$' + product.price + '</div>' +
                '<div class="product-rating">' +
                    '<span class="stars">' + '★'.repeat(Math.round(product.rating.rate)) + '</span>' +
                    '<span class="stars">' + '☆'.repeat(5 - Math.round(product.rating.rate)) + '</span>' +
                    '<span class="reviews">(' + product.rating.count + ' Reviews)</span>' +
                '</div>' +
                '<div class="product-description">' + product.description + '</div>' +
                '<div class="options">' +
                    '<div>' +
                        '<label>Colours:</label>' +
                        '<div class="color-options">' +
                            colors.map(function(color, i) {
                                return '<div class="color-circle' + (i === 0 ? ' selected' : '') + '" style="background-color: ' + color + ';" onclick="selectColor(\'' + color + '\')"></div>';
                            }).join('') +
                        '</div>' +
                    '</div>' +
                    '<div>' +
                        '<label>Size:</label>' +
                        '<div class="size-options">' +
                            '<select onchange="selectSize(this.value)">' +
                                sizes.map(function(size) {
                                    return '<option value="' + size + '"' + (size === 'M' ? ' selected' : '') + '>' + size + '</option>';
                                }).join('') +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="quantity-control">' +
                    '<button onclick="updateQuantity(-1)">-</button>' +
                    '<span id="quantity">' + quantity + '</span>' +
                    '<button onclick="updateQuantity(1)">+</button>' +
                '</div>' +
                '<div class="action-buttons">' +
                    '<button class="add-to-cart-btn" onclick="addToCart(' + product.id + ', `' + product.title.replace(/`/g, '\\`') + '`, ' + product.price + ')">' +
                        '<i class="fa-solid fa-cart-plus"></i> Add to Cart' +
                    '</button>' +
                    '<button class="buy-now-btn" onclick="buyNow()">Buy Now</button>' +
                    '<button class="wishlist-btn" onclick="addToWishlist(' + product.id + ')">' +
                        '<i class="fas fa-heart"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="delivery-info">' +
                    '<div>' +
                        '<i class="fas fa-truck"></i>' +
                        '<p>Free Delivery <a href="#">Enter your postal code for Delivery Availability</a></p>' +
                    '</div>' +
                    '<div>' +
                        '<i class="fas fa-undo"></i>' +
                        '<p>Return Delivery Free 30 Days Delivery Returns. <a href="#">Details</a></p>' +
                    '</div>' +
                '</div>' +
            '</div>';
        fetchRelatedProducts(product.category, product.id);
    } catch (e) {
        productContainer.innerHTML = '<p>Product not found.</p>';
    }
}

// Change main image
window.changeImage = function(imageSrc) {
    document.getElementById('mainProductImage').src = imageSrc;
}

// Select color
window.selectColor = function(color) {
    selectedColor = color;
    var circles = document.querySelectorAll('.color-circle');
    for (var i = 0; i < circles.length; i++) {
        circles[i].classList.remove('selected');
        if (circles[i].style.backgroundColor.replace(/ /g, '') === color.replace(/ /g, '')) {
            circles[i].classList.add('selected');
        }
    }
}

// Select size
window.selectSize = function(size) {
    selectedSize = size;
}

// Update quantity
window.updateQuantity = function(change) {
    quantity = Math.max(1, quantity + change);
    document.getElementById('quantity').textContent = quantity;
}

// Add to cart
window.addToCart = function(id, title, price) {
    try {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please log in to add items to your cart!');
            window.location.href = 'Login.html';
            return;
        }

        const cartKey = `cart_${currentUser.email}`;
        var cart = JSON.parse(localStorage.getItem(cartKey)) || [];

        var item = cart.find(function(item) {
            return item.id === id && item.color === selectedColor && item.size === selectedSize;
        });

        if (item) {
            item.quantity += quantity;
        } else {
            cart.push({
                id: id,
                title: title,
                price: price,
                quantity: quantity,
                color: selectedColor,
                size: selectedSize,
                image: currentProduct ? currentProduct.image : ''
            });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));

        // Show success feedback
        showAddToCartFeedback(title);

        // Update cart count in header if available
        if (window.refreshCartCount) {
            window.refreshCartCount();
        }

    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

// Show feedback when item is added to cart
function showAddToCartFeedback(productTitle) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fa-solid fa-check-circle"></i>
        <span>${productTitle} added to cart!</span>
    `;

    document.body.appendChild(notification);

    // Add show class for animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove notification after 3 seconds
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

// Buy now
window.buyNow = function() {
    alert('Proceeding to checkout...');
}

// Add to wishlist
window.addToWishlist = function(id) {
    var wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.indexOf(id) === -1) {
        wishlist.push(id);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        alert('Added to wishlist!');
    } else {
        alert('Already in wishlist!');
    }
}

// Fetch related products
async function fetchRelatedProducts(category, currentId) {
    try {
        var response = await fetch('https://fakestoreapi.com/products/category/' + encodeURIComponent(category) + '?limit=4');
        var products = await response.json();
        relatedProductsGrid.innerHTML = '';
        var filteredProducts = products.filter(function(product) {
            return product.id != currentId;
        });
        filteredProducts.forEach(function(product) {
            var card = document.createElement('div');
            card.className = 'related-product-card';
            card.innerHTML =
                '<a href="OneProduct.html?id=' + product.id + '">' +
                    '<img src="' + product.image + '" alt="' + product.title + '">' +
                    '<div class="product-title">' + product.title + '</div>' +
                '</a>' +
                '<div class="product-price">$' + product.price.toFixed(2) + '</div>' +
                '<div class="rating">★ ' + product.rating.rate + ' (' + product.rating.count + ')</div>' +
                '<button class="wishlist-btn" onclick="addToWishlist(' + product.id + ');event.stopPropagation();">' +
                    '<i class="fas fa-heart"></i>' +
                '</button>';
            relatedProductsGrid.appendChild(card);
        });
    } catch (error) {
        relatedProductsGrid.innerHTML = '<p>Error loading related products.</p>';
    }
}