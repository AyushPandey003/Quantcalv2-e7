"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight, ArrowLeft, TrendingUp, Activity, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { FilterControls } from "@/components/filter-controls"
import { DataDashboard } from "@/components/data-dashboard"
import { ThemeToggle } from "@/components/theme-toggle"

interface CalendarViewProps {
  timeframe: "day" | "week" | "month"
  data: any[]
  selectedDate: Date | null
  selectedRange: { start: Date; end: Date } | null
  onDateSelect: (date: Date) => void
  onRangeSelect: (range: { start: Date; end: Date } | null) => void
  loading: boolean
  onNavigate: (view: "home" | "calendar" | "dashboard" | "profile") => void
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
  onTimeframeChange: (timeframe: "day" | "week" | "month") => void
  marketData: any
  isConnected: boolean
  connectionStatus: string
}

export function CalendarView({
  timeframe,
  data,
  selectedDate,
  selectedRange,
  onDateSelect,
  onRangeSelect,
  loading,
  onNavigate,
  selectedSymbol,
  onSymbolChange,
  onTimeframeChange,
  marketData,
  isConnected,
  connectionStatus,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isRangeMode, setIsRangeMode] = useState(false)
  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  // Calculate volatility and performance for each date
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return new Map()

    const dataMap = new Map()

    data.forEach((item, index) => {
      const date = new Date(item.openTime)
      const dateKey = date.toDateString()

      // Calculate volatility (using high-low range as proxy)
      const volatility =
        ((Number.parseFloat(item.high) - Number.parseFloat(item.low)) / Number.parseFloat(item.open)) * 100

      // Calculate performance
      const performance =
        ((Number.parseFloat(item.close) - Number.parseFloat(item.open)) / Number.parseFloat(item.open)) * 100

      // Calculate volume (liquidity proxy)
      const volume = Number.parseFloat(item.volume)

      dataMap.set(dateKey, {
        date,
        volatility,
        performance,
        volume,
        high: Number.parseFloat(item.high),
        low: Number.parseFloat(item.low),
        open: Number.parseFloat(item.open),
        close: Number.parseFloat(item.close),
        raw: item,
      })
    })

    return dataMap
  }, [data])

  const getVolatilityColor = (volatility: number) => {
    if (volatility < 2)
      return "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
    if (volatility < 5)
      return "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300"
    if (volatility < 10)
      return "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300"
    return "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300"
  }

  const getPerformanceIndicator = (performance: number) => {
    if (performance > 0) return "↗"
    if (performance < 0) return "↘"
    return "→"
  }

  const handleDateClick = (date: Date) => {
    if (isRangeMode) {
      if (!rangeStart) {
        setRangeStart(date)
      } else {
        const start = rangeStart < date ? rangeStart : date
        const end = rangeStart < date ? date : rangeStart
        onRangeSelect({ start, end })
        setRangeStart(null)
        setIsRangeMode(false)
      }
    } else {
      onDateSelect(date)
    }
  }

  const renderCalendarCell = (date: Date) => {
    const dateKey = date.toDateString()
    const dayData = processedData.get(dateKey)
    const isToday = date.toDateString() === new Date().toDateString()
    const isSelected = selectedDate?.toDateString() === dateKey
    const isInRange = selectedRange && date >= selectedRange.start && date <= selectedRange.end

    if (!dayData) {
      return (
        <div
          className={cn(
            "w-full h-12 flex items-center justify-center text-sm cursor-pointer rounded-md transition-colors hover:bg-muted/50",
            isToday && "bg-primary/10 border border-primary/30",
            isSelected && "bg-primary/20 border-2 border-primary/50",
            isInRange && "bg-primary/5",
          )}
          onClick={() => handleDateClick(date)}
        >
          {date.getDate()}
        </div>
      )
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-full h-12 flex flex-col items-center justify-center text-xs cursor-pointer border rounded-md transition-all hover:scale-105",
                getVolatilityColor(dayData.volatility),
                isToday && "ring-2 ring-primary",
                isSelected && "ring-2 ring-purple-500",
                isInRange && "ring-1 ring-primary/50",
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="font-medium">{date.getDate()}</div>
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    "text-xs",
                    dayData.performance > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                  )}
                >
                  {getPerformanceIndicator(dayData.performance)}
                </span>
                <div
                  className="w-1 h-1 rounded-full bg-current opacity-60"
                  style={{
                    transform: `scale(${Math.min(dayData.volume / 1000000, 3)})`,
                  }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{date.toLocaleDateString()}</p>
              <p>Volatility: {dayData.volatility.toFixed(2)}%</p>
              <p>Performance: {dayData.performance.toFixed(2)}%</p>
              <p>Volume: ${(dayData.volume / 1000000).toFixed(1)}M</p>
              <p>High: ${dayData.high.toLocaleString()}</p>
              <p>Low: ${dayData.low.toLocaleString()}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (loading) {
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
                <span className="text-xl font-bold">Financial Calendar</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="container mx-auto p-6">
          <Card className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </Card>
        </div>
      </div>
    )
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
              <span className="text-xl font-bold">Financial Calendar</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="outline">{connectionStatus}</Badge>
            </div>
            <ThemeToggle />
            <Button onClick={() => onNavigate("dashboard")}>Trading Dashboard</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Current Price</p>
                <p className="text-2xl font-bold">
                  ${marketData?.price ? Number.parseFloat(marketData.price).toLocaleString() : "Loading..."}
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
                    marketData?.priceChangePercent && Number.parseFloat(marketData.priceChangePercent) >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {marketData?.priceChangePercent
                    ? `${Number.parseFloat(marketData.priceChangePercent).toFixed(2)}%`
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
                  {marketData?.volume
                    ? `$${(Number.parseFloat(marketData.volume) / 1000000).toFixed(1)}M`
                    : "Loading..."}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Controls */}
        <FilterControls
          selectedSymbol={selectedSymbol}
          onSymbolChange={onSymbolChange}
          timeframe={timeframe}
          onTimeframeChange={onTimeframeChange}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Interactive Financial Calendar</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <Tabs value={timeframe} onValueChange={(value) => onTimeframeChange(value as "day" | "week" | "month")}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="day">Daily</TabsTrigger>
                    <TabsTrigger value="week">Weekly</TabsTrigger>
                    <TabsTrigger value="month">Monthly</TabsTrigger>
                  </TabsList>
                  <TabsContent value={timeframe} className="mt-6">
                    <div className="space-y-4">
                      {/* Calendar Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                            }
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <h3 className="text-lg font-semibold">
                            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                            }
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={isRangeMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setIsRangeMode(!isRangeMode)
                              setRangeStart(null)
                              if (!isRangeMode) onRangeSelect(null)
                            }}
                          >
                            Range Select
                          </Button>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
                          Low Volatility (&lt;2%)
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700">
                          Medium Volatility (2-5%)
                        </Badge>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700">
                          High Volatility (5-10%)
                        </Badge>
                        <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700">
                          Very High Volatility (&gt;10%)
                        </Badge>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Day headers */}
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                          <div
                            key={day}
                            className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
                          >
                            {day}
                          </div>
                        ))}

                        {/* Calendar cells */}
                        {Array.from({ length: 42 }, (_, i) => {
                          const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                          const startOfCalendar = new Date(startOfMonth)
                          startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay())

                          const cellDate = new Date(startOfCalendar)
                          cellDate.setDate(cellDate.getDate() + i)

                          const isCurrentMonth = cellDate.getMonth() === currentMonth.getMonth()

                          return (
                            <div key={i} className={cn("aspect-square", !isCurrentMonth && "opacity-30")}>
                              {renderCalendarCell(cellDate)}
                            </div>
                          )
                        })}
                      </div>

                      {/* Selection Info */}
                      {selectedRange && (
                        <div className="mt-4 p-3 bg-primary/5 rounded-lg border">
                          <p className="text-sm font-medium">Selected Range:</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedRange.start.toLocaleDateString()} - {selectedRange.end.toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Data Dashboard */}
          <div className="lg:col-span-1">
            <DataDashboard
              selectedDate={selectedDate}
              selectedRange={selectedRange}
              data={marketData}
              historicalData={data}
              symbol={selectedSymbol}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
