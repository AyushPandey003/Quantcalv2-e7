"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar-view"
import { useBinanceData } from "@/hooks/use-binance-data"
import { HomePage } from "@/components/home-page"
import { TradingDashboard } from "@/components/trading-dashboard"
import { UserProfile } from "@/components/user-profile"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "calendar" | "dashboard" | "profile">("home")
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background">
        {currentView === "home" && <HomePage onNavigate={setCurrentView} />}
        {currentView === "calendar" && (
          <CalendarView
            timeframe={timeframe}
            data={historicalData}
            selectedDate={selectedDate}
            selectedRange={selectedRange}
            onDateSelect={handleDateSelect}
            onRangeSelect={handleRangeSelect}
            loading={loading}
            onNavigate={setCurrentView}
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            onTimeframeChange={setTimeframe}
            marketData={data}
            isConnected={isConnected}
            connectionStatus={connectionStatus}
          />
        )}
        {currentView === "dashboard" && <TradingDashboard onNavigate={setCurrentView} />}
        {currentView === "profile" && <UserProfile onNavigate={setCurrentView} />}
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
