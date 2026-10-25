import axios from "axios";
import { Klines, TradesPayload } from "./types";

function getLookbackSeconds(interval: string): number {
  switch (interval) {
    case "1m":
      return 6 * 3600; // 6 hours (360 candles)
    case "5m":
      return 24 * 3600; // 24 hours (288 candles)
    case "15m":
      return 3 * 24 * 3600; // 3 days (288 candles)
    case "1h":
      return 14 * 24 * 3600; // 14 days (336 candles)
    case "4h":
      return 60 * 24 * 3600; // 60 days (360 candles)
    case "1d":
      return 180 * 24 * 3600; // 180 days (180 candles)
    default:
      return 24 * 3600;
  }
}

export async function getKLines(symbol: string, interval: string = "1h"): Promise<Klines[]> {
  const market = (symbol).toUpperCase().replace("-", "_");
  
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - getLookbackSeconds(interval);

  const baseUrl =
    typeof window !== "undefined"
      ? "/api/v1/klines"
      : "https://api.backpack.exchange/api/v1/klines";

  const url = `${baseUrl}?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${now}`;
  const response = await axios.get<Klines[]>(url);
  return response.data;
}

export async function getTrades(symbol : string, limit = 150) {
  const baseUrl = typeof window !== "undefined" ? `/api/v1/trades?symbol=${symbol}&limit=${limit}` : `https://api.backpack.exchange/api/v1/trades?symbol=${symbol}&limit=${limit}`;
  const response  = await axios.get<TradesPayload>(baseUrl);
  return response.data;
}

