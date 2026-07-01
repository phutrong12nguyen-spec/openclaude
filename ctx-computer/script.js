// ==================== HERO SLIDER ====================
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

// Auto-rotate slides every 5 seconds
let slideInterval = setInterval(nextSlide, 5000);

// Dots click functionality
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        currentSlide = index;
        showSlide(index);
        slideInterval = setInterval(nextSlide, 5000);
    });
});

// ==================== BACK TO TOP BUTTON ====================
const backToTopBtn = document.getElementById('backToTopBtn');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ==================== CART FUNCTIONALITY ====================
let cart = [];
const cartCount = document.querySelector('.cart-count');
const addToCartButtons = document.querySelectorAll('.btn-cart');

addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.current-price').textContent;
        
        const product = {
            name: productName,
            price: productPrice,
            id: Math.random()
        };
        
        cart.push(product);
        cartCount.textContent = cart.length;
        
        // Show notification
        showNotification(`${productName} added to cart!`);
        
        // Button feedback
        button.textContent = '✓ Added to Cart';
        button.style.backgroundColor = 'var(--success)';
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
            button.style.backgroundColor = 'var(--accent-color)';
        }, 1500);
    });
});

// ==================== NOTIFICATION ====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--success);
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==================== CATEGORY CARDS ====================
const categoryCards = document.querySelectorAll('.category-card');

categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.querySelector('h3').textContent;
        showNotification(`Navigating to ${category}...`);
    });
});

// ==================== MOBILE MENU ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    navMenu.style.position = 'absolute';
    navMenu.style.top = '100%';
    navMenu.style.left = '0';
    navMenu.style.right = '0';
    navMenu.style.backgroundColor = 'white';
    navMenu.style.flexDirection = 'column';
    navMenu.style.gap = '10px';
    navMenu.style.padding = '20px';
    navMenu.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
});

// ==================== SEARCH FUNCTIONALITY ====================
const searchBtn = document.querySelector('a[href="#search"]');

if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const searchBox = document.createElement('div');
        searchBox.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 400px;">
                    <h3 style="margin-bottom: 20px;">Search Products</h3>
                    <input type="text" placeholder="Search for products..." style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; margin-bottom: 15px;">
                    <button onclick="this.closest('div').closest('div').remove()" style="background-color: #999; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchBox);
    });
}

// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#search' && href !== '#cart' && href !== '#user') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==================== FORM SUBMISSION ====================
const contactForm = document.querySelector('.contact-form form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        
        // Simulated form submission
        showNotification('Message sent successfully! We\'ll get back to you soon.');
        contactForm.reset();
    });
}

// ==================== PRODUCT RATING INTERACTION ====================
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    const ratingContainer = card.querySelector('.rating');
    
    if (ratingContainer) {
        ratingContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'I') {
                showNotification('Thank you for rating this product!');
            }
        });
    }
});

// ==================== LAZY LOADING IMAGES ====================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(img => {
        imageObserver.observe(img);
    });
}

// ==================== HEADER ANIMATION ON SCROLL ====================
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScrollTop) {
        // Scrolling down
        navbar.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    } else {
        // Scrolling up
        navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

// ==================== PRICE ANIMATION ====================
const priceElements = document.querySelectorAll('.current-price');

const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'slideInUp 0.5s ease forwards';
        }
    });
});

priceElements.forEach(price => {
    priceObserver.observe(price);
});

// ==================== CATEGORY FILTER ====================
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.style.display = 'none';
    });
});

// ==================== SOCIAL MEDIA LINKS ====================
const socialLinks = document.querySelectorAll('.social-links a');

socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Social links open in new tab (already set with target="_blank")
        console.log('Opening social media:', link.href);
    });
});

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Press 'C' to show cart
    if (e.key === 'c' || e.key === 'C') {
        showNotification(`Cart items: ${cart.length}`);
    }
    
    // Press 'S' to focus search
    if (e.key === 's' || e.key === 'S') {
        document.querySelector('a[href="#search"]').click();
    }
});

// ==================== INITIALIZATION ====================
console.log('CTX Computer website loaded successfully!');
console.log('Cart items:', cart.length);

// Add animation class to CSS for slideInRight
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(300px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);