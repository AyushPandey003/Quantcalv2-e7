// components/CandlestickChart.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  CandlestickData,
  HistogramData,
  CandlestickSeries,
  HistogramSeries,
  ISeriesApi,
  IChartApi,
  UTCTimestamp,
  TimeScaleOptions,
  DeepPartial,
  TickMarkType,
} from "lightweight-charts";
import { GenericChart, SeriesConfig } from "./genericChart";
import { getKlines } from "@/actions/binance";

const getTickMarkFormatter = (
  timeframe: string
): (time: UTCTimestamp, tickMarkType: TickMarkType, locale: string) => string => {
  const unit = timeframe.slice(-1);
  switch (unit) {
    case "m":
    case "h":
      return (time, _type, locale) =>
        new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(time * 1000);
    case "d":
      return (time, _type, locale) =>
        new Intl.DateTimeFormat(locale, {
          day: "2-digit",
          month: "short",
        }).format(time * 1000);
    case "w":
    case "M":
      return (time, _type, locale) =>
        new Intl.DateTimeFormat(locale, {
          month: "short",
          year: "2-digit",
        }).format(time * 1000);
    default:
      return (time) => new Date(time * 1000).toLocaleDateString();
  }
};

interface CandlestickChartProps {
  symbol: string;
  timeframe: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  timeframe,
}) => {
  const [seriesConfigs, setSeriesConfigs] =
    useState<SeriesConfig<any>[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const chartOptions = useMemo(() => {
    const timeScaleOpts: DeepPartial<TimeScaleOptions> = {
      borderColor: "rgba(197, 203, 206, 0.3)",
      timeVisible: true,
      tickMarkFormatter: getTickMarkFormatter(timeframe),
      fixRightEdge: true,
    };
    return {
      layout: {
        background: { color: "transparent" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "rgba(75, 85, 99, 0.5)" },
        horzLines: { color: "rgba(75, 85, 99, 0.5)" },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "rgba(197, 203, 206, 0.3)" },
      leftPriceScale: {
        visible: true,
        borderColor: "rgba(197, 203, 206, 0.3)",
        scaleMargins: { top: 0.85, bottom: 0 },
      },
      timeScale: timeScaleOpts,
    };
  }, [timeframe]);

  // reset configs on symbol/timeframe change
  useEffect(() => {
    setSeriesConfigs(null);
    setError(null);
  }, [symbol, timeframe]);

  // ONE-TIME fetch historical data (no polling)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const { candles, volumes } = await getKlines(symbol, timeframe);
        if (!isMounted) return;
        setSeriesConfigs([
          {
            type: CandlestickSeries,
            options: {
              upColor: "rgb(34, 197, 135)",
              downColor: "rgb(239, 68, 68)",
              wickUpColor: "rgb(34, 197, 135)",
              wickDownColor: "rgb(239, 68, 68)",
              borderVisible: false,
            },
            initialData: candles as CandlestickData[],
          },
          {
            type: HistogramSeries,
            options: {
              priceScaleId: "left",
              priceFormat: { type: "volume" },
              lastValueVisible: false,
              priceLineVisible: false,
            },
            initialData: volumes as HistogramData[],
          },
        ]);
      } catch (e: any) {
        if (isMounted) setError(e.message);
        console.error("Fetch Klines error:", e);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [symbol, timeframe]);

  // live WebSocket updates
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${timeframe}`
    );
    ws.onmessage = (evt) => {
      try {
        const k = JSON.parse(evt.data).k;
        if (!k) return;
        const time = (k.t / 1000) as UTCTimestamp;
        const open = parseFloat(k.o),
          high = parseFloat(k.h),
          low = parseFloat(k.l),
          close = parseFloat(k.c),
          volume = parseFloat(k.v);
        candleSeriesRef.current!.update({ time, open, high, low, close });
        volumeSeriesRef.current!.update({
          time,
          value: volume,
          color:
            close >= open
              ? "rgba(34, 197, 135, 0.5)"
              : "rgba(239, 68, 68, 0.5)",
        });
        // auto-scroll
        chartRef.current?.timeScale().scrollToRealTime();
      } catch (e) {
        console.error("WebSocket parse error:", e);
      }
    };
    return () => ws.close();
  }, [symbol, timeframe, seriesConfigs]);

  const handleChartCreated = useCallback((chart: IChartApi) => {
    chartRef.current = chart;
  }, []);

  const handleSeriesCreated = useCallback(
    (series: ISeriesApi<any>, idx: number) => {
      if (idx === 0) candleSeriesRef.current = series;
      else if (idx === 1) volumeSeriesRef.current = series;
    },
    []
  );

  if (error)
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!seriesConfigs)
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        Loading chart...
      </div>
    );

  return (
    <div className="w-full h-full">
      <GenericChart
        key={symbol + timeframe}
        chartOptions={chartOptions}
        seriesConfigs={seriesConfigs}
        onChartCreated={handleChartCreated}
        onSeriesCreated={handleSeriesCreated}
      />
    </div>
  );
};
