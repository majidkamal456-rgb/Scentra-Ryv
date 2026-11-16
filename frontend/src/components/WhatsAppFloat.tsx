type Props = {
  whatsappNumber: string;
};

export function WhatsAppFloat({ whatsappNumber }: Props) {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I need help with Scentra Ryv")}`;

  return (
    <a
      href={href}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <svg className="whatsapp-float__icon" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
        <path d="M16.01 3C9.39 3 4.02 8.37 4.02 14.99c0 2.64.86 5.08 2.33 7.07L4 29l7.15-2.28A11.9 11.9 0 0 0 16.01 27C22.63 27 28 21.63 28 14.99 28 8.37 22.63 3 16.01 3zm6.6 16.96c-.27.77-1.6 1.41-2.23 1.5-.57.08-1.3.12-2.1-.13-.49-.15-1.11-.36-1.91-.7-3.37-1.46-5.56-4.86-5.73-5.09-.17-.23-1.38-1.84-1.38-3.51 0-1.67.88-2.49 1.19-2.83.31-.34.68-.42.9-.42.23 0 .45 0 .65.01.21.01.49-.08.76.58.27.67.93 2.27 1.01 2.44.08.17.14.37.03.59-.11.23-.17.37-.34.57-.17.2-.35.44-.5.59-.17.17-.34.35-.15.69.2.34.88 1.45 1.89 2.35 1.3 1.16 2.4 1.52 2.74 1.69.34.17.54.14.74-.08.2-.23.85-.99 1.08-1.33.23-.34.45-.28.76-.17.31.11 1.97.93 2.31 1.1.34.17.57.25.65.39.09.14.09.8-.18 1.57z" />
      </svg>
      <span className="whatsapp-float__label">Support</span>
    </a>
  );
}
