// Back to Top Button
document.addEventListener("DOMContentLoaded", function () {
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  // Show/hide button based on scroll position
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  });

  // Scroll to top when button is clicked
  scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Menu Filtering
  const categoryButtons = document.querySelectorAll(".menu-category-btn");
  const menuItems = document.querySelectorAll(".menu-item");

  // Add no-scrollbar utility
  const style = document.createElement("style");
  style.textContent = `
      .no-scrollbar::-webkit-scrollbar {
          display: none;
      }
      .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
      }
  `;
  document.head.appendChild(style);

  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.getAttribute("data-category");

      // Update active button
      categoryButtons.forEach((btn) => {
        btn.classList.remove("active", "bg-food-yellow", "text-white");
        btn.classList.add(
          "bg-white",
          "border",
          "border-food-yellow",
          "text-food-yellow"
        );
      });

      this.classList.remove(
        "bg-white",
        "border",
        "border-food-yellow",
        "text-food-yellow"
      );
      this.classList.add("active", "bg-food-yellow", "text-white");

      // Filter menu items
      menuItems.forEach((item) => {
        if (
          category === "all" ||
          item.getAttribute("data-category") === category
        ) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Cart functionality
  const cart = {}; // Store quantities for each unique item-weight combination

  function changeQuantity(button, change) {
    try {
      const menuItem = button.closest('.menu-item');
      if (!menuItem) return;

      const weightSelect = menuItem.querySelector('.pickle-quantity');
      const selectedWeight = weightSelect ? weightSelect.value : 'Single';
      const itemName = menuItem.querySelector('h3')?.textContent.trim();
      if (!itemName) return;

      const uniqueKey = `${itemName}-${selectedWeight}`;
      const currentQuantity = cart[uniqueKey] || 0;
      const newQuantity = Math.max(0, Math.min(99, currentQuantity + change)); // Add maximum limit

      if (newQuantity === currentQuantity) return;

      cart[uniqueKey] = newQuantity;
      
      const quantityDisplay = button.parentElement.querySelector('.quantity-display');
      if (quantityDisplay) {
        quantityDisplay.textContent = newQuantity;
      }

      updateCart(menuItem, newQuantity);
    } catch (error) {
      console.error("Error changing quantity:", error);
    }
  }

  function handleWeightChange(selectElement) {
    try {
      const menuItem = selectElement.closest('.menu-item');
      if (!menuItem) return;

      const selectedWeight = selectElement.value;
      const itemName = menuItem.querySelector('h3')?.textContent.trim();
      if (!itemName) return;

      const uniqueKey = `${itemName}-${selectedWeight}`;
      const storedQuantity = cart[uniqueKey] || 0;

      const quantityDisplay = menuItem.querySelector('.quantity-display');
      if (quantityDisplay) {
        quantityDisplay.textContent = storedQuantity;
      }
    } catch (error) {
      console.error("Error handling weight change:", error);
    }
  }

  function updateCart(menuItem, quantity) {
    try {
      const cartItems = document.getElementById('cartItems');
      if (!cartItems) return;

      const itemName = menuItem.querySelector('h3')?.textContent.trim();
      if (!itemName) return;

      const weightSelect = menuItem.querySelector('.pickle-quantity');
      const selectedWeight = weightSelect ? weightSelect.value : '';
      const uniqueKey = `${itemName}-${selectedWeight}`;

      const priceMap = {
        '250g': 250,
        '500g': 450,
        '1kg': 850,
      };

      const basePrice = weightSelect 
        ? priceMap[selectedWeight] 
        : parseInt(menuItem.querySelector('.text-food-yellow')?.textContent.replace(/[^0-9]/g, '')) || 0;

      const totalPrice = basePrice * quantity;

      let cartItem = Array.from(cartItems.children).find(
        item => item.dataset.key === uniqueKey
      );

      if (quantity <= 0) {
        if (cartItem) {
          cartItem.remove();
          delete cart[uniqueKey];
        }
      } else {
        if (!cartItem) {
          cartItem = document.createElement('div');
          cartItem.dataset.key = uniqueKey;
          cartItem.dataset.name = itemName;
          cartItem.dataset.weight = selectedWeight;
          cartItem.dataset.basePrice = basePrice;
          cartItem.dataset.quantity = quantity;
          cartItem.className = "flex justify-between items-center border-b pb-2 space-x-4";
        }

        cartItem.dataset.quantity = quantity;
        cartItem.innerHTML = `
          <span class="flex-1 font-semibold">${itemName}${selectedWeight ? ` (${selectedWeight})` : ''}</span>
          <span class="mx-4 text-center font-semibold">${quantity}x</span>
          <span class="font-semibold">₹${totalPrice}</span>
        `;

        if (!cartItem.parentElement) {
          cartItems.appendChild(cartItem);
        }
      }

      updateTotalPrice();
      updateCartQuantityBadge();
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  }

  function findMenuItemById(menuItemId) {
    return document.querySelector(`.menu-item[data-id="${menuItemId}"]`);
  }

  function syncQuantityToMainPage(uniqueKey, quantity) {
    const [itemName, selectedWeight] = uniqueKey.split('-');
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(menuItem => {
      const name = menuItem.querySelector('h3')?.textContent.trim();
      const weightSelect = menuItem.querySelector('.pickle-quantity');
      const weight = weightSelect ? weightSelect.value : 'Single';

      if (name === itemName && weight === selectedWeight) {
        const quantityDisplay = menuItem.querySelector('.quantity-display');
        if (quantityDisplay) {
          quantityDisplay.textContent = quantity;
        }
      }
    });
  }

  function updateCartQuantityBadge() {
    const cartItems = document.getElementById('cartItems');
    const cartQuantityBadge = document.getElementById('cartQuantityBadge');
    if (!cartItems || !cartQuantityBadge) return; // Ensure elements exist

    const totalQuantity = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

    if (totalQuantity > 0) {
      cartQuantityBadge.textContent = totalQuantity;
      cartQuantityBadge.classList.remove('hidden');
    } else {
      cartQuantityBadge.classList.add('hidden');
    }
  }

  function updateTotalPrice() {
    const cartItems = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');
    if (!cartItems || !totalPriceElement) return; // Ensure elements exist

    let total = 0;

    Array.from(cartItems.children).forEach(item => {
      const priceMatch = item.querySelector('span:last-child')?.textContent.replace('₹', '');
      if (priceMatch) total += parseInt(priceMatch);
    });

    totalPriceElement.textContent = `Total: ₹${total}`;
  }

  function toggleCartModal() {
    const cartModal = document.getElementById("cartModal");
    const mainContent = document.getElementById("mainContent");
    cartModal.classList.toggle("hidden");
    mainContent.classList.toggle("active");
  }

  function placeOrder() {
    try {
      const cartItems = document.getElementById('cartItems');
      if (!cartItems?.children.length) {
        alert("Your cart is empty. Please add items to place an order.");
        return;
      }

      let orderMessage = "*Food Login Order Details:*\n\n";
      let totalPrice = 0;

      Array.from(cartItems.children).forEach((item, index) => {
        const name = item.dataset.name;
        const weight = item.dataset.weight;
        const quantity = parseInt(item.dataset.quantity) || 0;
        const basePrice = parseInt(item.dataset.basePrice) || 0;
        const itemTotal = basePrice * quantity;

        totalPrice += itemTotal;
        orderMessage += `${index + 1}. ${name}${weight ? ` (${weight})` : ''} x ${quantity}\n`;
      });

      orderMessage += `\n*Total Amount: ₹${totalPrice}*`;
      const encodedMessage = encodeURIComponent(orderMessage);
      window.open(`https://wa.me/916301972788?text=${encodedMessage}`, "_blank");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    }
  }

  // Expose functions globally
  window.changeQuantity = changeQuantity;
  window.handleWeightChange = handleWeightChange;
  window.toggleCartModal = toggleCartModal;
  window.placeOrder = placeOrder;
});
