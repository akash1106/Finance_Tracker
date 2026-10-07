/**
 * Format a number into standard Indian Rupee currency format (e.g., ₹1,25,000).
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  showDecimals: boolean = false
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
}

/**
 * Format a number into compact Indian Rupee format (e.g., ₹4.7L, ₹1.2 Cr, ₹25k).
 */
export function formatCompactCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 10000000) {
    const cr = abs / 10000000;
    return `${sign}₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  if (abs >= 100000) {
    const l = abs / 100000;
    return `${sign}₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)}L`;
  }
  if (abs >= 10000) {
    const k = abs / 1000;
    return `${sign}₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return formatCurrency(num);
}
