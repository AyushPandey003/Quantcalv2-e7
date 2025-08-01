"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Volume2, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface BinanceTickerData {
  symbol: string
  price: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  volume: string
  openPrice: string
}

interface BinanceKlineData {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
}

interface DataDashboardProps {
  data: BinanceTickerData | null
  historicalData: BinanceKlineData[]
  selectedDate?: Date
  dateRange?: { from: Date; to: Date }
}

export function DataDashboard({ data, historicalData, selectedDate, dateRange }: DataDashboardProps) {
  // Calculate advanced metrics
  const metrics = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return null

    const prices = historicalData.map((d) => Number.parseFloat(d.close))
    const volumes = historicalData.map((d) => Number.parseFloat(d.volume))

    // Calculate volatility (standard deviation of returns)
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100 // Annualized volatility

    // Calculate RSI
    const gains = returns.filter((r) => r > 0)
    const losses = returns.filter((r) => r < 0).map((r) => Math.abs(r))
    const avgGain = gains.length > 0 ? gains.reduce((sum, g) => sum + g, 0) / gains.length : 0
    const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / losses.length : 0
    const rs = avgLoss > 0 ? avgGain / avgLoss : 0
    const rsi = 100 - 100 / (1 + rs)

    // Calculate moving averages
    const sma20 = prices.slice(-20).reduce((sum, p) => sum + p, 0) / Math.min(20, prices.length)
    const sma50 = prices.slice(-50).reduce((sum, p) => sum + p, 0) / Math.min(50, prices.length)

    // Calculate support and resistance levels
    const highs = historicalData.slice(-20).map((d) => Number.parseFloat(d.high))
    const lows = historicalData.slice(-20).map((d) => Number.parseFloat(d.low))
    const resistance = Math.max(...highs)
    const support = Math.min(...lows)

    // Calculate average volume
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length

    return {
      volatility,
      rsi,
      sma20,
      sma50,
      resistance,
      support,
      avgVolume,
      totalReturn: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
      maxDrawdown: Math.min(...returns.map((_, i) => returns.slice(0, i + 1).reduce((sum, r) => sum + r, 0))) * 100,
    }
  }, [historicalData])

  if (!data || !metrics) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const currentPrice = Number.parseFloat(data.price)
  const priceChange = Number.parseFloat(data.priceChangePercent)
  const isPositive = priceChange >= 0

  return (
    <div className="space-y-4">
      {/* Current Price Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {data.symbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={cn("font-medium", isPositive ? "text-green-600" : "text-red-600")}>
                {priceChange > 0 ? "+" : ""}
                {priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* RSI */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>RSI (14)</span>
              <span className="font-medium">{metrics.rsi.toFixed(1)}</span>
            </div>
            <Progress value={metrics.rsi} className="h-2" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Oversold (30)</span>
              <span>Overbought (70)</span>
            </div>
          </div>

          {/* Volatility */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Volatility</span>
              <Badge
                variant={metrics.volatility > 50 ? "destructive" : metrics.volatility > 25 ? "secondary" : "default"}
              >
                {metrics.volatility.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Levels */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4" />
            Key Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Resistance</span>
            <span className="font-medium text-red-600">${metrics.resistance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Current</span>
            <span className="font-medium">${currentPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Support</span>
            <span className="font-medium text-green-600">${metrics.support.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Moving Averages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Moving Averages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">SMA 20</span>
            <span className={cn("font-medium", currentPrice > metrics.sma20 ? "text-green-600" : "text-red-600")}>
              ${metrics.sma20.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">SMA 50</span>
            <span className={cn("font-medium", currentPrice > metrics.sma50 ? "text-green-600" : "text-red-600")}>
              ${metrics.sma50.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Volume Analysis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Volume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">24h Volume</span>
            <span className="font-medium">{(Number.parseFloat(data.volume) / 1000000).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Avg Volume</span>
            <span className="font-medium">{(metrics.avgVolume / 1000000).toFixed(1)}M</span>
          </div>
          <div className="text-xs text-slate-500">
            Current volume is {((Number.parseFloat(data.volume) / metrics.avgVolume) * 100).toFixed(0)}% of average
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Return</span>
            <span className={cn("font-medium", metrics.totalReturn >= 0 ? "text-green-600" : "text-red-600")}>
              {metrics.totalReturn > 0 ? "+" : ""}
              {metrics.totalReturn.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Max Drawdown</span>
            <span className="font-medium text-red-600">{metrics.maxDrawdown.toFixed(2)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Market Status */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <Badge
              variant={metrics.rsi > 70 ? "destructive" : metrics.rsi < 30 ? "default" : "secondary"}
              className="mb-2"
            >
              {metrics.rsi > 70 ? "Overbought" : metrics.rsi < 30 ? "Oversold" : "Neutral"}
            </Badge>
            <div className="text-xs text-slate-600">Based on RSI indicator</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
