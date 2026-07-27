import { PAYMENT_METHODS } from "../constants";
import type { PaymentMethod } from "../types";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export default function PaymentMethodSelector({
  selected,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/42">
        Select payment method
      </legend>

      <div className="grid gap-2 sm:grid-cols-2">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selected === method.id;
          return (
            <label
              key={method.id}
              className={
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all" +
                (isSelected
                  ? " border-foreground bg-secondary/25"
                  : " border-border bg-background hover:border-foreground/40")
              }
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={isSelected}
                onChange={() => onSelect(method.id)}
                className="sr-only"
                disabled={disabled}
                aria-label={method.label}
              />
              <span className="text-xl" aria-hidden="true">
                {method.icon}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{method.label}</p>
                <p className="mt-0.5 text-xs text-foreground/56">
                  {method.description}
                </p>
              </div>
              {isSelected && (
                <div className="grid size-5 place-items-center rounded-full bg-foreground text-background">
                  <span className="size-2 rounded-full bg-background" />
                </div>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
