"use client";

import { getKLines } from "@/lib/klines";
import { SignalingManager } from "@/lib/SignalingManager";
import { createChart, CandlestickSeries, type UTCTimestamp } from "lightweight-charts";
import { useEffect, useRef } from "react";

export function ChartPanel({ symbol }: { symbol: string }) {

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const currentCandleRef = useRef<{
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null);

  async function fetchKLines() {
    const response = await getKLines(symbol);
    return response;
  }

  useEffect(() => {

    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400,
      layout: {
        background: { color: "#0d0e12" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    fetchKLines()
      .then((rawData) => {
        if (Array.isArray(rawData) && rawData.length > 0) {
          const data = rawData.map((item) => {
            const time  = Math.floor(new Date(item.start).getTime() / 1000);
            const open  = parseFloat(item.open);
            const high  = parseFloat(item.high);
            const low   = parseFloat(item.low);
            const close = parseFloat(item.close); 
          
            return {
              time: time as any,
              open,
              high,
              low,
              close,
            };
          });

          data.sort((a, b) => Number(a.time) - Number(b.time));
          candlestickSeries.setData(data);
          currentCandleRef.current = data[data.length - 1];
        }
      })
      .catch((err) => {
        console.error("Error fetching klines:", err);
      });

    const id : number = SignalingManager.getInstance().subscribe("trade", symbol, (trade) => {
      
      if(!currentCandleRef.current) return;
      
      const price = parseFloat(trade.p ?? trade.price);
      if(isNaN(price)) return;

      const tradeTime = Math.floor((trade.T ?? trade.E ?? Date.now()) / 1000);
      const candleInterval = 3600; // 1 hour
      const candleStartTime = Math.floor(tradeTime / candleInterval) * candleInterval;

      if (candleStartTime > currentCandleRef.current.time) {        
        const newCandle = {
          time: candleStartTime as UTCTimestamp,
          open: price,
          high: price,
          low: price,
          close: price,
        };

        currentCandleRef.current = newCandle;
        candlestickSeries.update(newCandle);
      } else {
        const updatedCandle = {
          ...currentCandleRef.current,
          high: Math.max(currentCandleRef.current.high, price),
          low: Math.min(currentCandleRef.current.low, price),
          close: price,
        };
        currentCandleRef.current = updatedCandle;
        candlestickSeries.update(updatedCandle as any);
        chart.timeScale().fitContent();
      }
      
    })!;

    return () => {
      chart.remove();
      SignalingManager.getInstance().unSubscribe("trade", symbol, id);
    };


  }, [symbol]);

  return (
      <div className="relative w-full h-full min-h-[400px]">
        <div className="absolute inset-0 w-full h-full" ref={chartContainerRef} />
      </div>
    );
}