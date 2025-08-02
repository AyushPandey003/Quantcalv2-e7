"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MarketData {
  symbol: string
  weightedAvgPrice: string
  priceChangePercent: string
  volume: string
  highPrice: string
  lowPrice: string
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)

  const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "XRPUSDT"]

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const promises = symbols.map((symbol) =>
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`).then((res) => res.json()),
        )
        console.log("Fetching market data for symbols:", symbols)

        const results = await Promise.all(promises)
        console.log("Market data fetched successfully:", results)
        setMarketData(results)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching market data:", error)
        setLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {marketData.map((coin) => {
        const isPositive = Number.parseFloat(coin.priceChangePercent) >= 0
        const price = Number.parseFloat(coin.weightedAvgPrice)
        const change = Number.parseFloat(coin.priceChangePercent)
        const volume = Number.parseFloat(coin.volume)

        return (
          <Card key={coin.symbol} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{coin.symbol.replace("USDT", "/USDT")}</span>
                <Badge variant={isPositive ? "default" : "destructive"}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {change.toFixed(2)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">${price.toLocaleString()}</div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <div>24h High</div>
                    <div className="font-medium">${Number.parseFloat(coin.highPrice).toLocaleString()}</div>
                  </div>
                  <div>
                    <div>24h Low</div>
                    <div className="font-medium">${Number.parseFloat(coin.lowPrice).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>24h Volume</div>
                  <div className="font-medium">${(volume / 1000000).toFixed(1)}M</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
