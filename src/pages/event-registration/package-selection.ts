export function reconcilePackageSelection(
  packageIds: string[],
  current: string,
) {
  if (packageIds.length === 1) return packageIds[0];
  return packageIds.includes(current) ? current : "";
}
