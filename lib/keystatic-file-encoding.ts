export function decodeKeystaticFileContents(encoded: string): string {
  const binString = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeKeystaticFileContents(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join(
    "",
  );
  return btoa(binString);
}
