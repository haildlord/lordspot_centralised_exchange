import axios from "axios";
import { cacheLife } from "next/cache";
import { Market, Ticker, Depth, TradesPayload } from "./types";

export async function getMarkets(): Promise<Market[]> {
    "use cache";
    cacheLife("minutes");
    const response = await axios.get<Market[]>("https://api.backpack.exchange/api/v1/markets");
    return response.data;
}

export async function getTickers(): Promise<Ticker[]> {
    "use cache";
    cacheLife("minutes");
    const response = await axios.get<Ticker[]>("https://api.backpack.exchange/api/v1/tickers");
    return response.data;
}

export async function getDepth(symbol : string) {
    const response = await axios.get<Depth>(`https://api.backpack.exchange/api/v1/depth?symbol=${symbol}`);
    return response.data;
}
