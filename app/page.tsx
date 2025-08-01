"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, BarChart3, Calendar, Activity, Zap, Globe, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Interactive Calendar",
      description: "Visualize market data across time with our intuitive calendar interface",
      color: "text-blue-500",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Charts",
      description: "Candlestick charts, technical indicators, and real-time data visualization",
      color: "text-green-500",
    },
    {
      icon: <Activity className="h-8 w-8" />,
      title: "Real-time Data",
      description: "Live market data from Binance with WebSocket connections",
      color: "text-purple-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Volatility Analysis",
      description: "Track market volatility patterns and identify trading opportunities",
      color: "text-yellow-500",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multi-Asset Support",
      description: "Support for major cryptocurrencies and trading pairs",
      color: "text-indigo-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Reliable & Secure",
      description: "Built with modern web technologies for optimal performance",
      color: "text-red-500",
    },
  ]

  const stats = [
    { label: "Trading Pairs", value: "100+", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Real-time Updates", value: "24/7", icon: <Clock className="h-5 w-5" /> },
    { label: "Data Points", value: "1M+", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Uptime", value: "99.9%", icon: <Shield className="h-5 w-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-6 md:space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Activity className="h-4 w-4 mr-2" />
              Real-time Financial Data
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Financial Calendar
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Reimagined
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Visualize market volatility, track performance, and analyze financial data with our interactive calendar
              interface. Get real-time insights from cryptocurrency markets with advanced charting tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/calendar">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl">
                Launch Calendar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl bg-transparent"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 md:mt-24">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex justify-center mb-2">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">{stat.icon}</div>
                </div>
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to analyze financial markets and make informed decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm ${
                hoveredFeature === index ? "shadow-2xl -translate-y-2" : ""
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <CardHeader className="pb-4">
                <div className={`${feature.color} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8 md:p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of traders and analysts who trust our platform for their financial data visualization
              needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl">
                  Start Analyzing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Financial Calendar. Built with Next.js and shadcn/ui.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
