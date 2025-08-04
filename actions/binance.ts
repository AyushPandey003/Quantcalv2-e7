// actions/binance.ts
"use server";

import { CandlestickData, HistogramData, UTCTimestamp } from "lightweight-charts";

const VALID_INTERVALS = new Set([
    '1m', '3m', '5m', '15m', '30m', 
    '1h', '2h', '4h', '6h', '8h', '12h', 
    '1d', '3d', '1w', '1M'
]);

export async function getKlines(
    symbol: string,
    timeframe: string,
    limit: number = 500
): Promise<{ candles: CandlestickData[], volumes: HistogramData[] }> {

    if (!VALID_INTERVALS.has(timeframe)) {
        throw new Error(`Invalid timeframe: "${timeframe}".`);
    }

    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${timeframe}&limit=${limit}`;

    try {
        // --- THIS IS THE FIX ---
        // Change the fetch options to disable caching.
        const response = await fetch(url, { cache: 'no-store' });
        // --- END OF FIX ---

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Binance API Error: ${errorData.msg || response.statusText}`);
        }

        const data = await response.json();

        const candles: CandlestickData[] = [];
        const volumes: HistogramData[] = [];

        for (const d of data) {
            const time = Math.floor(d[0] / 1000) as UTCTimestamp;
            const open = parseFloat(d[1]);
            const close = parseFloat(d[4]);
            const color = close >= open ? "rgba(34, 197, 135, 0.5)" : "rgba(239, 68, 68, 0.5)";

            candles.push({ time, open, high: parseFloat(d[2]), low: parseFloat(d[3]), close });
            volumes.push({ time, value: parseFloat(d[5]), color });
        }

        return { candles, volumes };

    } catch (error: any) {
        console.error("Server Action `getKlines` failed:", error.message);
        throw new Error(error.message || "Failed to fetch chart data.");
    }
}