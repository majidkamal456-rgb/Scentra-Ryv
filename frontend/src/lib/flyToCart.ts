/** Animate product thumbnail from a source element into the header cart. */
export function flyToCart(sourceEl: HTMLElement | null, imageSrc: string) {
  if (typeof window === "undefined") return;

  const cart =
    document.getElementById("cart-trigger") ||
    document.getElementById("header-cart-btn");
  if (!sourceEl || !cart) return;

  const from = sourceEl.getBoundingClientRect();
  const to = cart.getBoundingClientRect();

  const flyer = document.createElement("div");
  flyer.setAttribute("aria-hidden", "true");
  Object.assign(flyer.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - 28}px`,
    top: `${from.top + from.height / 2 - 28}px`,
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    overflow: "hidden",
    zIndex: "9999",
    pointerEvents: "none",
    boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
    border: "1px solid rgba(201,162,74,0.45)",
    background: "var(--surface, #0c0c0c)",
    transition:
      "left 0.75s cubic-bezier(0.22, 1, 0.36, 1), top 0.75s cubic-bezier(0.22, 1, 0.36, 1), width 0.75s cubic-bezier(0.22, 1, 0.36, 1), height 0.75s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease 0.55s, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)",
    transform: "scale(1) rotate(-8deg)",
  });

  const img = document.createElement("img");
  img.src = imageSrc;
  img.alt = "";
  Object.assign(img.style, {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  });
  flyer.appendChild(img);
  document.body.appendChild(flyer);

  // Force layout, then animate to cart
  flyer.getBoundingClientRect();
  requestAnimationFrame(() => {
    const cartCenterX = to.left + to.width / 2 - 14;
    const cartCenterY = to.top + to.height / 2 - 14;
    flyer.style.left = `${cartCenterX}px`;
    flyer.style.top = `${cartCenterY}px`;
    flyer.style.width = "28px";
    flyer.style.height = "28px";
    flyer.style.transform = "scale(0.35) rotate(12deg)";
    flyer.style.opacity = "0.15";
  });

  cart.classList.add("cart-bump");
  window.setTimeout(() => {
    cart.classList.remove("cart-bump");
    flyer.remove();
  }, 800);
}
