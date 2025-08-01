"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from "recharts"
import { useBinanceData } from "@/hooks/use-binance-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AdvancedChartsProps {
  symbol: string
  timeframe: string
}

interface TechnicalIndicators {
  sma20: number[]
  sma50: number[]
  ema12: number[]
  ema26: number[]
  rsi: number[]
  macd: number[]
  signal: number[]
  histogram: number[]
  bollinger: {
    upper: number[]
    middle: number[]
    lower: number[]
  }
}

export function AdvancedCharts({ symbol, timeframe }: AdvancedChartsProps) {
  const { historicalData, loading } = useBinanceData(symbol)
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(["sma20", "volume"])
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null)

  const calculateSMA = (data: number[], period: number): number[] => {
    const sma = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(Number.NaN)
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
        sma.push(sum / period)
      }
    }
    return sma
  }

  const calculateEMA = (data: number[], period: number): number[] => {
    const ema = []
    const multiplier = 2 / (period + 1)

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema.push(data[i])
      } else {
        ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1])
      }
    }
    return ema
  }

  const calculateRSI = (data: number[], period = 14): number[] => {
    const rsi = []
    const gains = []
    const losses = []

    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    for (let i = 0; i < gains.length; i++) {
      if (i < period - 1) {
        rsi.push(Number.NaN)
      } else {
        const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
        const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
        const rs = avgGain / avgLoss
        rsi.push(100 - 100 / (1 + rs))
      }
    }

    return [Number.NaN, ...rsi] // Add NaN for first element since we start from index 1
  }

  const calculateMACD = (data: number[]): { macd: number[]; signal: number[]; histogram: number[] } => {
    const ema12 = calculateEMA(data, 12)
    const ema26 = calculateEMA(data, 26)
    const macd = ema12.map((val, i) => val - ema26[i])
    const signal = calculateEMA(macd, 9)
    const histogram = macd.map((val, i) => val - signal[i])

    return { macd, signal, histogram }
  }

  const calculateBollingerBands = (data: number[], period = 20, stdDev = 2) => {
    const sma = calculateSMA(data, period)
    const upper = []
    const lower = []

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(Number.NaN)
        lower.push(Number.NaN)
      } else {
        const slice = data.slice(i - period + 1, i + 1)
        const mean = sma[i]
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period
        const standardDeviation = Math.sqrt(variance)

        upper.push(mean + standardDeviation * stdDev)
        lower.push(mean - standardDeviation * stdDev)
      }
    }

    return { upper, middle: sma, lower }
  }

  const processedData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []

    const data = historicalData.slice(-100)
    const closes = data.map((item: any) => Number.parseFloat(item.close))

    // Calculate all indicators
    const sma20 = calculateSMA(closes, 20)
    const sma50 = calculateSMA(closes, 50)
    const ema12 = calculateEMA(closes, 12)
    const ema26 = calculateEMA(closes, 26)
    const rsi = calculateRSI(closes)
    const macdData = calculateMACD(closes)
    const bollinger = calculateBollingerBands(closes)

    setIndicators({
      sma20,
      sma50,
      ema12,
      ema26,
      rsi,
      macd: macdData.macd,
      signal: macdData.signal,
      histogram: macdData.histogram,
      bollinger,
    })

    return data.map((item: any, index: number) => ({
      time: new Date(item.openTime).toLocaleTimeString(),
      open: Number.parseFloat(item.open),
      high: Number.parseFloat(item.high),
      low: Number.parseFloat(item.low),
      close: Number.parseFloat(item.close),
      volume: Number.parseFloat(item.volume),
      sma20: sma20[index],
      sma50: sma50[index],
      ema12: ema12[index],
      ema26: ema26[index],
      rsi: rsi[index],
      macd: macdData.macd[index],
      signal: macdData.signal[index],
      histogram: macdData.histogram[index],
      bollingerUpper: bollinger.upper[index],
      bollingerMiddle: bollinger.middle[index],
      bollingerLower: bollinger.lower[index],
    }))
  }, [historicalData])

  const toggleIndicator = (indicator: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator) ? prev.filter((i) => i !== indicator) : [...prev, indicator],
    )
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full space-y-4">
      {/* Indicator Controls */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "sma20", label: "SMA 20", color: "blue" },
          { key: "sma50", label: "SMA 50", color: "orange" },
          { key: "ema12", label: "EMA 12", color: "green" },
          { key: "ema26", label: "EMA 26", color: "red" },
          { key: "bollinger", label: "Bollinger Bands", color: "purple" },
          { key: "volume", label: "Volume", color: "gray" },
          { key: "rsi", label: "RSI", color: "yellow" },
          { key: "macd", label: "MACD", color: "cyan" },
        ].map((indicator) => (
          <Button
            key={indicator.key}
            variant={selectedIndicators.includes(indicator.key) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleIndicator(indicator.key)}
          >
            {indicator.label}
          </Button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis domain={["dataMin - 100", "dataMax + 100"]} tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{label}</p>
                      <div className="space-y-1 text-sm">
                        <p>
                          Price: <span className="font-mono">${data.close.toLocaleString()}</span>
                        </p>
                        {selectedIndicators.includes("sma20") && data.sma20 && (
                          <p>
                            SMA 20: <span className="font-mono text-blue-500">${data.sma20.toFixed(2)}</span>
                          </p>
                        )}
                        {selectedIndicators.includes("sma50") && data.sma50 && (
                          <p>
                            SMA 50: <span className="font-mono text-orange-500">${data.sma50.toFixed(2)}</span>
                          </p>
                        )}
                        {selectedIndicators.includes("rsi") && data.rsi && (
                          <p>
                            RSI: <span className="font-mono text-yellow-500">{data.rsi.toFixed(2)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />

            {/* Price Line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
            />

            {/* Technical Indicators */}
            {selectedIndicators.includes("sma20") && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#3b82f6"
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
              />
            )}

            {selectedIndicators.includes("sma50") && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#f97316"
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
              />
            )}

            {selectedIndicators.includes("ema12") && (
              <Line type="monotone" dataKey="ema12" stroke="#10b981" strokeWidth={1} dot={false} />
            )}

            {selectedIndicators.includes("ema26") && (
              <Line type="monotone" dataKey="ema26" stroke="#ef4444" strokeWidth={1} dot={false} />
            )}

            {selectedIndicators.includes("bollinger") && (
              <>
                <Line
                  type="monotone"
                  dataKey="bollingerUpper"
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="2 2"
                />
                <Line
                  type="monotone"
                  dataKey="bollingerLower"
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="2 2"
                />
              </>
            )}

            {selectedIndicators.includes("volume") && (
              <Bar dataKey="volume" fill="hsl(var(--muted))" opacity={0.3} yAxisId="volume" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Chart */}
      {selectedIndicators.includes("rsi") && (
        <div className="h-32">
          <div className="text-sm font-medium mb-2">RSI (14)</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="rsi" stroke="#eab308" strokeWidth={2} dot={false} />
              {/* RSI levels */}
              <Line
                type="monotone"
                dataKey={() => 70}
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={() => 30}
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD Chart */}
      {selectedIndicators.includes("macd") && (
        <div className="h-32">
          <div className="text-sm font-medium mb-2">MACD</div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="macd" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="signal" stroke="#f97316" strokeWidth={2} dot={false} />
              <Bar dataKey="histogram" fill="#6b7280" opacity={0.6} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Current Indicator Values */}
      {indicators && (
        <div className="flex flex-wrap gap-2">
          {selectedIndicators.includes("sma20") && (
            <Badge variant="outline">
              SMA 20: ${indicators.sma20[indicators.sma20.length - 1]?.toFixed(2) || "N/A"}
            </Badge>
          )}
          {selectedIndicators.includes("rsi") && (
            <Badge variant="outline">RSI: {indicators.rsi[indicators.rsi.length - 1]?.toFixed(2) || "N/A"}</Badge>
          )}
          {selectedIndicators.includes("macd") && (
            <Badge variant="outline">MACD: {indicators.macd[indicators.macd.length - 1]?.toFixed(4) || "N/A"}</Badge>
          )}
        </div>
      )}
    </div>
  )
}
