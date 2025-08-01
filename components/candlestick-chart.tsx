"use client"

import { useState, useMemo } from "react"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Area } from "recharts"
import { useBinanceData } from "@/hooks/use-binance-data"

interface CandlestickChartProps {
  symbol: string
  timeframe: string
}

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function CandlestickChart({ symbol, timeframe }: CandlestickChartProps) {
  const { historicalData, loading } = useBinanceData(symbol)
  const [chartData, setChartData] = useState<CandleData[]>([])

  const processedData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []

    return historicalData.slice(-100).map((item: any) => ({
      time: new Date(item.openTime).toLocaleTimeString(),
      open: Number.parseFloat(item.open),
      high: Number.parseFloat(item.high),
      low: Number.parseFloat(item.low),
      close: Number.parseFloat(item.close),
      volume: Number.parseFloat(item.volume),
      change: Number.parseFloat(item.close) - Number.parseFloat(item.open),
    }))
  }, [historicalData])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis domain={["dataMin - 100", "dataMax + 100"]} tick={{ fontSize: 12 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">{label}</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        Open: <span className="font-mono">${data.open.toLocaleString()}</span>
                      </p>
                      <p>
                        High: <span className="font-mono text-green-500">${data.high.toLocaleString()}</span>
                      </p>
                      <p>
                        Low: <span className="font-mono text-red-500">${data.low.toLocaleString()}</span>
                      </p>
                      <p>
                        Close: <span className="font-mono">${data.close.toLocaleString()}</span>
                      </p>
                      <p>
                        Volume: <span className="font-mono">{(data.volume / 1000000).toFixed(2)}M</span>
                      </p>
                      <p>
                        Change:{" "}
                        <span className={`font-mono ${data.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {data.change >= 0 ? "+" : ""}${data.change.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />

          {/* Candlestick representation using Area charts */}
          <Area type="monotone" dataKey="high" stroke="transparent" fill="transparent" />
          <Area type="monotone" dataKey="low" stroke="transparent" fill="transparent" />

          {/* Price line */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
          />

          {/* Volume bars */}
          <Bar dataKey="volume" fill="hsl(var(--muted))" opacity={0.3} yAxisId="volume" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
