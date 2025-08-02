// components/CandlestickChart.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
    CandlestickData,
    HistogramData,
    CandlestickSeries,
    HistogramSeries,
    ISeriesApi,
    UTCTimestamp,
    TimeScaleOptions,
    DeepPartial,
    TickMarkType,
} from "lightweight-charts";
import { GenericChart, SeriesConfig } from "./genericChart"; // Ensure path is correct
import { getKlines } from "@/actions/binance"; // Ensure path is correct

// --- START: Helper function to format the time axis ---
const getTickMarkFormatter = (timeframe: string): ((time: UTCTimestamp, tickMarkType: TickMarkType, locale: string) => string) => {
    const unit = timeframe.slice(-1); // Gets the 'm', 'h', 'd', 'w', or 'M'
    
    switch (unit) {
        case 'm': // Minutes
        case 'h': // Hours
            // Show time for intraday charts
            return (time, tickMarkType, locale) => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false }).format(time * 1000);

        case 'd': // Days
            // Show date for daily charts
            return (time, tickMarkType, locale) => new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }).format(time * 1000);

        case 'w': // Weeks
        case 'M': // Months
            // Show month and year for long-term charts
            return (time, tickMarkType, locale) => new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' }).format(time * 1000);

        default:
            // A sensible fallback
            return (time, tickMarkType, locale) => new Date(time * 1000).toLocaleDateString();
    }
};
// --- END: Helper function ---


interface CandlestickChartProps {
    symbol: string;
    timeframe: string;
}

const POLLING_INTERVAL = 3 * 60 * 1000;

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ symbol, timeframe }) => {
    const [seriesConfigs, setSeriesConfigs] = useState<SeriesConfig<any>[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    // --- START: Memoize chart options to dynamically update the time axis ---
    const chartOptions = useMemo(() => {
        const timeScaleOptions: DeepPartial<TimeScaleOptions> = {
            borderColor: "rgba(197, 203, 206, 0.3)",
            timeVisible: true,
            // Apply the dynamic formatter
            tickMarkFormatter: getTickMarkFormatter(timeframe),
        };

        return {
            layout: { background: { color: "transparent" }, textColor: "#d1d5db" },
            grid: { vertLines: { color: "rgba(75, 85, 99, 0.5)" }, horzLines: { color: "rgba(75, 85, 99, 0.5)" } },
            crosshair: { mode: 1 },
            rightPriceScale: { borderColor: "rgba(197, 203, 206, 0.3)" },
            timeScale: timeScaleOptions,
        };
    }, [timeframe]); // Re-calculate only when timeframe changes
    // --- END: Memoize chart options ---

    // Effect to reset state when props change for a clean UI transition
    useEffect(() => {
        setSeriesConfigs(null);
        setError(null);
    }, [symbol, timeframe]);

    // Effect for fetching historical data
    useEffect(() => {
        // Don't run if data is already loaded or is in the process of loading.
        if (seriesConfigs) return;

        let isMounted = true;
        const fetchAndSetData = async () => {
            try {
                const { candles, volumes } = await getKlines(symbol, timeframe);
                if (!isMounted) return;

                const configs: SeriesConfig<any>[] = [
                    { type: CandlestickSeries, options: { upColor: 'rgb(34, 197, 135)', downColor: 'rgb(239, 68, 68)', wickUpColor: 'rgb(34, 197, 135)', wickDownColor: 'rgb(239, 68, 68)', borderVisible: false }, initialData: candles },
                    { type: HistogramSeries, options: { priceScaleId: 'volume_scale', priceFormat: { type: 'volume' }, lastValueVisible: false, priceLineVisible: false }, initialData: volumes },
                ];
                setSeriesConfigs(configs);
                
            } catch (err: any) {
                if (isMounted) setError(err.message);
                console.error("Failed to fetch chart data via Server Action:", err);
            }
        };

        fetchAndSetData();
        // The polling can be simplified as the server action revalidates, but it provides a fallback
        const intervalId = setInterval(fetchAndSetData, POLLING_INTERVAL);

        return () => { isMounted = false; clearInterval(intervalId); };
    }, [symbol, timeframe, seriesConfigs]); // Re-run if props change and configs are null

    // Real-time updates and series creation callbacks remain the same
    useEffect(() => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${timeframe}`);
        ws.onopen = () => console.log(`WebSocket connected for ${symbol}@${timeframe}`);
        ws.onmessage = (event) => {
            try {
                const k = JSON.parse(event.data).k;
                if (k) {
                    const time = (k.t / 1000) as UTCTimestamp;
                    candleSeriesRef.current?.update({ time, open: parseFloat(k.o), high: parseFloat(k.h), low: parseFloat(k.l), close: parseFloat(k.c) });
                    volumeSeriesRef.current?.update({ time, value: parseFloat(k.v), color: parseFloat(k.c) >= parseFloat(k.o) ? "rgba(34, 197, 135, 0.5)" : "rgba(239, 68, 68, 0.5)" });
                }
            } catch (e) { console.error("Failed to parse WebSocket message:", e); }
        };
        ws.onerror = (err) => console.error("WebSocket Error:", err);
        ws.onclose = (event) => console.log(`WebSocket disconnected for ${symbol}@${timeframe}. Code: ${event.code}`);
        return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
    }, [symbol, timeframe, candleSeriesRef.current, volumeSeriesRef.current]);

    const handleSeriesCreated = useCallback((series: ISeriesApi<any>, index: number) => {
        if (index === 0) candleSeriesRef.current = series;
        else if (index === 1) {
            volumeSeriesRef.current = series;
            series.priceScale().applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
        }
    }, []);
    
    // Render logic
    if (error) return <div className="w-full h-[400px] flex items-center justify-center text-red-500">{error}</div>;
    if (!seriesConfigs) return <div className="w-full h-[400px] flex items-center justify-center">Loading chart...</div>;

    return (
        <div className="w-full h-[400px]">
            <GenericChart
                key={symbol + timeframe} // Essential for correct remounting when props change
                chartOptions={chartOptions} // Use the dynamic, memoized options
                seriesConfigs={seriesConfigs}
                onSeriesCreated={handleSeriesCreated}
            />
        </div>
    );
};