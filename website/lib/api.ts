import axios from "axios";

const client = axios.create();

// Attach x-wallet-address header from localStorage for browser requests
client.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined") {
      const wallet = localStorage.getItem("wallet_address");
      if (wallet) {
        config.headers = config.headers || {};
        config.headers["x-wallet-address"] = wallet;
      }
    }
  } catch (err) {
    // ignore
  }
  return config;
});

export function setWalletAddress(address: string | null) {
  if (typeof window === "undefined") return;
  if (address) localStorage.setItem("wallet_address", address);
  else localStorage.removeItem("wallet_address");
}

export default client;
