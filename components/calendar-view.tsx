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
    if (volatility < 2) return "bg-green-100 border-green-300 text-green-800"
    if (volatility < 5) return "bg-yellow-100 border-yellow-300 text-yellow-800"
    if (volatility < 10) return "bg-orange-100 border-orange-300 text-orange-800"
    return "bg-red-100 border-red-300 text-red-800"
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
            "w-full h-12 flex items-center justify-center text-sm",
            isToday && "bg-blue-100 border border-blue-300 rounded",
            isSelected && "bg-blue-200 border-2 border-blue-500 rounded",
            isInRange && "bg-blue-50",
          )}
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
                "w-full h-12 flex flex-col items-center justify-center text-xs cursor-pointer border rounded transition-all hover:scale-105",
                getVolatilityColor(dayData.volatility),
                isToday && "ring-2 ring-blue-500",
                isSelected && "ring-2 ring-purple-500",
                isInRange && "ring-1 ring-blue-300",
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="font-medium">{date.getDate()}</div>
              <div className="flex items-center space-x-1">
                <span className={cn("text-xs", dayData.performance > 0 ? "text-green-600" : "text-red-600")}>
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
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
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
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge className="bg-green-100 text-green-800 border-green-300">Low Volatility (&lt;2%)</Badge>
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Medium Volatility (2-5%)</Badge>
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">High Volatility (5-10%)</Badge>
        <Badge className="bg-red-100 text-red-800 border-red-300">Very High Volatility (&gt;10%)</Badge>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
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
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium">Selected Range:</p>
          <p className="text-sm text-muted-foreground">
            {selectedRange.start.toLocaleDateString()} - {selectedRange.end.toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}
