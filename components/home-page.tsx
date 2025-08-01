"use client"

import { useState, useEffect } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  BarChart3,
  Activity,
  Users,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Star,
  ChevronRight,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MarketOverview } from "@/components/market-overview"
import { FeaturedCharts } from "@/components/featured-charts"
import { useBinanceData } from "@/hooks/use-binance-data"

interface HomePageProps {
  onNavigate: (view: "home" | "dashboard" | "profile") => void
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const { data, isConnected } = useBinanceData(selectedSymbol)

  const topCryptos = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT"]
  const [cryptoData, setCryptoData] = useState<Record<string, any>>({})

  useEffect(() => {
    // Simulate fetching data for multiple cryptocurrencies
    const fetchMultipleData = async () => {
      const mockData: Record<string, any> = {}
      topCryptos.forEach((symbol, index) => {
        mockData[symbol] = {
          price: (Math.random() * 50000 + 1000).toFixed(2),
          change: (Math.random() * 10 - 5).toFixed(2),
          volume: (Math.random() * 1000000000).toFixed(0),
          marketCap: (Math.random() * 500000000000).toFixed(0),
        }
      })
      setCryptoData(mockData)
    }
    fetchMultipleData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">QuantCal</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" onClick={() => onNavigate("home")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => onNavigate("dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => onNavigate("profile")}>
              Profile
            </Button>
          </nav>

          <div className="flex items-center space-x-4">
            <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Live" : "Offline"}</Badge>
            <ThemeToggle />
            <Button onClick={() => onNavigate("dashboard")}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Advanced Financial
              <br />
              Trading Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Real-time market data, advanced charting, and professional trading tools. Connect to Binance WebSocket for
              live cryptocurrency analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => onNavigate("dashboard")} className="text-lg px-8">
                Start Trading
                <Zap className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                View Demo
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float">
            <Card className="w-48 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">BTC/USDT</p>
                  <p className="text-lg font-bold text-green-500">+5.2%</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="absolute top-32 right-10 animate-float-delayed">
            <Card className="w-48 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Volume</p>
                  <p className="text-lg font-bold">$2.4B</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Live Market Overview</h2>
            <p className="text-muted-foreground">Real-time cryptocurrency prices and market data</p>
          </div>
          <MarketOverview cryptoData={cryptoData} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground">Everything you need for professional trading</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Advanced Charts</CardTitle>
                <CardDescription>Professional candlestick charts with technical indicators</CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Real-time Data</CardTitle>
                <CardDescription>Live market data via Binance WebSocket connection</CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>Bank-level security with 99.9% uptime guarantee</CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Global Markets</CardTitle>
                <CardDescription>Access to worldwide cryptocurrency markets</CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Community</CardTitle>
                <CardDescription>Join thousands of traders in our community</CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Premium Tools</CardTitle>
                <CardDescription>Advanced analytics and trading indicators</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Charts */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Charts</h2>
            <p className="text-muted-foreground">Interactive charts with real-time data</p>
          </div>
          <FeaturedCharts />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Trading?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of traders using our platform for professional cryptocurrency analysis
          </p>
          <Button size="lg" variant="secondary" onClick={() => onNavigate("dashboard")} className="text-lg px-8">
            Launch Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">QuantCal</span>
              </div>
              <p className="text-slate-400">Professional trading platform for cryptocurrency markets</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Dashboard</li>
                <li>Charts</li>
                <li>Analytics</li>
                <li>API</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 QuantCal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
