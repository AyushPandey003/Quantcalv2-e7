"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar-view"
import { DataDashboard } from "@/components/data-dashboard"
import { FilterControls } from "@/components/filter-controls"
import { FinancialChart } from "@/components/financial-chart"
import { useBinanceData } from "@/hooks/use-binance-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function CalendarPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()

  const { data, historicalData, isConnected, connectionStatus, loading } = useBinanceData(selectedSymbol)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">FinanceCalendar</h1>
              </Link>
              <Badge variant={isConnected ? "default" : "destructive"} className="hidden sm:inline-flex">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
                {connectionStatus}
              </Badge>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="mt-6">
                    <DataDashboard
                      data={data}
                      historicalData={historicalData}
                      selectedDate={selectedDate}
                      dateRange={dateRange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filter Controls */}
            <FilterControls selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />

            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Financial Calendar - {selectedSymbol}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarView
                  historicalData={historicalData}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  dateRange={dateRange}
                  onDateRangeSelect={setDateRange}
                  loading={loading}
                />
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Price Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FinancialChart data={historicalData} loading={loading} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Hidden on mobile */}
          <div className="hidden md:block">
            <DataDashboard
              data={data}
              historicalData={historicalData}
              selectedDate={selectedDate}
              dateRange={dateRange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
