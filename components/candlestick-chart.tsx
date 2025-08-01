"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

interface CandlestickChartProps {
  data: any[]
  symbol: string
  selectedDate: Date | null
  selectedRange: { start: Date; end: Date } | null
}

interface CandleData {
  date: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  change: number
  changePercent: number
  upperShadow: number
  lowerShadow: number
  body: number
  bodyStart: number
  isGreen: boolean
}

export function CandlestickChart({ data, symbol, selectedDate, selectedRange }: CandlestickChartProps) {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.slice(-50).map((item, index) => {
      const open = Number.parseFloat(item.open)
      const high = Number.parseFloat(item.high)
      const low = Number.parseFloat(item.low)
      const close = Number.parseFloat(item.close)
      const volume = Number.parseFloat(item.volume)

      const change = close - open
      const changePercent = (change / open) * 100
      const isGreen = close >= open

      const bodyStart = Math.min(open, close)
      const body = Math.abs(close - open)
      const upperShadow = high - Math.max(open, close)
      const lowerShadow = Math.min(open, close) - low

      return {
        date: new Date(item.openTime).toLocaleDateString(),
        timestamp: item.openTime,
        open,
        high,
        low,
        close,
        volume: volume / 1000000, // Convert to millions
        change,
        changePercent,
        upperShadow,
        lowerShadow,
        body,
        bodyStart,
        isGreen,
        // For area chart
        price: close,
        // For volume bars
        volumeColor: isGreen ? "#10b981" : "#ef4444",
      }
    })
  }, [data])

  const technicalIndicators = useMemo(() => {
    if (processedData.length < 20) return null

    const prices = processedData.map((d) => d.close)

    // Simple Moving Average (20 periods)
    const sma20 = prices.slice(-20).reduce((sum, price) => sum + price, 0) / 20

    // Exponential Moving Average (12 periods)
    const ema12 = prices.slice(-12).reduce((sum, price, index, arr) => {
      const multiplier = 2 / (12 + 1)
      return index === 0 ? price : price * multiplier + sum * (1 - multiplier)
    }, 0)

    return { sma20, ema12 }
  }, [processedData])

  const CustomCandlestick = (props: any) => {
    const { payload, x, y, width, height } = props
    if (!payload) return null

    const { open, high, low, close, isGreen } = payload
    const color = isGreen ? "#10b981" : "#ef4444"
    const wickX = x + width / 2

    return (
      <g>
        {/* Wick */}
        <line
          x1={wickX}
          y1={y + ((high - Math.max(open, close)) * height) / (high - low)}
          x2={wickX}
          y2={y + ((high - Math.min(open, close)) * height) / (high - low)}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + 1}
          y={y + ((high - Math.max(open, close)) * height) / (high - low)}
          width={width - 2}
          height={(Math.abs(close - open) * height) / (high - low)}
          fill={isGreen ? color : "transparent"}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
            <div>
              Open: <span className="font-mono">${data.open.toFixed(2)}</span>
            </div>
            <div>
              High: <span className="font-mono text-green-600">${data.high.toFixed(2)}</span>
            </div>
            <div>
              Low: <span className="font-mono text-red-600">${data.low.toFixed(2)}</span>
            </div>
            <div>
              Close: <span className="font-mono">${data.close.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <div className={`text-sm ${data.isGreen ? "text-green-600" : "text-red-600"}`}>
              Change: {data.change > 0 ? "+" : ""}${data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
            </div>
            <div className="text-sm text-muted-foreground">Volume: ${data.volume.toFixed(1)}M</div>
          </div>
        </div>
      )
    }
    return null
  }

  if (!processedData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Price Chart</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const latestData = processedData[processedData.length - 1]

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span className="text-lg md:text-xl">{symbol} Price Chart</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={latestData.isGreen ? "default" : "destructive"} className="text-xs">
              {latestData.isGreen ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {latestData.changePercent.toFixed(2)}%
            </Badge>
            {technicalIndicators && (
              <Badge variant="outline" className="text-xs">
                SMA20: ${technicalIndicators.sma20.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="candlestick" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="candlestick" className="text-xs md:text-sm">
              Candlestick
            </TabsTrigger>
            <TabsTrigger value="area" className="text-xs md:text-sm">
              Area
            </TabsTrigger>
            <TabsTrigger value="volume" className="text-xs md:text-sm">
              Volume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candlestick">
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis domain={["dataMin - 100", "dataMax + 100"]} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Price bars representing candlesticks */}
                  <Bar dataKey="high" fill="transparent" stroke="transparent" />

                  {/* Moving averages */}
                  {technicalIndicators && (
                    <>
                      <ReferenceLine
                        y={technicalIndicators.sma20}
                        stroke="#8884d8"
                        strokeDasharray="5 5"
                        label={{ value: "SMA20", position: "topRight" }}
                      />
                      <ReferenceLine
                        y={technicalIndicators.ema12}
                        stroke="#82ca9d"
                        strokeDasharray="3 3"
                        label={{ value: "EMA12", position: "topRight" }}
                      />
                    </>
                  )}

                  {/* Close price line */}
                  <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="area">
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis domain={["dataMin - 100", "dataMax + 100"]} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="close" stroke="#3b82f6" fill="url(#colorPrice)" strokeWidth={2} />
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="volume">
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis yAxisId="volume" orientation="right" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="price"
                    orientation="left"
                    domain={["dataMin - 100", "dataMax + 100"]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  <Bar yAxisId="volume" dataKey="volume" fill="#8884d8" opacity={0.6} />

                  <Line yAxisId="price" type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chart Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="font-mono font-bold">${latestData.close.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">24h High</div>
            <div className="font-mono font-bold text-green-600">${latestData.high.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">24h Low</div>
            <div className="font-mono font-bold text-red-600">${latestData.low.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Volume</div>
            <div className="font-mono font-bold">${latestData.volume.toFixed(1)}M</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
