"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Settings } from "lucide-react"

interface FilterControlsProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  timeframe: "day" | "week" | "month"
  onTimeframeChange: (timeframe: "day" | "week" | "month") => void
}

const POPULAR_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "ADAUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOTUSDT",
  "DOGEUSDT",
  "AVAXUSDT",
  "MATICUSDT",
]

export function FilterControls({ selectedSymbol, onSymbolChange, timeframe, onTimeframeChange }: FilterControlsProps) {
  const handleExport = () => {
    // Export functionality would be implemented here
    console.log("Exporting data...")
  }

  const handleRefresh = () => {
    // Refresh functionality would be implemented here
    window.location.reload()
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Symbol:</label>
            <Select value={selectedSymbol} onValueChange={onSymbolChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_SYMBOLS.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">View:</label>
            <div className="flex space-x-1">
              {(["day", "week", "month"] as const).map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeframeChange(tf)}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline">Real-time Data</Badge>
        <Badge variant="outline">Binance API</Badge>
        <Badge variant="outline">WebSocket Connected</Badge>
      </div>
    </Card>
  )
}
