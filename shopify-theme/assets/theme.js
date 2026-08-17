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

  /* ---------- Scroll story: pinned three-chapter cinema hero ----------
     Ports the Next.js/Framer Motion version's scroll-progress mapping to
     vanilla JS: raw scroll progress (0-1 across the stage) is smoothed
     with a simple lerp toward the target each frame (approximating the
     spring), then fed through the same interpolation breakpoints used in
     the React build so the two versions move identically. */
  function initScrollStory() {
    var root = document.querySelector("[data-scroll-story]");
    if (!root) return;
    var stage = root.querySelector("[data-story-stage]");
    var sticky = root.querySelector("[data-story-sticky]");
    var backgrounds = root.querySelectorAll("[data-story-background]");
    var copies = root.querySelectorAll("[data-story-copy]");
    var indexes = root.querySelectorAll("[data-story-index]");
    var railStems = root.querySelectorAll("[data-story-rail]");
    var product = root.querySelector("[data-story-product]");
    var cue = root.querySelector("[data-story-cue]");
    var header = document.getElementById("SiteHeader");

    function setHeaderOffset() {
      var h = header ? header.getBoundingClientRect().height : 0;
      root.style.setProperty("--story-header-h", h + "px");
    }
    setHeaderOffset();
    window.addEventListener("resize", setHeaderOffset);

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* interpolate(t, [in...], [out...]) — piecewise-linear, clamps at ends */
    function interpolate(t, inputRange, outputRange) {
      if (t <= inputRange[0]) return outputRange[0];
      var last = inputRange.length - 1;
      if (t >= inputRange[last]) return outputRange[last];
      for (var i = 0; i < last; i++) {
        if (t >= inputRange[i] && t <= inputRange[i + 1]) {
          var span = inputRange[i + 1] - inputRange[i];
          var localT = span === 0 ? 0 : (t - inputRange[i]) / span;
          return outputRange[i] + localT * (outputRange[i + 1] - outputRange[i]);
        }
      }
      return outputRange[last];
    }

    /* interpolate a "<number><unit>" string array, e.g. ["15vw","-16vw"] */
    function interpolateUnit(t, inputRange, outputRange) {
      var unit = String(outputRange[0]).replace(/[-\d.]/g, "");
      var nums = outputRange.map(function (v) { return parseFloat(v); });
      return interpolate(t, inputRange, nums) + unit;
    }

    var CHAPTERS = [
      { window: [0, 0.001, 0.24, 0.34], opacity: [1, 1, 1, 0] },
      { window: [0.24, 0.38, 0.58, 0.71], opacity: [0, 1, 1, 0] },
      { window: [0.6, 0.76, 1, 1.05], opacity: [0, 1, 1, 0] },
    ];
    var Y_RANGE = [38, 0, 0, -38];

    function applyProgress(p) {
      /* Product journey */
      var x = interpolateUnit(p, [0, 0.27, 0.55, 0.8, 1], ["15vw", "14vw", "-16vw", "12vw", "11vw"]);
      var y = interpolateUnit(p, [0, 0.27, 0.55, 0.8, 1], ["14vh", "5vh", "-5vh", "2vh", "10vh"]);
      var scale = interpolate(p, [0, 0.3, 0.63, 1], [0.78, 1.04, 0.9, 1.05]);
      var rotate = interpolate(p, [0, 0.31, 0.66, 1], [-10, 2, -8, 5]);
      if (product) {
        product.style.transform =
          "translate(-50%, -50%) translate(" + x + ", " + y + ") scale(" + scale + ") rotate(" + rotate + "deg)";
      }

      /* Backgrounds */
      var bgY = interpolate(p, [0, 1], [0, -6]) + "%";
      var opacities = [
        interpolate(p, [0, 0.22, 0.33], [1, 1, 0]),
        interpolate(p, [0.22, 0.38, 0.58, 0.7], [0, 1, 1, 0]),
        interpolate(p, [0.58, 0.77, 1], [0, 1, 1]),
      ];
      backgrounds.forEach(function (bg, i) {
        bg.style.opacity = opacities[i];
        bg.style.transform = "translateY(" + bgY + ")";
      });

      /* Chapter copy blocks */
      copies.forEach(function (copy, i) {
        var ch = CHAPTERS[i];
        var op = interpolate(p, ch.window, ch.opacity);
        var ty = interpolate(p, ch.window, Y_RANGE);
        copy.style.opacity = op;
        copy.style.transform = "translateY(calc(-50% + " + ty + "px))";
      });

      /* Chapter rail + oversized numerals share the background opacity
         curves for chapters 1 & 3, and a slightly different one for the
         rail's chapter 2 (matches the React build's chapterTwoActive). */
      var railOpacities = [
        interpolate(p, [0, 0.28, 0.35], [1, 1, 0.25]),
        interpolate(p, [0.25, 0.42, 0.63, 0.72], [0.25, 1, 1, 0.25]),
        interpolate(p, [0.62, 0.8, 1], [0.25, 1, 1]),
      ];
      railStems.forEach(function (stem, i) {
        stem.style.opacity = railOpacities[i];
      });
      indexes.forEach(function (idx, i) {
        idx.style.opacity = opacities[i];
      });

      if (cue) cue.style.opacity = opacities[0];
    }

    if (prefersReducedMotion) {
      stage.classList.add("is-reduced-motion");
      applyProgress(0);
      copies.forEach(function (copy, i) {
        copy.style.opacity = i === 0 ? 1 : 0;
        copy.style.transform = "translateY(-50%)";
      });
      indexes.forEach(function (idx, i) {
        idx.style.opacity = i === 0 ? 1 : 0;
      });
      if (product) product.style.transform = "translate(-50%, -50%)";
      return;
    }

    var targetProgress = 0;
    var smoothProgress = 0;
    var ticking = false;

    function computeTargetProgress() {
      var rect = stage.getBoundingClientRect();
      var stageHeight = stage.offsetHeight;
      var viewportHeight = window.innerHeight;
      var scrollable = stageHeight - viewportHeight;
      if (scrollable <= 0) return 0;
      var scrolled = -rect.top;
      var p = scrolled / scrollable;
      return Math.min(1, Math.max(0, p));
    }

    function onScroll() {
      targetProgress = computeTargetProgress();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    function tick() {
      smoothProgress += (targetProgress - smoothProgress) * 0.14;
      if (Math.abs(smoothProgress - targetProgress) < 0.0005) smoothProgress = targetProgress;
      applyProgress(smoothProgress);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  initScrollStory();

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
