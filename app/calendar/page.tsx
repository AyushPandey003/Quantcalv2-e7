"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar-view"
import { DataDashboard } from "@/components/data-dashboard"
import { FilterControls } from "@/components/filter-controls"
import { FinancialChart } from "@/components/financial-chart"
import { useBinanceData } from "@/hooks/use-binance-data"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Activity, BarChart3, ArrowLeft, Menu } from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function CalendarPage() {
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

  const MobileDataDashboard = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden bg-transparent">
          <Menu className="h-4 w-4 mr-2" />
          Data Panel
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <div className="overflow-y-auto h-full">
          <DataDashboard
            selectedDate={selectedDate}
            selectedRange={selectedRange}
            data={data}
            historicalData={historicalData}
            symbol={selectedSymbol}
          />
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Financial Calendar</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Interactive volatility, liquidity, and performance visualization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {connectionStatus}
              </Badge>
              <MobileDataDashboard />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <Card className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                <div>
                  <p className="text-xs md:text-sm font-medium">Current Price</p>
                  <p className="text-lg md:text-2xl font-bold">
                    ${data?.price ? Number.parseFloat(data.price).toLocaleString() : "Loading..."}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                <div>
                  <p className="text-xs md:text-sm font-medium">24h Change</p>
                  <p
                    className={`text-lg md:text-2xl font-bold ${
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
            <Card className="p-3 md:p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
                <div>
                  <p className="text-xs md:text-sm font-medium">24h Volume</p>
                  <p className="text-lg md:text-2xl font-bold">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Calendar and Charts */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Calendar View */}
            <Card className="p-4 md:p-6">
              <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "day" | "week" | "month")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day" className="text-xs md:text-sm">
                    Daily
                  </TabsTrigger>
                  <TabsTrigger value="week" className="text-xs md:text-sm">
                    Weekly
                  </TabsTrigger>
                  <TabsTrigger value="month" className="text-xs md:text-sm">
                    Monthly
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={timeframe} className="mt-4 md:mt-6">
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

            {/* Financial Chart */}
            <Card className="p-4 md:p-6">
              <FinancialChart
                data={historicalData}
                symbol={selectedSymbol}
                selectedDate={selectedDate}
                selectedRange={selectedRange}
              />
            </Card>
          </div>

          {/* Data Dashboard - Hidden on mobile, shown in sheet */}
          <div className="hidden lg:block lg:col-span-1">
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
