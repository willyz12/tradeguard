import { createHmac } from "node:crypto";

const TESTNET_BASE_URL = "https://testnet.binance.vision";

/**
 * Binance's HMAC-SHA256 request signing for SIGNED endpoints: sign the full
 * query string with your API secret, send the resulting hex digest as the
 * `signature` param. Pure function - no network - so it's genuinely testable
 * (see selfcheck.ts). This validates the *shape* of the signing logic; it
 * does not confirm this matches Binance's own reference implementation
 * byte-for-byte, since this sandbox has no network to check that against
 * their docs. Cross-check against Binance's API documentation yourself
 * before trusting it with a real testnet key.
 */
export function sign(queryString: string, apiSecret: string): string {
  return createHmac("sha256", apiSecret).update(queryString).digest("hex");
}

export interface TestnetOrderParams {
  symbol: string; // e.g. "BTCUSDT"
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT";
  quantity: string; // Binance wants a string here, not a number, to avoid float issues
  price?: string; // required for LIMIT
  timeInForce?: "GTC" | "IOC" | "FOK"; // required for LIMIT
}

/**
 * *** UNVERIFIED - NEEDS NETWORK THIS SANDBOX DOES NOT HAVE ***
 * Places a test order against Binance's public Spot Testnet (fake funds,
 * completely separate from Agent OS and your real account). Needs
 * BINANCE_TESTNET_API_KEY/SECRET from https://testnet.binance.vision.
 *
 * Never paste those keys into a chat with an AI assistant, including this
 * one - keep them in your local .env only, and only there.
 */
export async function placeTestnetOrder(
  params: TestnetOrderParams,
  apiKey: string,
  apiSecret: string
): Promise<unknown> {
  const query = new URLSearchParams({
    ...params,
    timestamp: String(Date.now()),
    recvWindow: "5000",
  });
  const signature = sign(query.toString(), apiSecret);
  query.set("signature", signature);

  const response = await fetch(`${TESTNET_BASE_URL}/api/v3/order?${query.toString()}`, {
    method: "POST",
    headers: { "X-MBX-APIKEY": apiKey },
  });

  if (!response.ok) {
    throw new Error(`Testnet order failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}
