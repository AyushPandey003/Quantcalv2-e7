"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Activity, Volume2, Target, Zap } from "lucide-react"

interface DataDashboardProps {
  selectedDate: Date | null
  selectedRange: { start: Date; end: Date } | null
  data: any
  historicalData: any[]
  symbol: string
}

export function DataDashboard({ selectedDate, selectedRange, data, historicalData, symbol }: DataDashboardProps) {
  const selectedDateData = useMemo(() => {
    if (!selectedDate || !historicalData) return null

    return historicalData.find((item) => {
      const itemDate = new Date(item.openTime)
      return itemDate.toDateString() === selectedDate.toDateString()
    })
  }, [selectedDate, historicalData])

  const rangeData = useMemo(() => {
    if (!selectedRange || !historicalData) return null

    const filtered = historicalData.filter((item) => {
      const itemDate = new Date(item.openTime)
      return itemDate >= selectedRange.start && itemDate <= selectedRange.end
    })

    if (filtered.length === 0) return null

    // Calculate aggregated metrics
    const totalVolume = filtered.reduce((sum, item) => sum + Number.parseFloat(item.volume), 0)
    const avgVolatility =
      filtered.reduce((sum, item) => {
        const volatility =
          ((Number.parseFloat(item.high) - Number.parseFloat(item.low)) / Number.parseFloat(item.open)) * 100
        return sum + volatility
      }, 0) / filtered.length

    const totalReturn =
      ((Number.parseFloat(filtered[filtered.length - 1].close) - Number.parseFloat(filtered[0].open)) /
        Number.parseFloat(filtered[0].open)) *
      100

    return {
      data: filtered,
      totalVolume,
      avgVolatility,
      totalReturn,
      days: filtered.length,
    }
  }, [selectedRange, historicalData])

  const chartData = useMemo(() => {
    if (!historicalData) return []

    return historicalData.slice(-30).map((item) => ({
      date: new Date(item.openTime).toLocaleDateString(),
      price: Number.parseFloat(item.close),
      volume: Number.parseFloat(item.volume) / 1000000, // Convert to millions
      volatility: ((Number.parseFloat(item.high) - Number.parseFloat(item.low)) / Number.parseFloat(item.open)) * 100,
    }))
  }, [historicalData])

  const technicalIndicators = useMemo(() => {
    if (!historicalData || historicalData.length < 20) return null

    const prices = historicalData.slice(-20).map((item) => Number.parseFloat(item.close))
    const sma20 = prices.reduce((sum, price) => sum + price, 0) / prices.length

    // Simple RSI calculation
    const gains = []
    const losses = []
    for (let i = 1; i < prices.length; i++) {
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
    const rs = avgGain / avgLoss
    const rsi = 100 - 100 / (1 + rs)

    return {
      sma20,
      rsi,
      currentPrice: prices[prices.length - 1],
    }
  }, [historicalData])

  return (
    <div className="space-y-4">
      {/* Current Market Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Activity className="h-4 w-4 md:h-5 md:w-5" />
            <span>{symbol} Live Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl md:text-2xl font-bold">${Number.parseFloat(data.price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <div className="flex items-center space-x-1">
                    {Number.parseFloat(data.priceChangePercent) >= 0 ? (
                      <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                    )}
                    <p
                      className={`text-base md:text-lg font-semibold ${
                        Number.parseFloat(data.priceChangePercent) >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {Number.parseFloat(data.priceChangePercent).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>High</span>
                  <span className="font-medium">${Number.parseFloat(data.highPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <span className="font-medium">${Number.parseFloat(data.lowPrice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Volume</span>
                  <span className="font-medium">${(Number.parseFloat(data.volume) / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading live data...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      {technicalIndicators && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Target className="h-4 w-4 md:h-5 md:w-5" />
              <span>Technical Indicators</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>SMA (20)</span>
                <span className="font-medium">${technicalIndicators.sma20.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>RSI</span>
                <div className="flex items-center space-x-2">
                  <Progress value={technicalIndicators.rsi} className="w-12 md:w-16" />
                  <span className="font-medium">{technicalIndicators.rsi.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Signal</span>
                <Badge
                  variant={technicalIndicators.currentPrice > technicalIndicators.sma20 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {technicalIndicators.currentPrice > technicalIndicators.sma20 ? "Bullish" : "Bearish"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Date Details */}
      {selectedDate && selectedDateData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Zap className="h-4 w-4 md:h-5 md:w-5" />
              <span>Date Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-base md:text-lg font-semibold">{selectedDate.toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Open</p>
                <p className="font-medium">${Number.parseFloat(selectedDateData.open).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Close</p>
                <p className="font-medium">${Number.parseFloat(selectedDateData.close).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">High</p>
                <p className="font-medium">${Number.parseFloat(selectedDateData.high).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Low</p>
                <p className="font-medium">${Number.parseFloat(selectedDateData.low).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Return</span>
                <span
                  className={`font-medium ${
                    ((Number.parseFloat(selectedDateData.close) - Number.parseFloat(selectedDateData.open)) /
                      Number.parseFloat(selectedDateData.open)) *
                      100 >=
                    0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {(
                    ((Number.parseFloat(selectedDateData.close) - Number.parseFloat(selectedDateData.open)) /
                      Number.parseFloat(selectedDateData.open)) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volatility</span>
                <span className="font-medium">
                  {(
                    ((Number.parseFloat(selectedDateData.high) - Number.parseFloat(selectedDateData.low)) /
                      Number.parseFloat(selectedDateData.open)) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volume</span>
                <span className="font-medium">
                  ${(Number.parseFloat(selectedDateData.volume) / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Range Analysis */}
      {selectedRange && rangeData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Volume2 className="h-4 w-4 md:h-5 md:w-5" />
              <span>Range Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {selectedRange.start.toLocaleDateString()} - {selectedRange.end.toLocaleDateString()}
              </p>
              <p className="text-base md:text-lg font-semibold">{rangeData.days} Days</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Return</span>
                <span className={`font-medium ${rangeData.totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {rangeData.totalReturn.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Volatility</span>
                <span className="font-medium">{rangeData.avgVolatility.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Volume</span>
                <span className="font-medium">${(rangeData.totalVolume / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Price Trend (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Volume Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Volume Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="volume" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
