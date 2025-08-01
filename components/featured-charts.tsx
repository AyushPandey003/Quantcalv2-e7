"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

export function FeaturedCharts() {
  const mockData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    btc: 45000 + Math.random() * 5000,
    eth: 3000 + Math.random() * 500,
    bnb: 300 + Math.random() * 50,
  }))

  const chartConfig = {
    btc: { label: "BTC", color: "#f7931a" },
    eth: { label: "ETH", color: "#627eea" },
    bnb: { label: "BNB", color: "#f3ba2f" },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Bitcoin (BTC)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Line type="monotone" dataKey="btc" stroke="var(--color-btc)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Ethereum (ETH)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Line type="monotone" dataKey="eth" stroke="var(--color-eth)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Binance Coin (BNB)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Line type="monotone" dataKey="bnb" stroke="var(--color-bnb)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
