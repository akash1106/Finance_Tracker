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
