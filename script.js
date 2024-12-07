document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('products.html')) {
        prefetchAllProducts();
    }
    if (window.location.pathname.endsWith('cart.html')) {
        initializeCart();
    }
    fetchFeaturedProducts(); // Fetch and initialize the carousel on page load
});

function prefetchAllProducts() {
    let url = 'https://fakestoreapi.com/products';
    fetch(url)
        .then(response => response.json())
        .then(products => {
            localStorage.setItem('products_all', JSON.stringify(products)); // Store all products in local storage
            displayProducts(products);
        });
}

function fetchFeaturedProducts() {
    let url = 'https://fakestoreapi.com/products?limit=3'; // Fetch only 3 products for the carousel
    fetch(url)
        .then(response => response.json())
        .then(products => {
            localStorage.setItem('featured_products', JSON.stringify(products)); // Store featured products in local storage
            initializeCarousel(products);
        });
}

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

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart');
}

function closeModal() {
    const modal = document.getElementById('product-modal');
    hideModal(modal);
}

function filterProducts(category) {
    const products = JSON.parse(localStorage.getItem('products_all')) || [];
    if (category === 'all') {
        displayProducts(products);
    } else {
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }
}

function displayCartItems() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    cartItemsContainer.innerHTML = ''; // Clear the container before displaying items

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
    updateTotalPrice(cart);
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartItem = cartItemsContainer.children[index];
    cartItem.classList.add('removing');
    setTimeout(() => {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    }, 500); // Match the duration of the slideOut animation
}

function updateTotalPrice(products) {
    const totalPrice = products.reduce((total, product) => total + product.price, 0);
    document.getElementById('total-price').innerText = `Total: $${totalPrice.toFixed(2)}`;
}

// Cart functionality
function initializeCart() {
    displayCartItems();

    document.getElementById('checkout').addEventListener('click', () => {
        alert('Checkout functionality not implemented yet.');
    });
}

// Modal functions
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

function initializeCarousel(products) {
    const carouselContainer = document.getElementById('carousel');
    carouselContainer.innerHTML = ''; // Clear existing carousel content

    products.forEach((product, index) => {
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.title;
        img.classList.add(index === 0 ? 'active' : 'inactive'); // Show the first image, hide others
        carouselContainer.appendChild(img);
    });

    const buttons = document.createElement('div');
    buttons.id = 'carousel-buttons';
    buttons.innerHTML = `
        <button id="carousel-button-prev">&#10094;</button>
        <button id="carousel-button-next">&#10095;</button>
    `;
    carouselContainer.appendChild(buttons);

    let currentSlide = 0;
    const slides = carouselContainer.querySelectorAll('img');

    function showSlide(index) {
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].classList.add('inactive');
        slides[index].classList.remove('inactive');
        slides[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }

    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }

    document.getElementById('carousel-button-next').addEventListener('click', nextSlide);
    document.getElementById('carousel-button-prev').addEventListener('click', prevSlide);

    // Automatically slide every 5 seconds
    setInterval(nextSlide, 5000);
}