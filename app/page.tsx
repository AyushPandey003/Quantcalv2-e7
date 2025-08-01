"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar-view"
import { DataDashboard } from "@/components/data-dashboard"
import { FilterControls } from "@/components/filter-controls"
import { useBinanceData } from "@/hooks/use-binance-data"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, BarChart3 } from "lucide-react"

export default function FinancialCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day")
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null)

  const { data, isConnected, connectionStatus, historicalData, loading } = useBinanceData(selectedSymbol)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleRangeSelect = (range: { start: Date; end: Date } | null) => {
    setSelectedRange(range)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Financial Calendar</h1>
              <p className="text-muted-foreground">Interactive volatility, liquidity, and performance visualization</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="outline">{connectionStatus}</Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Current Price</p>
                  <p className="text-2xl font-bold">
                    ${data?.price ? Number.parseFloat(data.price).toLocaleString() : "Loading..."}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
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
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">24h Volume</p>
                  <p className="text-2xl font-bold">
                    {data?.volume ? `$${(Number.parseFloat(data.volume) / 1000000).toFixed(1)}M` : "Loading..."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Filter Controls */}
        <FilterControls
          selectedSymbol={selectedSymbol}
          onSymbolChange={setSelectedSymbol}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "day" | "week" | "month")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">Daily</TabsTrigger>
                  <TabsTrigger value="week">Weekly</TabsTrigger>
                  <TabsTrigger value="month">Monthly</TabsTrigger>
                </TabsList>
                <TabsContent value={timeframe} className="mt-6">
                  <CalendarView
                    timeframe={timeframe}
                    data={historicalData}
                    selectedDate={selectedDate}
                    selectedRange={selectedRange}
                    onDateSelect={handleDateSelect}
                    onRangeSelect={handleRangeSelect}
                    loading={loading}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Data Dashboard */}
          <div className="lg:col-span-1">
            <DataDashboard
              selectedDate={selectedDate}
              selectedRange={selectedRange}
              data={data}
              historicalData={historicalData}
              symbol={selectedSymbol}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
