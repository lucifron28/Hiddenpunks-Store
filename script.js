// mag initialize variables para ma track ang item rotation sa carousel
let carouselItems = [];
let currentIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('products.html')) {
        prefetchAllProducts();
    }
    if (window.location.pathname.endsWith('cart.html')) {
        initializeCart();
    }
    fetchCarouselItems(); // Fetch and initialize the carousel on page load
});

// function para ma-fetch ng lahat ng products at i-save sa local storage
// upang hindi paulit-ulit mag fetch at para mabilis ang pag load ng products
function prefetchAllProducts() {
    let url = 'https://fakestoreapi.com/products';
    fetch(url)
        .then(response => response.json())
        .then(products => {
            localStorage.setItem('products_all', JSON.stringify(products)); // save ang na fetch na products sa local storage
            displayProducts(products);
        });
}

// function para mag fetch ng carousel items
function fetchCarouselItems() {
    const storedProducts = JSON.parse(localStorage.getItem('products_all')) || [];
    if (storedProducts.length > 0) {
        // i shuffle yung products para mag iba-iba yung items sa carousel
        storedProducts.sort(() => Math.random() - 0.5);
        carouselItems = storedProducts.slice(0, 15).map(item => ({
            image: item.image,
            alt: item.title
        }));
        displayCarouselItem(currentIndex);
        setInterval(nextCarouselItem, 5000); // mag auto slide yung carousel every 5 seconds
    } else {
        console.error('No products found in local storage.');
    }
}
// function para mag display ng carousel item
function displayCarouselItem(index) {
    const carousel = document.getElementById('carousel');
    if (!carousel) return; 

    carousel.innerHTML = '';

    const item = carouselItems[index];
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.alt;
    img.classList.add('active');
    carousel.appendChild(img);

    // mag add ng buttons sa carousel kung wala pa
    if (!document.getElementById('carousel-buttons')) {
        const buttons = document.createElement('div');
        buttons.id = 'carousel-buttons';
        buttons.innerHTML = `
            <button id="carousel-button-prev">&#10094;</button>
            <button id="carousel-button-next">&#10095;</button>
        `;
        carousel.appendChild(buttons);

        document.getElementById('carousel-button-next').addEventListener('click', nextCarouselItem);
        document.getElementById('carousel-button-prev').addEventListener('click', prevCarouselItem);
    }
}
// function para mag slide sa next item sa carousel
function nextCarouselItem() {
    currentIndex = (currentIndex + 1) % carouselItems.length;
    displayCarouselItem(currentIndex);
}
// function para mag slide sa previous item sa carousel
function prevCarouselItem() {
    currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
    displayCarouselItem(currentIndex);
}

// function para mag fetch ng featured products 
function fetchFeaturedProducts() {
    let url = 'https://fakestoreapi.com/products?limit=3'; // Fetch only 3 products for the carousel
    fetch(url)
        .then(response => response.json())
        .then(products => {
            localStorage.setItem('featured_products', JSON.stringify(products)); // Store featured products in local storage
            initializeCarousel(products);
        });
}

// function para mag display ng products na galing sa local storage
function displayProducts(products) {
    const productsContainer = document.querySelector('.products');
    productsContainer.innerHTML = ''; // Clear previous products
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <button onclick="showProductModal(${product.id})">View Details</button>
        `;
        productsContainer.appendChild(productCard);
    });
}

// function para mag show ng modal ng product
function showProductModal(productId) {
    const products = JSON.parse(localStorage.getItem('products_all')) || [];
    const product = products.find(p => p.id === productId);
    if (product) {
        const modal = document.getElementById('product-modal');
        document.getElementById('modal-image').src = product.image;
        document.getElementById('modal-title').innerText = product.title;
        document.getElementById('modal-description').innerText = product.description;
        document.getElementById('modal-price').innerText = `$${product.price}`;
        document.getElementById('add-to-cart').onclick = () => {
            addToCart(product);
            hideModal(modal);
        };
        showModal(modal);
    }
}

// function para mag add ng product sa cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
}

// function para mag close ng modal
function closeModal() {
    const modal = document.getElementById('product-modal');
    hideModal(modal);
}

// function para mag filter ng products base sa category
function filterProducts(category) {
    const products = JSON.parse(localStorage.getItem('products_all')) || [];
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }
}

// function para mag display ng items sa cart na na-save sa local storage
function displayCartItems() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = ''; // Clear the container before displaying items

    if (cart.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('empty-cart-message');
        emptyMessage.innerHTML = 'Your cart is empty <a href="products.html">Go Shopping</a>'; // Use innerHTML instead of innerText
        cartItemsContainer.appendChild(emptyMessage);
    } else {
        cart.forEach((product, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>$${product.price}</p>
                <button class="remove-button" onclick="removeFromCart(${index})">Remove</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }
    updateTotalPrice(cart);
}

// function para mag remove ng item sa cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartItem = cartItemsContainer.children[index];
    cartItem.classList.add('removing');
    setTimeout(() => {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    }, 500); // delay para mag match sa delete animation ng cart item
}

function updateTotalPrice(products) {
    const totalPrice = products.reduce((total, product) => total + product.price, 0);
    document.getElementById('total-price').innerText = `Total: $${totalPrice.toFixed(2)}`;
}

// function para sa functionality ng cart
function initializeCart() {
    displayCartItems();

    document.getElementById('checkout').addEventListener('click', () => {
        alert('Purchase successful.');
        localStorage.removeItem('cart');
        displayCartItems();
    });
}

// Mga function para mag lumabas at ma-tago yung modal
function showModal(modal) {
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.transition = 'opacity 0.3s';
        modal.style.opacity = '1';
    }, 10);
}

function hideModal(modal) {
    modal.style.transition = 'opacity 0.3s';
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

