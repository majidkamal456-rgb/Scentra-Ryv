"use client";

const WHATSAPP = "923177478167";

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I need help with Scentra Ryv")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="whatsapp-float"
    >
      <svg
        className="whatsapp-float__icon"
        width={24}
        height={24}
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.01 3C9.39 3 4.02 8.37 4.02 14.99c0 2.64.86 5.08 2.33 7.07L4 29l7.15-2.28A11.9 11.9 0 0 0 16.01 27C22.63 27 28 21.63 28 14.99 28 8.37 22.63 3 16.01 3zm6.6 16.9c-.28.78-1.62 1.48-2.26 1.58-.58.09-1.31.13-2.12-.13-.49-.16-1.12-.36-1.93-.71-3.4-1.47-5.61-4.9-5.78-5.13-.17-.22-1.37-1.82-1.37-3.47 0-1.65.86-2.46 1.17-2.8.3-.33.66-.42.88-.42h.65c.21 0 .49-.08.76.58.28.68.94 2.35 1.02 2.52.08.17.14.37.03.59-.11.22-.17.37-.33.57-.17.2-.35.44-.5.59-.17.17-.34.35-.15.69.2.33.88 1.45 1.89 2.35 1.3 1.15 2.4 1.51 2.73 1.68.34.17.53.14.73-.08.2-.22.85-.99 1.08-1.33.22-.34.45-.28.76-.17.31.11 1.98.93 2.32 1.1.34.17.57.25.65.39.09.14.09.8-.19 1.58z" />
      </svg>
    </a>
  );
}
