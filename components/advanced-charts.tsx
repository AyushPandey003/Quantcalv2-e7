"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdvancedChartsProps {
  data: any[]
  symbol: string
}

export function AdvancedCharts({ data, symbol }: AdvancedChartsProps) {
  const chartData = useMemo(() => {
    // Generate mock technical indicator data
    return Array.from({ length: 100 }, (_, i) => {
      const basePrice = 45000 + Math.random() * 10000
      const price = basePrice + (Math.random() - 0.5) * 2000

      return {
        time: new Date(Date.now() - (100 - i) * 3600000).toLocaleTimeString(),
        price,
        sma20: price + (Math.random() - 0.5) * 500,
        sma50: price + (Math.random() - 0.5) * 800,
        rsi: Math.random() * 100,
        macd: (Math.random() - 0.5) * 200,
        signal: (Math.random() - 0.5) * 180,
        histogram: (Math.random() - 0.5) * 50,
        bb_upper: price + Math.random() * 1000,
        bb_middle: price,
        bb_lower: price - Math.random() * 1000,
        volume: Math.random() * 1000000,
      }
    })
  }, [data])

  const chartConfig = {
    price: { label: "Price", color: "hsl(var(--chart-1))" },
    sma20: { label: "SMA 20", color: "hsl(var(--chart-2))" },
    sma50: { label: "SMA 50", color: "hsl(var(--chart-3))" },
    rsi: { label: "RSI", color: "hsl(var(--chart-4))" },
    macd: { label: "MACD", color: "hsl(var(--chart-5))" },
    volume: { label: "Volume", color: "hsl(var(--chart-2))" },
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="moving-averages" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="moving-averages">Moving Averages</TabsTrigger>
          <TabsTrigger value="rsi">RSI</TabsTrigger>
          <TabsTrigger value="macd">MACD</TabsTrigger>
          <TabsTrigger value="bollinger">Bollinger Bands</TabsTrigger>
        </TabsList>

        <TabsContent value="moving-averages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Price with Moving Averages</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="price" stroke="var(--color-price)" strokeWidth={2} dot={false} />
                    <Line
                      type="monotone"
                      dataKey="sma20"
                      stroke="var(--color-sma20)"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sma50"
                      stroke="var(--color-sma50)"
                      strokeWidth={1}
                      strokeDasharray="10 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsi" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>RSI (Relative Strength Index)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="rsi" stroke="var(--color-rsi)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macd" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MACD (Moving Average Convergence Divergence)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                    <Line type="monotone" dataKey="macd" stroke="var(--color-macd)" strokeWidth={2} dot={false} />
                    <Line
                      type="monotone"
                      dataKey="signal"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bollinger" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bollinger Bands</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="bb_upper"
                      stackId="1"
                      stroke="#8884d8"
                      fill="transparent"
                      strokeDasharray="3 3"
                    />
                    <Area
                      type="monotone"
                      dataKey="bb_lower"
                      stackId="1"
                      stroke="#8884d8"
                      fill="rgba(136, 132, 216, 0.1)"
                      strokeDasharray="3 3"
                    />
                    <Line type="monotone" dataKey="price" stroke="var(--color-price)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="bb_middle" stroke="#8884d8" strokeWidth={1} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
