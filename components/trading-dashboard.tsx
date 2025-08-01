"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, TrendingUp, Activity, BarChart3, Volume2, DollarSign } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { CandlestickChart } from "@/components/candlestick-chart"
import { OrderbookWidget } from "@/components/orderbook-widget"
import { AdvancedCharts } from "@/components/advanced-charts"
import { TradingPanel } from "@/components/trading-panel"
import { MarketDepth } from "@/components/market-depth"
import { useBinanceData } from "@/hooks/use-binance-data"

interface TradingDashboardProps {
  onNavigate: (view: "home" | "dashboard" | "profile") => void
}

export function TradingDashboard({ onNavigate }: TradingDashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const { data, isConnected, connectionStatus, historicalData, loading } = useBinanceData(selectedSymbol)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("home")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Trading Dashboard</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Live" : "Offline"}</Badge>
            <Badge variant="outline">{connectionStatus}</Badge>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => onNavigate("profile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-2xl font-bold">
                    ${data?.price ? Number.parseFloat(data.price).toLocaleString() : "Loading..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">24h Change</p>
                  <p
                    className={`text-2xl font-bold ${
                      data?.priceChangePercent && Number.parseFloat(data.priceChangePercent) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {data?.priceChangePercent
                      ? `${Number.parseFloat(data.priceChangePercent).toFixed(2)}%`
                      : "Loading..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Volume2 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Volume</p>
                  <p className="text-2xl font-bold">
                    {data?.volume ? `${(Number.parseFloat(data.volume) / 1000000).toFixed(1)}M` : "Loading..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Market Cap</p>
                  <p className="text-2xl font-bold">$1.2T</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Advanced Charts</CardTitle>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="px-3 py-1 border rounded-md bg-background"
                    >
                      <option value="BTCUSDT">BTC/USDT</option>
                      <option value="ETHUSDT">ETH/USDT</option>
                      <option value="BNBUSDT">BNB/USDT</option>
                      <option value="ADAUSDT">ADA/USDT</option>
                    </select>
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
              <CardContent>
                <Tabs defaultValue="candlestick" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="candlestick">Candlestick</TabsTrigger>
                    <TabsTrigger value="advanced">Technical</TabsTrigger>
                    <TabsTrigger value="depth">Market Depth</TabsTrigger>
                  </TabsList>
                  <TabsContent value="candlestick" className="mt-6">
                    <CandlestickChart
                      data={historicalData}
                      symbol={selectedSymbol}
                      timeframe={selectedTimeframe}
                      loading={loading}
                    />
                  </TabsContent>
                  <TabsContent value="advanced" className="mt-6">
                    <AdvancedCharts data={historicalData} symbol={selectedSymbol} />
                  </TabsContent>
                  <TabsContent value="depth" className="mt-6">
                    <MarketDepth symbol={selectedSymbol} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Orderbook */}
            <OrderbookWidget symbol={selectedSymbol} />

            {/* Trading Panel */}
            <TradingPanel symbol={selectedSymbol} currentPrice={data?.price} />
          </div>
        </div>
      </div>
    </div>
  )
}
