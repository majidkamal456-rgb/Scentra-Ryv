"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { errorMessage, formatPrice, submitCheckout, type SiteConfig } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { calculateShipping } from "@/lib/shipping";
import { useToast } from "@/lib/toast";

const DRAFT_KEY = "scentra_checkout_draft";
const PHONE_RE = /^03[0-9]{9}$/;
const MAX_FILE = 5 * 1024 * 1024;

type PaymentMethod = "cod" | "bank_transfer";

type Draft = {
  full_name: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  notes: string;
  payment_method: PaymentMethod;
};

const EMPTY_DRAFT: Draft = {
  full_name: "",
  phone: "",
  city: "",
  address: "",
  email: "",
  notes: "",
  payment_method: "cod",
};

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const data = JSON.parse(raw) as Partial<Draft>;
    return {
      ...EMPTY_DRAFT,
      ...data,
      payment_method: data.payment_method === "bank_transfer" ? "bank_transfer" : "cod",
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function CheckoutClient({ config }: { config: SiteConfig }) {
  const { ready, items, subtotal, count, clear } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [restored, setRestored] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Restore saved draft once on mount, then persist on every change.
  useEffect(() => {
    setDraft(loadDraft());
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore quota errors */
    }
  }, [draft, restored]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const rates = useMemo(
    () => ({ nearby: parseFloat(config.shipping_nearby_rate), remote: parseFloat(config.shipping_other_rate) }),
    [config],
  );
  const shipping = calculateShipping(
    count,
    draft.city,
    rates,
    config.remote_cities,
    draft.address,
    config.remote_provinces,
    config.nearby_cities,
    config.nearby_provinces,
  );
  const total = subtotal + shipping;

  const setField = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  function isValidPhone(phone: string) {
    return PHONE_RE.test(phone || "");
  }

  function onPhoneChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setField("phone", digits);
    if (phoneError && isValidPhone(digits)) setPhoneError("");
  }

  function checkPhone(phone: string) {
    if (!phone) {
      setPhoneError("Phone number is required.");
      return false;
    }
    if (!isValidPhone(phone)) {
      setPhoneError("Enter a valid 11-digit number starting with 03 (e.g. 03001234567).");
      return false;
    }
    setPhoneError("");
    return true;
  }

  function setPreview(f: File) {
    if (f.size > MAX_FILE) {
      showToast("File must be under 5MB.", "error");
      return;
    }
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPreview(f);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      if (fileInput.current) {
        try {
          fileInput.current.files = e.dataTransfer.files;
        } catch {
          /* some browsers disallow assigning FileList */
        }
      }
      setPreview(f);
    }
  }

  function copyAccountNumber() {
    const value = config.bank_details.account_number;
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    if (!checkPhone(draft.phone)) return;
    if (draft.payment_method === "bank_transfer" && !file) return;

    setSubmitting(true);
    const fd = new FormData();
    fd.set("full_name", draft.full_name);
    fd.set("phone", draft.phone);
    fd.set("city", draft.city);
    fd.set("address", draft.address);
    fd.set("email", draft.email);
    fd.set("notes", draft.notes);
    fd.set("payment_method", draft.payment_method);
    if (file) fd.set("payment_screenshot", file);
    fd.set(
      "items",
      JSON.stringify(items.map((i) => ({ product_id: i.productId, quantity: i.quantity, size: i.size }))),
    );

    try {
      const result = await submitCheckout(fd);
      clear();
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      router.push(`/order/${result.order_number}`);
    } catch (err: unknown) {
      const msg = errorMessage(err, "Checkout failed. Please try again.");
      setServerError(msg);
      showToast(msg, "error");
      setSubmitting(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <section className="page-shell">
        <div className="page-hero fade-section visible">
          <p className="section-eyebrow">Secure</p>
          <h1 className="section-heading mt-3">Checkout</h1>
          <div className="gold-divider" />
        </div>
        <div className="py-20 text-center">
          <p className="text-brand-mute">Your cart is empty.</p>
          <Link href="/" className="btn-gold mt-8 inline-block">Continue Shopping</Link>
        </div>
      </section>
    );
  }

  const paymentCard = (method: PaymentMethod) =>
    `relative cursor-pointer border p-6 transition duration-300 ${
      draft.payment_method === method
        ? "border-brand-gold bg-brand-gold/5 shadow-[var(--shadow-gold-soft)]"
        : "border-brand-gold/20 hover:border-brand-gold/40"
    }`;

  return (
    <section className="page-shell">
      <div className="page-hero fade-section visible">
        <p className="section-eyebrow">Secure</p>
        <h1 className="section-heading mt-3">Checkout</h1>
        <div className="gold-divider" />
        <p className="mx-auto mt-4 max-w-xl text-sm text-brand-mute">
          You can leave anytime — your cart and filled form details stay saved.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid gap-10 lg:grid-cols-3 lg:gap-12" encType="multipart/form-data" noValidate>
        <div className="space-y-6 lg:col-span-2">
          <div className="surface p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-brand-gold">Delivery Details</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="form-label" htmlFor="full_name">Full Name *</label>
                <input
                  id="full_name"
                  name="full_name"
                  required
                  className="form-input"
                  placeholder="Your full name"
                  value={draft.full_name}
                  onChange={(e) => setField("full_name", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  required
                  inputMode="numeric"
                  maxLength={11}
                  className="form-input"
                  placeholder="03XXXXXXXXX"
                  value={draft.phone}
                  onChange={onPhoneChange}
                  onBlur={() => checkPhone(draft.phone)}
                />
                <p className="mt-1 text-xs text-brand-mute">11 digits only — e.g. 03001234567</p>
                {phoneError && <p className="mt-1 text-sm text-red-300">{phoneError}</p>}
              </div>
              <div>
                <label className="form-label" htmlFor="city">City *</label>
                <input
                  id="city"
                  name="city"
                  required
                  className="form-input"
                  placeholder="City"
                  value={draft.city}
                  onChange={(e) => setField("city", e.target.value)}
                />
                <p className="mt-2 text-xs leading-relaxed text-brand-mute">
                  Punjab: {formatPrice(rates.nearby)}. Sindh, Balochistan &amp; KPK: {formatPrice(rates.remote)}.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="form-label" htmlFor="address">Full Address *</label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={3}
                  className="form-input"
                  placeholder="House no, street, area"
                  value={draft.address}
                  onChange={(e) => setField("address", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="email">Email (optional)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="Email (optional)"
                  value={draft.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="notes">Order Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  className="form-input"
                  placeholder="Order notes (optional)"
                  value={draft.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="surface p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-brand-gold">Payment Method</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className={paymentCard("cod")}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  className="sr-only"
                  checked={draft.payment_method === "cod"}
                  onChange={() => setField("payment_method", "cod")}
                />
                <span className="absolute right-4 top-4 bg-brand-gold px-2 py-0.5 text-[10px] uppercase tracking-widest text-brand-black">
                  Recommended
                </span>
                <h3 className="font-serif text-xl text-brand-cream">Cash on Delivery</h3>
                <p className="mt-2 text-sm text-brand-mute">Pay in cash when your order arrives at your doorstep.</p>
              </label>

              <label className={paymentCard("bank_transfer")}>
                <input
                  type="radio"
                  name="payment_method"
                  value="bank_transfer"
                  className="sr-only"
                  checked={draft.payment_method === "bank_transfer"}
                  onChange={() => setField("payment_method", "bank_transfer")}
                />
                <h3 className="font-serif text-xl text-brand-cream">Online Bank Transfer</h3>
                <p className="mt-2 text-sm text-brand-mute">Transfer to our bank account and upload payment proof.</p>
              </label>
            </div>

            {draft.payment_method === "bank_transfer" && (
              <div className="mt-8 animate-fade-in border border-brand-gold/20 bg-brand-black/60 p-6">
                <h3 className="font-serif text-lg text-brand-gold">Bank Account Details</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-brand-gold/10 pb-2">
                    <dt className="text-brand-mute">Bank Name</dt>
                    <dd className="text-brand-cream">{config.bank_details.bank_name}</dd>
                  </div>
                  <div className="flex justify-between border-b border-brand-gold/10 pb-2">
                    <dt className="text-brand-mute">Account Title</dt>
                    <dd className="text-brand-cream">{config.bank_details.account_title}</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-brand-gold/10 pb-2">
                    <dt className="text-brand-mute">Account Number</dt>
                    <dd className="flex items-center gap-2 text-brand-cream">
                      {config.bank_details.account_number}
                      <button type="button" onClick={copyAccountNumber} className="text-xs text-brand-gold underline">
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-brand-gold/10 pb-2">
                    <dt className="text-brand-mute">IBAN</dt>
                    <dd className="text-brand-cream">{config.bank_details.iban}</dd>
                  </div>
                  {config.bank_details.branch_code && (
                    <div className="flex justify-between pb-2">
                      <dt className="text-brand-mute">Branch Code</dt>
                      <dd className="text-brand-cream">{config.bank_details.branch_code}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-6 text-sm text-brand-cream/60">
                  Please transfer the exact order total to the account above, then upload a screenshot of your payment
                  confirmation below. Your order will be processed once we verify the payment.
                </p>

                <div className="mt-6">
                  <label className="form-label">Upload Payment Screenshot *</label>
                  <div
                    className={`relative border border-dashed p-8 text-center transition hover:border-brand-gold/60 ${
                      dragOver ? "border-brand-gold bg-brand-gold/5" : "border-brand-gold/30"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                    }}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInput}
                      type="file"
                      name="payment_screenshot"
                      id="payment-screenshot"
                      accept="image/jpeg,image/png,application/pdf"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={handleFileSelect}
                    />
                    {!file ? (
                      <div>
                        <svg className="mx-auto h-10 w-10 text-brand-gold/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-2 text-sm text-brand-mute">Drag &amp; drop or click to upload</p>
                        <p className="text-xs text-brand-mute/60">JPG, PNG, or PDF — max 5MB</p>
                      </div>
                    ) : (
                      <div>
                        {previewUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={previewUrl} alt="Payment preview" className="mx-auto max-h-40 object-contain" />
                        )}
                        <p className="mt-2 text-sm text-brand-gold">{file.name}</p>
                      </div>
                    )}
                  </div>
                  {draft.payment_method === "bank_transfer" && !file && submitted && (
                    <p className="mt-2 text-sm text-red-300">Payment screenshot is required.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="surface-elevated h-fit p-7 lg:sticky lg:top-28 lg:p-8">
          <h2 className="font-serif text-2xl text-brand-gold">Order Summary</h2>
          <ul className="mt-6 space-y-3 text-sm text-brand-cream/70">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}`} className="flex justify-between gap-4">
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span className="shrink-0">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between text-brand-cream/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-cream/70">
              <span>Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="gold-divider my-4!" />
            <div className="flex justify-between font-serif text-xl text-brand-gold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          {serverError && <p className="mt-4 text-sm text-red-300">{serverError}</p>}
          <button type="submit" className="btn-gold-filled mt-8 w-full" disabled={submitting || !ready}>
            {submitting ? "Processing..." : "Place Order"}
          </button>
          <Link href="/" className="btn-ghost mt-4 block w-full text-center">Continue Shopping</Link>
          <p className="mt-3 text-center text-xs text-brand-mute">Cart &amp; form details stay saved.</p>
        </aside>
      </form>
    </section>
  );
}
