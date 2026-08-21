function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(bytes % (1024 * 1024) ? 1 : 0)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

export function validateProofFile(
  file: File,
  acceptedTypes: readonly string[],
  maxBytes: number,
) {
  if (!acceptedTypes.includes(file.type))
    return "Choose an accepted JPG, PNG, WebP, or PDF file.";
  if (file.size > maxBytes)
    return `The file must be ${formatBytes(maxBytes)} or smaller.`;
  return undefined;
}
