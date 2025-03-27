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
  const cart = {};

  function changeQuantity(button, change) {
    const quantityDisplay = button.parentElement.querySelector('.quantity-display');
    const currentQuantity = parseInt(quantityDisplay.textContent) || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    quantityDisplay.textContent = newQuantity;

    const menuItem = button.closest('.menu-item');
    if (menuItem) {
      updateCart(menuItem, newQuantity);
    }
  }

  function updateCart(menuItem, quantity) {
    const cartItems = document.getElementById('cartItems');
    const itemName = menuItem.querySelector('h3').textContent.trim();
    const weightSelect = menuItem.querySelector('.pickle-quantity');
    const selectedWeight = weightSelect ? weightSelect.value : 'Single';
    const priceMap = {
      '250g': 250,
      '500g': 450,
      '1kg': 850,
    };
    const basePrice = selectedWeight in priceMap
      ? priceMap[selectedWeight]
      : parseInt(menuItem.querySelector('.text-food-yellow').textContent.replace('₹', '')) || 0;
    const totalPrice = basePrice * quantity;

    let cartItem = Array.from(cartItems.children).find(
      item => item.dataset.name === itemName && item.dataset.weight === selectedWeight
    );

    if (quantity === 0) {
      if (cartItem) cartItem.remove();
    } else {
      if (!cartItem) {
        cartItem = document.createElement('div');
        cartItem.dataset.name = itemName;
        cartItem.dataset.weight = selectedWeight;
        cartItem.className = "flex justify-between items-center border-b pb-2";
        cartItems.appendChild(cartItem);
      }
      cartItem.textContent = `${itemName} (${selectedWeight}): ₹${totalPrice} (${quantity}x)`;
    }

    updateTotalPrice();
  }

  function updateTotalPrice() {
    const cartItems = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');
    let total = 0;

    Array.from(cartItems.children).forEach(item => {
      const priceMatch = item.textContent.match(/₹(\d+)/);
      if (priceMatch) total += parseInt(priceMatch[1]);
    });

    totalPriceElement.textContent = `Total: ₹${total}`;
  }

  function toggleCartModal() {
    const cartModal = document.getElementById("cartModal");
    cartModal.classList.toggle("hidden");
  }

  // Expose functions globally
  window.changeQuantity = changeQuantity;
  window.toggleCartModal = toggleCartModal;
});
