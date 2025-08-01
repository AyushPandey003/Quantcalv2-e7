"use client"

import { useMemo } from "react"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface BinanceKlineData {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
}

interface FinancialChartProps {
  data: BinanceKlineData[]
  loading?: boolean
}

interface ChartDataPoint {
  date: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  sma20: number | null
  ema12: number | null
  rsi: number | null
  upperBB: number | null
  lowerBB: number | null
  candleColor: string
}

export function FinancialChart({ data, loading }: FinancialChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const processedData: ChartDataPoint[] = []
    const sma20Values: number[] = []
    let ema12 = 0
    const rsiGains: number[] = []
    const rsiLosses: number[] = []

    data.forEach((item, index) => {
      const open = Number.parseFloat(item.open)
      const high = Number.parseFloat(item.high)
      const low = Number.parseFloat(item.low)
      const close = Number.parseFloat(item.close)
      const volume = Number.parseFloat(item.volume)

      // Calculate SMA20
      sma20Values.push(close)
      if (sma20Values.length > 20) sma20Values.shift()
      const sma20 = sma20Values.length === 20 ? sma20Values.reduce((a, b) => a + b) / 20 : null

      // Calculate EMA12
      if (index === 0) {
        ema12 = close
      } else {
        const multiplier = 2 / (12 + 1)
        ema12 = close * multiplier + ema12 * (1 - multiplier)
      }

      // Calculate RSI
      let rsi = null
      if (index > 0) {
        const change = close - Number.parseFloat(data[index - 1].close)
        if (change > 0) {
          rsiGains.push(change)
          rsiLosses.push(0)
        } else {
          rsiGains.push(0)
          rsiLosses.push(Math.abs(change))
        }

        if (rsiGains.length > 14) {
          rsiGains.shift()
          rsiLosses.shift()
        }

        if (rsiGains.length === 14) {
          const avgGain = rsiGains.reduce((a, b) => a + b) / 14
          const avgLoss = rsiLosses.reduce((a, b) => a + b) / 14
          const rs = avgGain / (avgLoss || 0.001)
          rsi = 100 - 100 / (1 + rs)
        }
      }

      // Calculate Bollinger Bands (using SMA20 as middle band)
      let upperBB = null
      let lowerBB = null
      if (sma20 && sma20Values.length === 20) {
        const variance = sma20Values.reduce((sum, val) => sum + Math.pow(val - sma20, 2), 0) / 20
        const stdDev = Math.sqrt(variance)
        upperBB = sma20 + 2 * stdDev
        lowerBB = sma20 - 2 * stdDev
      }

      processedData.push({
        date: new Date(item.openTime).toLocaleDateString(),
        timestamp: item.openTime,
        open,
        high,
        low,
        close,
        volume,
        sma20,
        ema12: index > 0 ? ema12 : null,
        rsi,
        upperBB,
        lowerBB,
        candleColor: close >= open ? "#10b981" : "#ef4444",
      })
    })

    return processedData
  }, [data])

  const CustomCandlestick = ({ payload, x, y, width, height }: any) => {
    if (!payload) return null

    const { open, high, low, close, candleColor } = payload
    const candleWidth = Math.max(width * 0.6, 2)
    const centerX = x + width / 2
    const wickX = centerX

    // Calculate positions
    const openY = y + height - ((open - low) / (high - low)) * height
    const closeY = y + height - ((close - low) / (high - low)) * height
    const highY = y
    const lowY = y + height

    const bodyTop = Math.min(openY, closeY)
    const bodyBottom = Math.max(openY, closeY)
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1)

    return (
      <g>
        {/* High-Low Wick */}
        <line x1={wickX} y1={highY} x2={wickX} y2={lowY} stroke={candleColor} strokeWidth={1} />
        {/* Open-Close Body */}
        <rect
          x={centerX - candleWidth / 2}
          y={bodyTop}
          width={candleWidth}
          height={bodyHeight}
          fill={candleColor}
          stroke={candleColor}
          strokeWidth={1}
        />
      </g>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <div>
              <p className="text-slate-600 dark:text-slate-400">
                Open: <span className="font-medium">${data.open?.toFixed(2)}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                High: <span className="font-medium text-green-600">${data.high?.toFixed(2)}</span>
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">
                Low: <span className="font-medium text-red-600">${data.low?.toFixed(2)}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Close: <span className="font-medium">${data.close?.toFixed(2)}</span>
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-slate-600 dark:text-slate-400">Volume: {(data.volume / 1000000).toFixed(2)}M</p>
            {data.rsi && <p className="text-xs text-slate-600 dark:text-slate-400">RSI: {data.rsi.toFixed(1)}</p>}
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return <div className="h-80 flex items-center justify-center text-slate-500">No data available</div>
  }

  return (
    <ChartContainer
      config={{
        price: {
          label: "Price",
          color: "hsl(var(--chart-1))",
        },
        volume: {
          label: "Volume",
          color: "hsl(var(--chart-2))",
        },
        sma20: {
          label: "SMA 20",
          color: "hsl(var(--chart-3))",
        },
        ema12: {
          label: "EMA 12",
          color: "hsl(var(--chart-4))",
        },
      }}
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis domain={["dataMin - 50", "dataMax + 50"]} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />

          {/* Bollinger Bands */}
          <Line
            type="monotone"
            dataKey="upperBB"
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="2 2"
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="lowerBB"
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="2 2"
            dot={false}
            connectNulls={false}
          />

          {/* Moving Averages */}
          <Line
            type="monotone"
            dataKey="sma20"
            stroke="var(--color-sma20)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="ema12"
            stroke="var(--color-ema12)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />

          {/* Volume bars */}
          <Bar dataKey="volume" fill="var(--color-volume)" opacity={0.3} yAxisId="volume" />

          {/* RSI Reference Lines */}
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" opacity={0.5} />
          <ReferenceLine y={30} stroke="#10b981" strokeDasharray="2 2" opacity={0.5} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
