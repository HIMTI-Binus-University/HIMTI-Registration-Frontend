export type PricedPackage = {
  currency: string;
  priceMinor: string;
};

export function formatMoney(amountMinor: string, currency: string) {
  const amount = Number(amountMinor);
  if (!Number.isSafeInteger(amount)) return `${currency} ${amountMinor}`;

  try {
    const formatter = new Intl.NumberFormat("en-ID", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const minorDigits =
      new Intl.NumberFormat("en", {
        style: "currency",
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2;
    return formatter.format(amount / 10 ** minorDigits);
  } catch {
    return `${currency} ${amountMinor}`;
  }
}

export function formatPackageAmount(pkg: PricedPackage) {
  return pkg.priceMinor === "0"
    ? "Free - no payment required"
    : formatMoney(pkg.priceMinor, pkg.currency);
}
