// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCsAc1191L0QHjUtPf15uWPDcOOlyGNtsM",
    authDomain: "yumtumfoods-7b3b6.firebaseapp.com",
    projectId: "yumtumfoods-7b3b6",
    storageBucket: "yumtumfoods-7b3b6.appspot.com",
    messagingSenderId: "236445989117",
    appId: "1:236445989117:web:0fc12622185fff51062694"
  };
  
  // Initialize Firebase
  let db;
  try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      console.log("Firebase initialized successfully");
  } catch (error) {
      console.error("Firebase initialization error:", error);
  }
  
  document.addEventListener('DOMContentLoaded', function() {
      const mobileMenuButton = document.getElementById('mobile-menu-button');
      const mainMenu = document.getElementById('main-menu');
      
      mobileMenuButton.addEventListener('click', function() {
          const isExpanded = this.getAttribute('aria-expanded') === 'true';
          this.setAttribute('aria-expanded', !isExpanded);
          mainMenu.classList.toggle('active');
      });
  
      document.getElementById('year').textContent = new Date().getFullYear();
  
      const cartButton = document.getElementById('cart-button');
      const cartModal = document.getElementById('cart-modal');
      const closeCart = document.getElementById('close-cart');
      const cartItemsContainer = document.getElementById('cart-items');
      const cartCount = document.getElementById('cart-count');
      const cartTotalPrice = document.getElementById('cart-total-price');
      const addToCartButtons = document.querySelectorAll('.btn-add');
      const checkoutButton = document.getElementById('checkout-btn');
  
      let cart = [];
  
      cartButton.addEventListener('click', function(e) {
          e.preventDefault();
          cartModal.style.display = 'flex';
          cartModal.setAttribute('aria-hidden', 'false');
      });
  
      closeCart.addEventListener('click', function() {
          cartModal.style.display = 'none';
          cartModal.setAttribute('aria-hidden', 'true');
      });
  
      window.addEventListener('click', function(e) {
          if (e.target === cartModal) {
              cartModal.style.display = 'none';
              cartModal.setAttribute('aria-hidden', 'true');
          }
      });
  
      addToCartButtons.forEach(button => {
          button.addEventListener('click', function() {
              const item = this.getAttribute('data-item');
              const price = parseInt(this.getAttribute('data-price'));
              
              const existingItem = cart.find(cartItem => cartItem.name === item);
              
              if (existingItem) {
                  existingItem.quantity += 1;
              } else {
                  cart.push({
                      name: item,
                      price: price,
                      quantity: 1
                  });
              }
              
              updateCart();
              
              const originalText = this.textContent;
              this.textContent = 'Added!';
              this.classList.add('btn-success');
              
              setTimeout(() => {
                  this.textContent = originalText;
                  this.classList.remove('btn-success');
              }, 1000);
          });
      });
  
      function updateCart() {
          const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
          cartCount.textContent = totalItems;
          
          cartItemsContainer.innerHTML = '';
          
          let totalPrice = 0;
          
          cart.forEach(item => {
              totalPrice += item.price * item.quantity;
              
              const cartItemElement = document.createElement('div');
              cartItemElement.className = 'cart-item';
              cartItemElement.innerHTML = `
                  <div class="cart-item-info">
                      <h4>${item.name}</h4>
                      <div class="d-flex">
                          <button class="btn-quantity" data-item="${item.name}" data-action="decrease">-</button>
                          <span class="cart-item-quantity">${item.quantity}</span>
                          <button class="btn-quantity" data-item="${item.name}" data-action="increase">+</button>
                      </div>
                  </div>
                  <span class="cart-item-price">₹${item.price * item.quantity}</span>
                  <button class="remove-item" data-item="${item.name}">
                      <i class="fas fa-trash"></i>
                  </button>
              `;
              
              cartItemsContainer.appendChild(cartItemElement);
          });
          
          cartTotalPrice.textContent = `₹${totalPrice}`;
          
          document.querySelectorAll('.btn-quantity').forEach(button => {
              button.addEventListener('click', function() {
                  const itemName = this.getAttribute('data-item');
                  const action = this.getAttribute('data-action');
                  const cartItem = cart.find(item => item.name === itemName);
                  
                  if (action === 'increase') {
                      cartItem.quantity += 1;
                  } else if (action === 'decrease' && cartItem.quantity > 1) {
                      cartItem.quantity -= 1;
                  }
                  
                  updateCart();
              });
          });
          
          document.querySelectorAll('.remove-item').forEach(button => {
              button.addEventListener('click', function() {
                  const itemName = this.getAttribute('data-item');
                  cart = cart.filter(item => item.name !== itemName);
                  updateCart();
              });
          });
      }
  
      checkoutButton.addEventListener('click', async function() {
          if (cart.length === 0) {
              alert('Your cart is empty!');
              return;
          }
          
          try {
              const order = {
                  items: cart,
                  total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
                  status: "pending",
                  timestamp: firebase.firestore.FieldValue.serverTimestamp()
              };
  
              await db.collection("orders").add(order);
              alert(`Order # placed successfully! Total: ₹${order.total}`);
              cart = [];
              updateCart();
              cartModal.style.display = 'none';
          } catch (error) {
              console.error("Error saving order:", error);
              alert("There was an error placing your order. Please try again.");
          }
      });
  
      const contactForm = document.getElementById('contact-form');
      const contactMessage = document.getElementById('contact-message');
      
      if (contactForm) {
          contactForm.addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const name = document.getElementById('name').value;
              const email = document.getElementById('email').value;
              const message = document.getElementById('message').value;
              
              try {
                  if (!db) {
                      throw new Error("Firebase not initialized");
                  }

                  // Validate email format
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(email)) {
                      throw new Error("Please enter a valid email address");
                  }

                  // Validate message length
                  if (message.length < 10) {
                      throw new Error("Message must be at least 10 characters long");
                  }

                  const messageData = {
                      name: name,
                      email: email,
                      message: message,
                      timestamp: firebase.firestore.FieldValue.serverTimestamp()
                  };

                  console.log("Attempting to save message:", messageData);
                  
                  const docRef = await db.collection('messages').add(messageData);
                  console.log("Message saved with ID:", docRef.id);
                  
                  contactMessage.textContent = 'Thank you for your message! We will contact you soon.';
                  contactMessage.style.color = 'green';
                  this.reset();
                  
                  setTimeout(() => {
                      contactMessage.textContent = '';
                  }, 5000);
              } catch (error) {
                  console.error('Detailed error:', error);
                  contactMessage.textContent = `Error: ${error.message}`;
                  contactMessage.style.color = 'red';
              }
          });
      }
  });