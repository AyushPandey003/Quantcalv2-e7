"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MarketDepthProps {
  symbol: string
}

export function MarketDepth({ symbol }: MarketDepthProps) {
  const depthData = useMemo(() => {
    const basePrice = 45000
    const data = []

    // Generate bid side (left side)
    for (let i = 50; i >= 0; i--) {
      const price = basePrice - i * 10
      const cumulativeVolume = (50 - i) * Math.random() * 100 + 100
      data.push({
        price,
        bidVolume: cumulativeVolume,
        askVolume: 0,
        side: "bid",
      })
    }

    // Generate ask side (right side)
    for (let i = 1; i <= 50; i++) {
      const price = basePrice + i * 10
      const cumulativeVolume = i * Math.random() * 100 + 100
      data.push({
        price,
        bidVolume: 0,
        askVolume: cumulativeVolume,
        side: "ask",
      })
    }

    return data
  }, [])

  const chartConfig = {
    bidVolume: {
      label: "Bid Volume",
      color: "#10b981",
    },
    askVolume: {
      label: "Ask Volume",
      color: "#ef4444",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Depth - {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={depthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="price" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: any, name: string) => [
                  `${Number(value).toFixed(2)}`,
                  name === "bidVolume" ? "Bid Volume" : "Ask Volume",
                ]}
              />
              <Area
                type="stepAfter"
                dataKey="bidVolume"
                stackId="1"
                stroke="var(--color-bidVolume)"
                fill="var(--color-bidVolume)"
                fillOpacity={0.6}
              />
              <Area
                type="stepBefore"
                dataKey="askVolume"
                stackId="2"
                stroke="var(--color-askVolume)"
                fill="var(--color-askVolume)"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
