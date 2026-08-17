(function () {
  "use strict";

  /* ---------- Header scroll shadow ---------- */
  var header = document.getElementById("SiteHeader");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector("[data-mobile-nav-toggle]");
  var navClose = document.querySelector("[data-mobile-nav-close]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.removeAttribute("hidden");
      navToggle.setAttribute("aria-expanded", "true");
    });
  }
  if (navClose && mobileNav) {
    navClose.addEventListener("click", function () {
      mobileNav.setAttribute("hidden", "");
      if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    });
  }

  /* ---------- Fade-up entrance animation ---------- */
  var fadeEls = document.querySelectorAll(".fade-up");
  if ("IntersectionObserver" in window && fadeEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Cart count badge (shared) ---------- */
  function updateCartCount(count) {
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  /* ---------- Product page: gallery thumbnails ---------- */
  document.querySelectorAll("[data-gallery-thumb]").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var main = document.getElementById("ProductMainImage");
      if (main) main.src = thumb.getAttribute("data-full-src");
    });
  });

  /* ---------- Product page: quantity stepper ---------- */
  var qtyInput = document.getElementById("ProductQuantity");
  var qtyDec = document.querySelector("[data-qty-decrease]");
  var qtyInc = document.querySelector("[data-qty-increase]");
  if (qtyInput && qtyDec && qtyInc) {
    qtyDec.addEventListener("click", function () {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1", 10) - 1);
    });
    qtyInc.addEventListener("click", function () {
      qtyInput.value = parseInt(qtyInput.value || "1", 10) + 1;
    });
  }

  /* ---------- Product page: variant selection ---------- */
  var productForm = document.querySelector("[data-product-form]");
  if (productForm) {
    var variantsJsonEl = document.getElementById("ProductVariantsJson");
    var variants = variantsJsonEl ? JSON.parse(variantsJsonEl.textContent) : [];
    var variantIdInput = document.getElementById("ProductVariantId");
    var priceEl = document.getElementById("ProductPrice");
    var addBtn = document.getElementById("AddToCartButton");
    var addText = document.getElementById("AddToCartText");
    var optionGroups = document.querySelectorAll("[data-option-index]");

    function formatMoney(cents) {
      return (cents / 100).toLocaleString(undefined, { style: "currency", currency: window.Shopify && window.Shopify.currency ? window.Shopify.currency.active : "USD" });
    }

    function currentSelections() {
      var selections = [];
      optionGroups.forEach(function (group) {
        var selected = group.querySelector(".variant-pill.is-selected");
        selections.push(selected ? selected.getAttribute("data-option-value") : null);
      });
      return selections;
    }

    function findMatchingVariant(selections) {
      return variants.find(function (v) {
        var opts = [v.option1, v.option2, v.option3];
        return selections.every(function (val, i) {
          return val === null || opts[i] === val;
        });
      });
    }

    function refreshAvailability() {
      var selections = currentSelections();
      optionGroups.forEach(function (group, groupIndex) {
        group.querySelectorAll(".variant-pill").forEach(function (pill) {
          var testSelections = selections.slice();
          testSelections[groupIndex] = pill.getAttribute("data-option-value");
          var match = findMatchingVariant(testSelections);
          pill.disabled = !match || !match.available;
        });
      });
    }

    function selectVariant(variant) {
      if (!variant) return;
      variantIdInput.value = variant.id;
      if (priceEl) {
        priceEl.innerHTML =
          (variant.compare_at_price && variant.compare_at_price > variant.price
            ? "<s>" + formatMoney(variant.compare_at_price) + "</s> "
            : "") + formatMoney(variant.price);
      }
      if (addBtn) {
        addBtn.disabled = !variant.available;
        if (addText) addText.textContent = variant.available ? "Add to Cart" : "Sold Out";
      }
    }

    optionGroups.forEach(function (group) {
      group.querySelectorAll(".variant-pill").forEach(function (pill) {
        pill.addEventListener("click", function () {
          if (pill.disabled) return;
          group.querySelectorAll(".variant-pill").forEach(function (p) {
            p.classList.remove("is-selected");
          });
          pill.classList.add("is-selected");
          refreshAvailability();
          var match = findMatchingVariant(currentSelections());
          if (match) selectVariant(match);
        });
      });
    });

    /* Pre-select first available option value in each group so the UI
       isn't blank on load. */
    optionGroups.forEach(function (group) {
      var firstEnabled = group.querySelector(".variant-pill:not(:disabled)") || group.querySelector(".variant-pill");
      if (firstEnabled) firstEnabled.classList.add("is-selected");
    });
    refreshAvailability();

    /* ---------- AJAX add to cart ---------- */
    productForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (addBtn) addBtn.disabled = true;
      var formData = new FormData(productForm);
      fetch("/cart/add.js", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) return res.json().then(function (err) { throw err; });
          return res.json();
        })
        .then(function () {
          return fetch("/cart.js").then(function (r) { return r.json(); });
        })
        .then(function (cart) {
          updateCartCount(cart.item_count);
          if (addText) addText.textContent = "Added ✓";
          setTimeout(function () {
            if (addText) addText.textContent = "Add to Cart";
            if (addBtn) addBtn.disabled = false;
          }, 1600);
        })
        .catch(function (err) {
          console.error("Add to cart failed", err);
          if (addBtn) addBtn.disabled = false;
          if (addText) addText.textContent = (err && err.description) || "Couldn't add to cart";
        });
    });
  }

  /* ---------- Cart page: quantity steppers via Cart API ---------- */
  document.querySelectorAll("[data-cart-qty-decrease], [data-cart-qty-increase]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var line = btn.getAttribute("data-line");
      var input = document.querySelector('[data-cart-qty-input][data-line="' + line + '"]');
      if (!input) return;
      var delta = btn.hasAttribute("data-cart-qty-increase") ? 1 : -1;
      var next = Math.max(0, parseInt(input.value || "0", 10) + delta);
      input.value = next;
      fetch("/cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line: parseInt(line, 10), quantity: next }),
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          window.location.reload();
        });
    });
  });
})();
