"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MarketOverviewProps {
  cryptoData: Record<string, any>
}

export function MarketOverview({ cryptoData }: MarketOverviewProps) {
  const cryptos = Object.entries(cryptoData)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cryptos.map(([symbol, data]) => {
        const isPositive = Number.parseFloat(data.change) >= 0
        const cryptoName = symbol.replace("USDT", "")

        return (
          <Card key={symbol} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cryptoName}</CardTitle>
                <Badge variant={isPositive ? "default" : "destructive"}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-2xl font-bold">${Number.parseFloat(data.price).toLocaleString()}</p>
                <p className={`text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}
                  {data.change}%
                </p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Volume:</span>
                  <span>${(Number.parseFloat(data.volume) / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Cap:</span>
                  <span>${(Number.parseFloat(data.marketCap) / 1000000000).toFixed(1)}B</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
