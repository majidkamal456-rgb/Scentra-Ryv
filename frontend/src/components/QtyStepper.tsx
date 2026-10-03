"use client";

type Props = {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
};

export function QtyStepper({ value, min = 1, max, onChange }: Props) {
  return (
    <div className="qty-stepper">
      <button
        type="button"
        className="qty-stepper__btn"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <span className="qty-stepper__value" aria-live="polite">{value}</span>
      <button
        type="button"
        className="qty-stepper__btn"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
