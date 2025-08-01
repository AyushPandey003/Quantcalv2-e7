"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, BarChart3, Activity, Shield, Zap, ArrowRight, Globe, PieChart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MarketOverview } from "@/components/market-overview"
import { FeaturedCharts } from "@/components/featured-charts"

interface HomePageProps {
  onNavigate: (view: "home" | "calendar" | "dashboard" | "profile") => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">QuantCal</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" onClick={() => onNavigate("home")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => onNavigate("calendar")}>
              Calendar
            </Button>
            <Button variant="ghost" onClick={() => onNavigate("dashboard")}>
              Trading
            </Button>
            <Button variant="ghost" onClick={() => onNavigate("profile")}>
              Profile
            </Button>
          </nav>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button onClick={() => onNavigate("dashboard")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Real-time Market Data
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Advanced Financial Calendar & Trading Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Visualize market volatility, track performance, and make informed trading decisions with our comprehensive
              financial calendar and advanced charting tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => onNavigate("calendar")} className="text-lg px-8">
                <Calendar className="h-5 w-5 mr-2" />
                Explore Calendar
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate("dashboard")} className="text-lg px-8">
                <BarChart3 className="h-5 w-5 mr-2" />
                Trading Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Market Overview</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time cryptocurrency market data powered by Binance WebSocket connections
            </p>
          </div>
          <MarketOverview />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for professional financial analysis and trading
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Interactive Calendar</CardTitle>
                <CardDescription>
                  Visualize market volatility and performance with our advanced calendar view
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Daily, weekly, monthly views</li>
                  <li>• Volatility heat mapping</li>
                  <li>• Performance indicators</li>
                  <li>• Range selection tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Advanced Charts</CardTitle>
                <CardDescription>Professional-grade candlestick charts with technical indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Candlestick & OHLC charts</li>
                  <li>• 20+ Technical indicators</li>
                  <li>• Multiple timeframes</li>
                  <li>• Real-time updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Live Orderbook</CardTitle>
                <CardDescription>Real-time market depth and orderbook visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Live bid/ask data</li>
                  <li>• Market depth charts</li>
                  <li>• Volume analysis</li>
                  <li>• Spread monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <PieChart className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Portfolio Tracking</CardTitle>
                <CardDescription>Comprehensive portfolio management and performance analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• P&L tracking</li>
                  <li>• Asset allocation</li>
                  <li>• Performance metrics</li>
                  <li>• Risk analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>Advanced risk management tools and position sizing</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Stop-loss automation</li>
                  <li>• Position sizing</li>
                  <li>• Risk/reward ratios</li>
                  <li>• Drawdown analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <Globe className="h-6 w-6 text-cyan-500" />
                </div>
                <CardTitle>Multi-Exchange</CardTitle>
                <CardDescription>Connect to multiple exchanges with unified interface</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Binance integration</li>
                  <li>• Real-time WebSocket</li>
                  <li>• Cross-exchange analysis</li>
                  <li>• Arbitrage detection</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Charts Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Market Charts</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time visualization of top cryptocurrency markets
            </p>
          </div>
          <FeaturedCharts />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Trading Pairs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Market Data</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1ms</div>
              <div className="text-muted-foreground">Latency</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of traders using our platform for professional market analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => onNavigate("dashboard")} className="text-lg px-8">
                Launch Trading Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate("calendar")} className="text-lg px-8">
                Explore Calendar View
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">QuantCal</span>
              </div>
              <p className="text-muted-foreground">
                Professional financial calendar and trading platform for modern traders.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Button variant="link" className="p-0 h-auto" onClick={() => onNavigate("calendar")}>
                    Calendar
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto" onClick={() => onNavigate("dashboard")}>
                    Trading
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="p-0 h-auto" onClick={() => onNavigate("profile")}>
                    Profile
                  </Button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Advanced Charts</li>
                <li>Live Orderbook</li>
                <li>Technical Analysis</li>
                <li>Risk Management</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 QuantCal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
