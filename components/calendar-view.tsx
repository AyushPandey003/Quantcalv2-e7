"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { format, isSameDay, isWithinInterval } from "date-fns"

interface BinanceKlineData {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
}

interface CalendarViewProps {
  historicalData: BinanceKlineData[]
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
  dateRange?: { from: Date; to: Date }
  onDateRangeSelect: (range: { from: Date; to: Date } | undefined) => void
  loading?: boolean
}

interface DayData {
  date: Date
  data: BinanceKlineData | null
  volatility: number
  performance: number
  volume: number
  isInRange: boolean
}

export function CalendarView({
  historicalData,
  selectedDate,
  onDateSelect,
  dateRange,
  onDateRangeSelect,
  loading,
}: CalendarViewProps) {
  const [rangeStart, setRangeStart] = useState<Date | null>(null)

  // Process historical data for calendar display
  const calendarData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return new Map<string, DayData>()

    const dataMap = new Map<string, DayData>()

    historicalData.forEach((item, index) => {
      const date = new Date(item.openTime)
      const dateKey = format(date, "yyyy-MM-dd")

      const open = Number.parseFloat(item.open)
      const close = Number.parseFloat(item.close)
      const high = Number.parseFloat(item.high)
      const low = Number.parseFloat(item.low)
      const volume = Number.parseFloat(item.volume)

      // Calculate daily volatility (high-low range as percentage of open)
      const volatility = ((high - low) / open) * 100

      // Calculate daily performance
      const performance = ((close - open) / open) * 100

      // Check if date is in selected range
      const isInRange = dateRange ? isWithinInterval(date, { start: dateRange.from, end: dateRange.to }) : false

      dataMap.set(dateKey, {
        date,
        data: item,
        volatility,
        performance,
        volume,
        isInRange,
      })
    })

    return dataMap
  }, [historicalData, dateRange])

  // Calculate range statistics
  const rangeStats = useMemo(() => {
    if (!dateRange) return null

    const rangeData = Array.from(calendarData.values()).filter((d) => d.isInRange)
    if (rangeData.length === 0) return null

    const totalReturn = rangeData.reduce((sum, d) => sum + d.performance, 0)
    const avgVolatility = rangeData.reduce((sum, d) => sum + d.volatility, 0) / rangeData.length
    const totalVolume = rangeData.reduce((sum, d) => sum + d.volume, 0)

    return {
      days: rangeData.length,
      totalReturn: totalReturn.toFixed(2),
      avgVolatility: avgVolatility.toFixed(2),
      totalVolume: (totalVolume / 1000000).toFixed(1),
    }
  }, [calendarData, dateRange])

  // Get volatility color based on level
  const getVolatilityColor = (volatility: number) => {
    if (volatility < 1) return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800"
    if (volatility < 2) return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800"
    if (volatility < 3) return "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800"
    return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800"
  }

  // Get performance indicator
  const getPerformanceIndicator = (performance: number) => {
    if (Math.abs(performance) < 0.5) return "→"
    return performance > 0 ? "↗" : "↘"
  }

  // Get volume indicator size
  const getVolumeSize = (volume: number, maxVolume: number) => {
    const ratio = volume / maxVolume
    if (ratio < 0.3) return "w-1 h-1"
    if (ratio < 0.6) return "w-1.5 h-1.5"
    if (ratio < 0.8) return "w-2 h-2"
    return "w-2.5 h-2.5"
  }

  const maxVolume = useMemo(() => {
    return Math.max(...Array.from(calendarData.values()).map((d) => d.volume))
  }, [calendarData])

  // Handle date click for range selection
  const handleDateClick = (date: Date) => {
    if (!rangeStart) {
      setRangeStart(date)
      onDateSelect(date)
    } else {
      const start = rangeStart < date ? rangeStart : date
      const end = rangeStart < date ? date : rangeStart
      onDateRangeSelect({ from: start, to: end })
      setRangeStart(null)
    }
  }

  // Custom day content renderer
  const renderDayContent = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dayData = calendarData.get(dateKey)

    if (!dayData) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <span className="text-slate-400">{date.getDate()}</span>
        </div>
      )
    }

    const { volatility, performance, volume, isInRange } = dayData
    const isSelected = selectedDate && isSameDay(date, selectedDate)

    return (
      <div
        className={cn(
          "relative w-full h-full flex flex-col items-center justify-center p-1 rounded-md border transition-all cursor-pointer hover:scale-105",
          getVolatilityColor(volatility),
          isSelected && "ring-2 ring-blue-500",
          isInRange && "ring-1 ring-purple-400",
        )}
        onClick={() => handleDateClick(date)}
      >
        <span className="text-xs font-medium">{date.getDate()}</span>
        <div className="flex items-center justify-between w-full mt-0.5">
          <span className="text-xs">{getPerformanceIndicator(performance)}</span>
          <div className={cn("rounded-full bg-blue-500 opacity-60", getVolumeSize(volume, maxVolume))} />
        </div>
        {Math.abs(performance) > 2 && (
          <div className="absolute -top-1 -right-1">
            <div className={cn("w-2 h-2 rounded-full", performance > 0 ? "bg-green-500" : "bg-red-500")} />
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  // Legend
  const legendItems = [
    { label: "Low Volatility (<1%)", color: "bg-green-100 dark:bg-green-900/30" },
    { label: "Medium Volatility (1-2%)", color: "bg-yellow-100 dark:bg-yellow-900/30" },
    { label: "High Volatility (2-3%)", color: "bg-orange-100 dark:bg-orange-900/30" },
    { label: "Very High Volatility (>3%)", color: "bg-red-100 dark:bg-red-900/30" },
  ]

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {legendItems.map((item, index) => (
          <Badge key={index} variant="outline" className={item.color}>
            {item.label}
          </Badge>
        ))}
      </div>

      {/* Instructions */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Click dates to select a range for analysis. Arrows show daily performance direction, dots show relative volume.
      </div>

      {/* Calendar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              className="rounded-md border-0"
              components={{
                DayContent: ({ date }) => renderDayContent(date),
              }}
            />
          </CardContent>
        </Card>

        {/* Range Statistics */}
        {rangeStats && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Range Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Period:</span>
                  <span className="font-medium">{rangeStats.days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Return:</span>
                  <span
                    className={cn(
                      "font-medium",
                      Number.parseFloat(rangeStats.totalReturn) >= 0 ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {rangeStats.totalReturn}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Avg Volatility:</span>
                  <span className="font-medium">{rangeStats.avgVolatility}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Volume:</span>
                  <span className="font-medium">{rangeStats.totalVolume}M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{format(selectedDate, "MMMM d, yyyy")}</h3>
            {(() => {
              const dateKey = format(selectedDate, "yyyy-MM-dd")
              const dayData = calendarData.get(dateKey)

              if (!dayData?.data) {
                return <p className="text-slate-500">No data available for this date</p>
              }

              const { data, volatility, performance } = dayData
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Open</p>
                    <p className="font-medium">${Number.parseFloat(data.open).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Close</p>
                    <p className="font-medium">${Number.parseFloat(data.close).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">High</p>
                    <p className="font-medium text-green-600">${Number.parseFloat(data.high).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Low</p>
                    <p className="font-medium text-red-600">${Number.parseFloat(data.low).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Performance</p>
                    <p className={cn("font-medium", performance >= 0 ? "text-green-600" : "text-red-600")}>
                      {performance.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Volatility</p>
                    <p className="font-medium">{volatility.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Volume</p>
                    <p className="font-medium">{(Number.parseFloat(data.volume) / 1000000).toFixed(2)}M</p>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
