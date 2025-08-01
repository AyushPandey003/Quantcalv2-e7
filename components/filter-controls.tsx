"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Filter, Search, TrendingUp } from "lucide-react"

interface FilterControlsProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  timeframe: "day" | "week" | "month"
  onTimeframeChange: (timeframe: "day" | "week" | "month") => void
}

const POPULAR_SYMBOLS = [
  { symbol: "BTCUSDT", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETHUSDT", name: "Ethereum", category: "Crypto" },
  { symbol: "ADAUSDT", name: "Cardano", category: "Crypto" },
  { symbol: "SOLUSDT", name: "Solana", category: "Crypto" },
  { symbol: "DOTUSDT", name: "Polkadot", category: "Crypto" },
  { symbol: "LINKUSDT", name: "Chainlink", category: "Crypto" },
  { symbol: "MATICUSDT", name: "Polygon", category: "Crypto" },
  { symbol: "AVAXUSDT", name: "Avalanche", category: "Crypto" },
]

const FOREX_SYMBOLS = [
  { symbol: "EURUSD", name: "EUR/USD", category: "Forex" },
  { symbol: "GBPUSD", name: "GBP/USD", category: "Forex" },
  { symbol: "USDJPY", name: "USD/JPY", category: "Forex" },
  { symbol: "AUDUSD", name: "AUD/USD", category: "Forex" },
]

export function FilterControls({ selectedSymbol, onSymbolChange, timeframe, onTimeframeChange }: FilterControlsProps) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Filters & Controls</h3>
          </div>

          {/* Symbol Selection */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="symbol-search" className="text-sm font-medium">
                  Search Symbol
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="symbol-search"
                    placeholder="Search for symbols..."
                    className="pl-10"
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      if (value.length >= 3) {
                        onSymbolChange(value + "USDT")
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex-1">
                <Label htmlFor="symbol-select" className="text-sm font-medium">
                  Quick Select
                </Label>
                <Select value={selectedSymbol} onValueChange={onSymbolChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Popular Cryptocurrencies</div>
                      {POPULAR_SYMBOLS.map((item) => (
                        <SelectItem key={item.symbol} value={item.symbol}>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.symbol}</span>
                            <span className="text-muted-foreground">({item.name})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Popular Symbols Quick Access */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Popular Symbols</Label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SYMBOLS.slice(0, 6).map((item) => (
                  <Button
                    key={item.symbol}
                    variant={selectedSymbol === item.symbol ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSymbolChange(item.symbol)}
                    className="text-xs"
                  >
                    {item.symbol.replace("USDT", "")}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeframe Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Analysis Timeframe</Label>
            <Tabs value={timeframe} onValueChange={(value) => onTimeframeChange(value as "day" | "week" | "month")}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="day" className="text-xs md:text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Daily
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs md:text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs md:text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Current Selection Info */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {selectedSymbol}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} View
            </Badge>
            <Badge variant="outline" className="text-xs">
              Live Data
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
