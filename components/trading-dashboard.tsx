"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, DollarSign, TrendingDown, Activity, BarChart3, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { CandlestickChart } from "@/components/candlestick-chart"
import { CandlestickChart as EnhancedCandlestickChart } from "@/components/candlesticksChart"
import { OrderbookWidget } from "@/components/orderbook-widget"
import { AdvancedCharts } from "@/components/advanced-charts"
import { TradingPanel } from "@/components/trading-panel"
import { MarketDepth } from "@/components/market-depth"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

interface TradingDashboardProps {
  onNavigate: (view: "home" | "calendar" | "dashboard" | "profile") => void
}

export function TradingDashboard({ onNavigate }: TradingDashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await logout()
    onNavigate("home")
  }

  // Mock price data for demonstration
  const mockPriceData = {
    currentPrice: 43250.50,
    change24h: 1250.75,
    changePercent24h: 2.98,
    high24h: 44500.00,
    low24h: 41800.00,
    volume24h: 2847500000,
  }

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
            <ThemeToggle />
            <UserAvatar onClick={() => onNavigate("profile")} />
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-4">
        {/* Price Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">{selectedSymbol}</div>
                  <div className="text-2xl font-bold">${mockPriceData.currentPrice.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${mockPriceData.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {mockPriceData.changePercent24h >= 0 ? '+' : ''}{mockPriceData.changePercent24h}%
                  </div>
                  <div className={`text-xs ${mockPriceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {mockPriceData.change24h >= 0 ? '+' : ''}${mockPriceData.change24h.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-xs text-muted-foreground">24h High</div>
                  <div className="text-sm font-medium">${mockPriceData.high24h.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <div>
                  <div className="text-xs text-muted-foreground">24h Low</div>
                  <div className="text-sm font-medium">${mockPriceData.low24h.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-xs text-muted-foreground">24h Volume</div>
                  <div className="text-sm font-medium">${(mockPriceData.volume24h / 1000000000).toFixed(2)}B</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Symbol</div>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="text-sm font-medium bg-background border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Timeframe</div>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="text-sm font-medium bg-background border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
            </CardContent>
          </Card>
        </div>

        {/* Main Chart - Full Width */}
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedSymbol} Chart</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Live</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <Tabs defaultValue="enhanced" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
                <TabsTrigger value="candlestick">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="depth">Market Depth</TabsTrigger>
              </TabsList>
              <TabsContent value="enhanced" className="h-[600px] mt-4">
                <EnhancedCandlestickChart symbol={selectedSymbol.toLowerCase()} timeframe={selectedTimeframe} />
              </TabsContent>
              <TabsContent value="candlestick" className="h-[600px] mt-4">
                <CandlestickChart symbol={selectedSymbol} timeframe={selectedTimeframe} />
              </TabsContent>
              <TabsContent value="advanced" className="h-[600px] mt-4">
                <AdvancedCharts symbol={selectedSymbol} timeframe={selectedTimeframe} />
              </TabsContent>
              <TabsContent value="depth" className="h-[600px] mt-4">
                <MarketDepth symbol={selectedSymbol} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trading Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order Book */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Order Book</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <OrderbookWidget symbol={selectedSymbol} />
            </CardContent>
          </Card>

          {/* Trading Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Place Order</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <TradingPanel symbol={selectedSymbol} />
            </CardContent>
          </Card>

          {/* Market Statistics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Market Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Market Cap</div>
                    <div className="text-sm font-medium">$845.2B</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Circulating Supply</div>
                    <div className="text-sm font-medium">19.5M BTC</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Max Supply</div>
                    <div className="text-sm font-medium">21M BTC</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">All Time High</div>
                    <div className="text-sm font-medium">$69,045</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-2">Recent Trades</div>
                  <div className="space-y-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className={i % 2 === 0 ? 'text-green-500' : 'text-red-500'}>
                          ${(mockPriceData.currentPrice + (Math.random() - 0.5) * 100).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          {(Math.random() * 2).toFixed(4)}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
