"use client"

import { useMemo } from "react"
import { ComposedChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface CandlestickData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface CandlestickChartProps {
  data: CandlestickData[]
  symbol: string
  timeframe: string
  loading?: boolean
}

// Custom Candlestick component
const Candlestick = (props: any) => {
  const { payload, x, y, width, height } = props
  if (!payload) return null

  const { open, high, low, close } = payload
  const isGreen = close >= open
  const color = isGreen ? "#10b981" : "#ef4444"

  const bodyHeight = Math.abs(close - open)
  const bodyY = Math.min(open, close)
  const wickTop = high
  const wickBottom = low

  // Scale values to chart coordinates
  const scale = height / (high - low)
  const candleBodyHeight = bodyHeight * scale
  const candleBodyY = y + (high - bodyY) * scale
  const wickTopY = y
  const wickBottomY = y + height

  return (
    <g>
      {/* Wick */}
      <line x1={x + width / 2} y1={wickTopY} x2={x + width / 2} y2={wickBottomY} stroke={color} strokeWidth={1} />
      {/* Body */}
      <rect
        x={x + width * 0.2}
        y={candleBodyY}
        width={width * 0.6}
        height={Math.max(candleBodyHeight, 1)}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  )
}

export function CandlestickChart({ data, symbol, timeframe, loading }: CandlestickChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate mock data for demonstration
      return Array.from({ length: 100 }, (_, i) => {
        const basePrice = 45000 + Math.random() * 10000
        const open = basePrice + (Math.random() - 0.5) * 1000
        const close = open + (Math.random() - 0.5) * 2000
        const high = Math.max(open, close) + Math.random() * 500
        const low = Math.min(open, close) - Math.random() * 500

        return {
          timestamp: Date.now() - (100 - i) * 3600000,
          open,
          high,
          low,
          close,
          volume: Math.random() * 1000000,
          time: new Date(Date.now() - (100 - i) * 3600000).toLocaleTimeString(),
        }
      })
    }

    return data.map((item) => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString(),
    }))
  }, [data])

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--chart-1))",
    },
    volume: {
      label: "Volume",
      color: "hsl(var(--chart-2))",
    },
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {symbol} - {timeframe}
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-muted-foreground">O: ${chartData[chartData.length - 1]?.open.toFixed(2)}</span>
          <span className="text-muted-foreground">H: ${chartData[chartData.length - 1]?.high.toFixed(2)}</span>
          <span className="text-muted-foreground">L: ${chartData[chartData.length - 1]?.low.toFixed(2)}</span>
          <span className="text-muted-foreground">C: ${chartData[chartData.length - 1]?.close.toFixed(2)}</span>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              domain={["dataMin - 100", "dataMax + 100"]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              labelFormatter={(value) => `Time: ${value}`}
              formatter={(value: any, name: string) => [
                `$${Number(value).toFixed(2)}`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />

            {/* Volume bars */}
            <Bar dataKey="volume" fill="hsl(var(--chart-2))" opacity={0.3} yAxisId="volume" />

            {/* Price line for reference */}
            <Line type="monotone" dataKey="close" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Trading indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">RSI:</span>
          <span className="font-medium">65.4</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">MACD:</span>
          <span className="font-medium text-green-500">+124.5</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">BB:</span>
          <span className="font-medium">Mid</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vol:</span>
          <span className="font-medium">High</span>
        </div>
      </div>
    </div>
  )
}
