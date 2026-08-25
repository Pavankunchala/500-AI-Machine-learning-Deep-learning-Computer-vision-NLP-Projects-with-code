export type ShippingQuote = {
  amount: number;
  eta: string;
  label: string;
  codFee: (orderValue: number) => number;
};

export function quoteShipping(pincode: string, subtotal: number): ShippingQuote {
  const pin = pincode.replace(/\D/g, "");
  const first = pin[0];

  if (pin.length !== 6) {
    return {
      amount: 0,
      eta: "Enter a 6-digit PIN",
      label: "We'll calculate shipping from your PIN",
      codFee: () => 0,
    };
  }

  const rajasthan = first === "3";
  const metro = ["1", "4", "5", "6", "7"].includes(first);
  const freeOver = 999;

  let amount = metro ? 79 : 99;
  let eta = metro ? "2–4 days" : "4–7 days";
  let label = "Standard courier";

  if (rajasthan) {
    amount = subtotal >= 499 ? 0 : 49;
    eta = "1–3 days";
    label = amount === 0 ? "Rajasthan — complimentary" : "Rajasthan ground shipping";
  } else if (subtotal >= freeOver) {
    amount = 0;
    label = "Complimentary shipping";
  }

  return {
    amount,
    eta,
    label,
    codFee: (orderValue) => (orderValue < 500 ? 30 : 0),
  };
}

export const COUPONS: Record<string, number> = {
  WELCOME10: 0.1,
  FAMILY5: 0.05,
  CHAKKI15: 0.15,
};
