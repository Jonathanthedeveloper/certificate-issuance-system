// Helper to build Solana Explorer URLs using environment variables.
// Client-side env must use NEXT_PUBLIC_ prefix.
const EXPLORER_BASE =
  process.env.NEXT_PUBLIC_SOLANA_EXPLORER_BASE || "https://explorer.solana.com";
const CLUSTER = process.env.NEXT_PUBLIC_SOLANA_EXPLORER_CLUSTER || "devnet";

export function txUrl(signature: string) {
  return `${EXPLORER_BASE}/tx/${signature}?cluster=${CLUSTER}`;
}

export function addressUrl(address: string) {
  return `${EXPLORER_BASE}/address/${address}?cluster=${CLUSTER}`;
}

export default { txUrl, addressUrl };
