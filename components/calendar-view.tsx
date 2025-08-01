"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  timeframe: "day" | "week" | "month"
  data: any[]
  selectedDate: Date | null
  selectedRange: { start: Date; end: Date } | null
  onDateSelect: (date: Date) => void
  onRangeSelect: (range: { start: Date; end: Date } | null) => void
  loading: boolean
}

interface DayData {
  date: Date
  volatility: number
  performance: number
  volume: number
  high: number
  low: number
  open: number
  close: number
  raw: any
}

export function CalendarView({
  timeframe,
  data,
  selectedDate,
  selectedRange,
  onDateSelect,
  onRangeSelect,
  loading,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isRangeMode, setIsRangeMode] = useState(false)
  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  // Calculate volatility and performance for each date
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return new Map<string, DayData>()

    const dataMap = new Map<string, DayData>()

    data.forEach((item) => {
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

  const getLiquiditySize = (volume: number) => {
    // Normalize volume to a scale of 1-4 for visual representation
    const maxVolume = Math.max(...Array.from(processedData.values()).map((d) => d.volume))
    const minVolume = Math.min(...Array.from(processedData.values()).map((d) => d.volume))
    const normalizedVolume = (volume - minVolume) / (maxVolume - minVolume)
    return Math.max(1, Math.min(4, Math.ceil(normalizedVolume * 4)))
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
    const isRangeStart = rangeStart?.toDateString() === dateKey

    if (!dayData) {
      return (
        <div
          className={cn(
            "w-full h-10 md:h-12 flex items-center justify-center text-xs md:text-sm cursor-pointer rounded transition-colors",
            isToday && "bg-blue-100 border border-blue-300 dark:bg-blue-900/20 dark:border-blue-700",
            isSelected && "bg-blue-200 border-2 border-blue-500 dark:bg-blue-800/30 dark:border-blue-400",
            isInRange && "bg-blue-50 dark:bg-blue-900/10",
            isRangeStart && "bg-purple-100 border-2 border-purple-500 dark:bg-purple-900/20 dark:border-purple-400",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
          )}
          onClick={() => handleDateClick(date)}
        >
          {date.getDate()}
        </div>
      )
    }

    const liquiditySize = getLiquiditySize(dayData.volume)

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-full h-10 md:h-12 flex flex-col items-center justify-center text-xs cursor-pointer border rounded transition-all hover:scale-105 relative",
                getVolatilityColor(dayData.volatility),
                isToday && "ring-2 ring-blue-500",
                isSelected && "ring-2 ring-purple-500",
                isInRange && "ring-1 ring-blue-300",
                isRangeStart && "ring-2 ring-purple-400",
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="font-medium text-xs md:text-sm">{date.getDate()}</div>
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    "text-xs font-bold",
                    dayData.performance > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                  )}
                >
                  {getPerformanceIndicator(dayData.performance)}
                </span>
                {/* Liquidity indicator */}
                <div
                  className={cn(
                    "rounded-full bg-current opacity-60",
                    liquiditySize === 1 && "w-1 h-1",
                    liquiditySize === 2 && "w-1.5 h-1.5",
                    liquiditySize === 3 && "w-2 h-2",
                    liquiditySize === 4 && "w-2.5 h-2.5",
                  )}
                />
              </div>
              {/* Volatility intensity indicator */}
              <div className="absolute top-1 right-1">
                {dayData.volatility > 10 && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{date.toLocaleDateString()}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">OHLC</p>
                  <p>O: ${dayData.open.toFixed(2)}</p>
                  <p>H: ${dayData.high.toFixed(2)}</p>
                  <p>L: ${dayData.low.toFixed(2)}</p>
                  <p>C: ${dayData.close.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Metrics</p>
                  <p>Vol: {dayData.volatility.toFixed(2)}%</p>
                  <p>Perf: {dayData.performance.toFixed(2)}%</p>
                  <p>Vol: ${(dayData.volume / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (loading) {
    return (
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-base md:text-lg font-semibold">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
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
          {rangeStart && (
            <Badge variant="outline" className="text-xs">
              Range Start: {rangeStart.toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
          Low Volatility (&lt;2%)
        </Badge>
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700">
          Medium (2-5%)
        </Badge>
        <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700">
          High (5-10%)
        </Badge>
        <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700">
          Very High (&gt;10%)
        </Badge>
        <div className="flex items-center space-x-1 ml-4">
          <span className="text-xs text-muted-foreground">Liquidity:</span>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-current rounded-full opacity-60" />
            <span className="text-xs">Low</span>
            <div className="w-2.5 h-2.5 bg-current rounded-full opacity-60" />
            <span className="text-xs">High</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="h-6 md:h-8 flex items-center justify-center text-xs md:text-sm font-medium text-muted-foreground"
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
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium">Selected Range:</p>
          <p className="text-sm text-muted-foreground">
            {selectedRange.start.toLocaleDateString()} - {selectedRange.end.toLocaleDateString()}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from(processedData.values())
              .filter((d) => d.date >= selectedRange.start && d.date <= selectedRange.end)
              .slice(0, 3)
              .map((dayData, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {dayData.date.toLocaleDateString()}: {dayData.performance.toFixed(1)}%
                </Badge>
              ))}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm font-medium">Selected Date:</p>
          <p className="text-sm text-muted-foreground">{selectedDate.toLocaleDateString()}</p>
          {processedData.get(selectedDate.toDateString()) && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>Performance: {processedData.get(selectedDate.toDateString())!.performance.toFixed(2)}%</div>
              <div>Volatility: {processedData.get(selectedDate.toDateString())!.volatility.toFixed(2)}%</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
