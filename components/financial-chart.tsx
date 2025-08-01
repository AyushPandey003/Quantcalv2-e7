"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, BarChart3, Maximize2 } from "lucide-react"

interface FinancialChartProps {
  data: any[]
  symbol: string
  selectedDate: Date | null
  selectedRange: { start: Date; end: Date } | null
}

interface ProcessedData {
  date: string
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  change: number
  changePercent: number
  isGreen: boolean
  volatility: number
  bodyHeight: number
  bodyY: number
  upperWickHeight: number
  lowerWickHeight: number
  upperWickY: number
  lowerWickY: number
}

export function FinancialChart({ data, symbol, selectedDate, selectedRange }: FinancialChartProps) {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []

    const recentData = data.slice(-100)
    const minPrice = Math.min(...recentData.map((d) => Number.parseFloat(d.low)))
    const maxPrice = Math.max(...recentData.map((d) => Number.parseFloat(d.high)))
    const priceRange = maxPrice - minPrice

    return recentData.map((item) => {
      const open = Number.parseFloat(item.open)
      const high = Number.parseFloat(item.high)
      const low = Number.parseFloat(item.low)
      const close = Number.parseFloat(item.close)
      const volume = Number.parseFloat(item.volume)

      const change = close - open
      const changePercent = (change / open) * 100
      const isGreen = close >= open
      const volatility = ((high - low) / open) * 100

      // Calculate candlestick dimensions for custom rendering
      const bodyTop = Math.max(open, close)
      const bodyBottom = Math.min(open, close)
      const bodyHeight = Math.abs(close - open)

      // Normalize to 0-100 scale for rendering
      const normalizePrice = (price: number) => ((price - minPrice) / priceRange) * 100

      const bodyY = 100 - normalizePrice(bodyTop)
      const upperWickY = 100 - normalizePrice(high)
      const lowerWickY = 100 - normalizePrice(low)
      const upperWickHeight = normalizePrice(bodyTop) - normalizePrice(high)
      const lowerWickHeight = normalizePrice(low) - normalizePrice(bodyBottom)

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
        isGreen,
        volatility,
        bodyHeight: (bodyHeight / priceRange) * 100,
        bodyY,
        upperWickHeight,
        lowerWickHeight,
        upperWickY,
        lowerWickY,
      }
    })
  }, [data])

  const technicalIndicators = useMemo(() => {
    if (processedData.length < 20) return null

    const prices = processedData.map((d) => d.close)

    // Simple Moving Average (20 periods)
    const sma20 = prices.slice(-20).reduce((sum, price) => sum + price, 0) / 20

    // Exponential Moving Average (12 periods)
    let ema12 = prices[0]
    const multiplier = 2 / (12 + 1)
    for (let i = 1; i < Math.min(prices.length, 12); i++) {
      ema12 = prices[i] * multiplier + ema12 * (1 - multiplier)
    }

    // RSI calculation
    const gains = []
    const losses = []
    for (let i = 1; i < Math.min(prices.length, 15); i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) {
        gains.push(change)
        losses.push(0)
      } else {
        gains.push(0)
        losses.push(Math.abs(change))
      }
    }

    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length
    const rs = avgGain / (avgLoss || 1)
    const rsi = 100 - 100 / (1 + rs)

    return { sma20, ema12, rsi }
  }, [processedData])

  // Custom Candlestick Component
  const CustomCandlestick = (props: any) => {
    const { payload, x, width } = props
    if (!payload) return null

    const { open, high, low, close, isGreen } = payload
    const color = isGreen ? "#10b981" : "#ef4444"
    const wickX = x + width / 2
    const chartHeight = 200 // Approximate chart height

    // Calculate positions based on price range
    const minPrice = Math.min(...processedData.map((d) => d.low))
    const maxPrice = Math.max(...processedData.map((d) => d.high))
    const priceRange = maxPrice - minPrice

    const getY = (price: number) => {
      return ((maxPrice - price) / priceRange) * chartHeight
    }

    const highY = getY(high)
    const lowY = getY(low)
    const openY = getY(open)
    const closeY = getY(close)
    const bodyTop = Math.min(openY, closeY)
    const bodyHeight = Math.abs(closeY - openY)

    return (
      <g>
        {/* Upper wick */}
        <line x1={wickX} y1={highY} x2={wickX} y2={bodyTop} stroke={color} strokeWidth={1} />
        {/* Lower wick */}
        <line x1={wickX} y1={bodyTop + bodyHeight} x2={wickX} y2={lowY} stroke={color} strokeWidth={1} />
        {/* Body */}
        <rect
          x={x + 1}
          y={bodyTop}
          width={width - 2}
          height={Math.max(bodyHeight, 1)}
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
            <div className="text-sm text-muted-foreground">
              Volume: ${data.volume.toFixed(1)}M | Volatility: {data.volatility.toFixed(2)}%
            </div>
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
            <span>Financial Chart</span>
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
            <span className="text-lg md:text-xl">{symbol} Financial Chart</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={latestData.isGreen ? "default" : "destructive"} className="text-xs">
              {latestData.isGreen ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {latestData.changePercent.toFixed(2)}%
            </Badge>
            {technicalIndicators && (
              <>
                <Badge variant="outline" className="text-xs">
                  SMA20: ${technicalIndicators.sma20.toFixed(2)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  RSI: {technicalIndicators.rsi.toFixed(1)}
                </Badge>
              </>
            )}
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="candlestick" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="candlestick" className="text-xs md:text-sm">
              Candlestick
            </TabsTrigger>
            <TabsTrigger value="line" className="text-xs md:text-sm">
              Line
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
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                  />
                  <YAxis
                    domain={["dataMin - 50", "dataMax + 50"]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Moving averages */}
                  {technicalIndicators && (
                    <>
                      <ReferenceLine
                        y={technicalIndicators.sma20}
                        stroke="#8884d8"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                      />
                      <ReferenceLine
                        y={technicalIndicators.ema12}
                        stroke="#82ca9d"
                        strokeDasharray="3 3"
                        strokeWidth={2}
                      />
                    </>
                  )}

                  {/* Candlestick representation using bars */}
                  <Bar dataKey="high" fill="transparent" stroke="transparent" />

                  {/* Close price line overlay */}
                  <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={1} dot={false} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="line">
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                  <YAxis domain={["dataMin - 50", "dataMax + 50"]} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />

                  <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="high"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="low"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                  />
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
                  <YAxis domain={["dataMin - 50", "dataMax + 50"]} tick={{ fontSize: 12 }} />
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
                    domain={["dataMin - 50", "dataMax + 50"]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  <Bar yAxisId="volume" dataKey="volume" opacity={0.6}>
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isGreen ? "#10b981" : "#ef4444"} />
                    ))}
                  </Bar>

                  <Line yAxisId="price" type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        {/* Chart Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="font-mono font-bold">${latestData.close.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">High</div>
            <div className="font-mono font-bold text-green-600">${latestData.high.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Low</div>
            <div className="font-mono font-bold text-red-600">${latestData.low.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Volume</div>
            <div className="font-mono font-bold">${latestData.volume.toFixed(1)}M</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Volatility</div>
            <div className="font-mono font-bold">{latestData.volatility.toFixed(2)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
