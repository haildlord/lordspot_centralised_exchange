export type Side = "buy" | "sell";

export type Trend = "up" | "down" | "flat";

export interface OrderBookData {
  asks: BookLevel[];
  bids: BookLevel[];
  lastPrice: string;
  trend: Trend;
  buyPct: number;
}

export interface RecentTrade {
  id: string | number;
  price: string;
  qty: string;
  time: string;
  side: Side;
}


// * Backpack Types :

export interface fFunction {
  base    : string,    // "0.1",
  factor  : string,    // "0.0006",
  type    : "sqrt"
}

export interface Band {
  maxMultiplier     : string,   // "1.15"
  minMultiplier     : string    // "0.85"
}

export interface Price {
  borrowEntryFeeMaxMultiplier       : string    | null,  // "1.01"
  borrowEntryFeeMinMultiplier       : string    | null,  // "0.99"
  discoveryBoundBand                : Band | null,
  maxImpactMultiplier               : string,            // "1.05"
  maxMultiplier                     : string,            // "2"
  maxPrice                          : string    | null,  // "1000000" 
  maxPriceUpdateMultiplier          : string    | null,  // "1.005"
  meanMarkPriceBand                 : Band      | null,  // "1.1"
  meanPremiumBand                   : { tolerancePct : string } | null,
  minImpactMultiplier               : string,
  minMultiplier                     : string,
  minPrice                          : string,
  minPriceUpdateMultiplier          : string    | null,
  tickSize                          : string,
}

export interface Quantity {
  maxQuantity : null,
  minQuantity : string,
  stepSize    : string
}

export interface Filter {
  price         : Price,
  quantity      : Quantity
}

export interface Market {
  baseSymbol                  : string,
  createdAt                   : string,
  filters                     : Filter,
  fundingInterval             : number  | null,
  fundingRateLowerBound       : string  | null,       // "-100"
  fundingRateUpperBound       : string  | null,
  imfFunction                 : fFunction | null,
  marketType                  : "SPOT"  | "PERP",
  mmfFunction                 : fFunction | null,  
  openInterestLimit           : string  | null,        // "20000000"
  orderBookState              : "Open"  | "Closed",
  positionLimitWeight         :  string | null,        // "4" 
  quoteSymbol                 : "USDC",
  rwaMarketType               : "STOCK" | "INDEX" | null,
  symbol                      : string,                 // LTC_USDC_PERP or "DEEP_USDC"
  visible                     : boolean
}

export interface Ticker {
  firstPrice          : string;
  high                : string;
  lastPrice           : string;
  low                 : string;
  priceChange         : string;
  priceChangePercent  : string; // e.g. "-0.076591"
  quoteVolume         : string;
  symbol              : string; // e.g. "NEAR_USDC"
  trades              : string;
  volume              : string;
}

export type OrderBookLevel = [string, string];

export interface Depth {
  asks          : OrderBookLevel[];
  bids          : OrderBookLevel[];
  lastUpdateId  : string;
  timestamp     : number;
}

export interface BookLevel {
  price: string;
  size: string;
  total: string;
  depth: number;
}

export interface DepthPayload {
  params: string
}

export interface DepthResponse {
   stream  : string,                // "depth.SOL_USDC"
   data    : {
      E      : number,
      T      : number,
      U      : number,
      a      : Record<string, string>[],
      b      : Record<string, string>[],
      e      : string,
      s      : string,
      u      : number   
   }
}