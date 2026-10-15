import { Depth, BookLevel } from "./types"

export function formatOrderBook(rawDepth: Depth, sliceCount = 20) :  {finalAsks: BookLevel[], finalBids: BookLevel[], midPrice: string, spread: string, buyPct: number} {

    let askSum = 0;
    let bidSum = 0;

    let sortedAsks = [...rawDepth.asks].sort((a, b) => Number(a[0]) - Number(b[0]));
    sortedAsks = sortedAsks.slice(0, sliceCount);
    let finalAsks : BookLevel[] = sortedAsks.map((item) => {
        askSum += parseFloat(item[1])
        return {
            price: item[0],
            size : item[1],
            total : askSum.toFixed(2),
            depth : 0
        }
    })

    let sortedBids = [...rawDepth.bids].sort((a,b)    => Number(b[0]) - Number(a[0]));
    sortedBids = sortedBids.slice(0, sliceCount);
    let finalBids : BookLevel[] = sortedBids.map((item) => {
        bidSum += parseFloat(item[1]);
        return {
            price: item[0],
            size : item[1],
            total : bidSum.toFixed(2),
            depth : 0
        }
    })
    
    finalAsks = finalAsks.map((item) => {
        return {
            ...item,
            depth: askSum > 0 ? Number(item.total) / askSum : 0
        }
    })

    finalBids = finalBids.map((item) => {
        return {
            ...item,
            depth: bidSum > 0 ? Number(item.total) / bidSum : 0
        }
    })


    const bestAsk = Number(finalAsks[0]?.price); // e.g. 150.10
    const bestBid = Number(finalBids[0]?.price); // e.g. 149.90

    const midPrice = ((bestAsk + bestBid) / 2).toFixed(2); // 150.00
    const spread = (bestAsk - bestBid).toFixed(2);          // 0.20

    let totalVolume = askSum + bidSum;
    const buyPct = totalVolume > 0 ? Math.round((bidSum / totalVolume) * 100) : 50; 

    return {finalAsks, finalBids, midPrice, spread, buyPct}
}