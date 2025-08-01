"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"

interface ChartData {
  time: string
  price: number
}

interface FeaturedChart {
  symbol: string
  data: ChartData[]
  currentPrice: number
  change: number
}

export function FeaturedCharts() {
  const [charts, setCharts] = useState<FeaturedChart[]>([])
  const [loading, setLoading] = useState(true)

  const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const chartPromises = symbols.map(async (symbol) => {
          // Fetch current price
          const tickerResponse = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
          const tickerData = await tickerResponse.json()

          // Fetch kline data for mini chart
          const klineResponse = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`,
          )
          const klineData = await klineResponse.json()

          const chartData = klineData.map((kline: any[]) => ({
            time: new Date(kline[0]).toLocaleTimeString(),
            price: Number.parseFloat(kline[4]), // Close price
          }))

          return {
            symbol,
            data: chartData,
            currentPrice: Number.parseFloat(tickerData.lastPrice),
            change: Number.parseFloat(tickerData.priceChangePercent),
          }
        })

        const results = await Promise.all(chartPromises)
        setCharts(results)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching chart data:", error)
        setLoading(false)
      }
    }

    fetchChartData()
    const interval = setInterval(fetchChartData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {charts.map((chart) => {
        const isPositive = chart.change >= 0

        return (
          <Card key={chart.symbol} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{chart.symbol.replace("USDT", "/USDT")}</span>
                <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}
                  {chart.change.toFixed(2)}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-lg font-bold">${chart.currentPrice.toLocaleString()}</div>
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chart.data}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive ? "#10b981" : "#ef4444"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
