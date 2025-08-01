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
    <Card className="p-3 md:p-4">
      <div className="flex flex-col space-y-4">
        {/* Main Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium whitespace-nowrap">Symbol:</label>
              <Select value={selectedSymbol} onValueChange={onSymbolChange}>
                <SelectTrigger className="w-full sm:w-32">
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

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <label className="text-sm font-medium whitespace-nowrap">View:</label>
              <div className="flex space-x-1 w-full sm:w-auto">
                {(["day", "week", "month"] as const).map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? "default" : "outline"}
                    size="sm"
                    onClick={() => onTimeframeChange(tf)}
                    className="flex-1 sm:flex-none text-xs"
                  >
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="flex-1 sm:flex-none bg-transparent">
              <RefreshCw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 sm:flex-none bg-transparent">
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            Real-time Data
          </Badge>
          <Badge variant="outline" className="text-xs">
            Binance API
          </Badge>
          <Badge variant="outline" className="text-xs">
            WebSocket Connected
          </Badge>
        </div>
      </div>
    </Card>
  )
}
