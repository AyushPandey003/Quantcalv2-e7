"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { CandlestickChart } from "@/components/candlestick-chart"
import { OrderbookWidget } from "@/components/orderbook-widget"
import { AdvancedCharts } from "@/components/advanced-charts"
import { TradingPanel } from "@/components/trading-panel"
import { MarketDepth } from "@/components/market-depth"

interface TradingDashboardProps {
  onNavigate: (view: "home" | "calendar" | "dashboard" | "profile") => void
}

export function TradingDashboard({ onNavigate }: TradingDashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Trading Dashboard</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => onNavigate("calendar")}>
              Calendar View
            </Button>
            <Button variant="outline" onClick={() => onNavigate("profile")}>
              Profile
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-4">
        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
          {/* Charts Section */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedSymbol} Chart</CardTitle>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="px-3 py-1 border rounded-md bg-background"
                    >
                      <option value="1m">1m</option>
                      <option value="5m">5m</option>
                      <option value="15m">15m</option>
                      <option value="1h">1h</option>
                      <option value="4h">4h</option>
                      <option value="1d">1d</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <Tabs defaultValue="candlestick" className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="depth">Market Depth</TabsTrigger>
                  </TabsList>
                  <TabsContent value="candlestick" className="h-[500px] mt-4">
                    <CandlestickChart symbol={selectedSymbol} timeframe={selectedTimeframe} />
                  </TabsContent>
                  <TabsContent value="advanced" className="h-[500px] mt-4">
                    <AdvancedCharts symbol={selectedSymbol} timeframe={selectedTimeframe} />
                  </TabsContent>
                  <TabsContent value="depth" className="h-[500px] mt-4">
                    <MarketDepth symbol={selectedSymbol} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Symbol Selector */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Symbol</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="BTCUSDT">BTC/USDT</option>
                  <option value="ETHUSDT">ETH/USDT</option>
                  <option value="BNBUSDT">BNB/USDT</option>
                  <option value="ADAUSDT">ADA/USDT</option>
                  <option value="SOLUSDT">SOL/USDT</option>
                  <option value="XRPUSDT">XRP/USDT</option>
                  <option value="DOTUSDT">DOT/USDT</option>
                  <option value="DOGEUSDT">DOGE/USDT</option>
                </select>
              </CardContent>
            </Card>

            {/* Orderbook */}
            <Card className="flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Order Book</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <OrderbookWidget symbol={selectedSymbol} />
              </CardContent>
            </Card>

            {/* Trading Panel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Place Order</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <TradingPanel symbol={selectedSymbol} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
