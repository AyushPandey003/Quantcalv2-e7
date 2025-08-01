"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MarketDepthProps {
  symbol: string
}

interface DepthData {
  price: number
  bidVolume: number
  askVolume: number
  bidCumulative: number
  askCumulative: number
}

export function MarketDepth({ symbol }: MarketDepthProps) {
  const [depthData, setDepthData] = useState<DepthData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ws: WebSocket | null = null

    const connectWebSocket = () => {
      try {
        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log(`Market depth WebSocket connected for ${symbol}`)
          setLoading(false)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.bids && data.asks) {
              const bids = data.bids
                .slice(0, 20)
                .map((bid: string[]) => ({
                  price: Number.parseFloat(bid[0]),
                  volume: Number.parseFloat(bid[1]),
                }))
                .sort((a: any, b: any) => b.price - a.price)

              const asks = data.asks
                .slice(0, 20)
                .map((ask: string[]) => ({
                  price: Number.parseFloat(ask[0]),
                  volume: Number.parseFloat(ask[1]),
                }))
                .sort((a: any, b: any) => a.price - b.price)

              // Calculate cumulative volumes
              let bidCumulative = 0
              let askCumulative = 0

              const processedData: DepthData[] = []

              // Process bids (buy orders)
              bids.forEach((bid: any) => {
                bidCumulative += bid.volume
                processedData.push({
                  price: bid.price,
                  bidVolume: bid.volume,
                  askVolume: 0,
                  bidCumulative,
                  askCumulative: 0,
                })
              })

              // Process asks (sell orders)
              asks.forEach((ask: any) => {
                askCumulative += ask.volume
                processedData.push({
                  price: ask.price,
                  bidVolume: 0,
                  askVolume: ask.volume,
                  bidCumulative: 0,
                  askCumulative,
                })
              })

              // Sort by price
              processedData.sort((a, b) => a.price - b.price)

              setDepthData(processedData)
            }
          } catch (error) {
            console.error("Error parsing market depth data:", error)
          }
        }

        ws.onerror = (error) => {
          console.error("Market depth WebSocket error:", error)
          setLoading(false)
        }

        ws.onclose = () => {
          console.log("Market depth WebSocket disconnected")
          setTimeout(connectWebSocket, 3000)
        }
      } catch (error) {
        console.error("Error connecting to market depth WebSocket:", error)
        setLoading(false)
      }
    }

    connectWebSocket()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [symbol])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Market Depth - {symbol}</h3>
        <p className="text-sm text-muted-foreground">Cumulative order book visualization</p>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={depthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="price" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toLocaleString()}`} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${(value / 1000).toFixed(1)}K`} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-medium">Price: ${Number(label).toLocaleString()}</p>
                    <div className="space-y-1 text-sm">
                      {data.bidCumulative > 0 && (
                        <p className="text-green-500">Bid Volume: {data.bidCumulative.toFixed(4)}</p>
                      )}
                      {data.askCumulative > 0 && (
                        <p className="text-red-500">Ask Volume: {data.askCumulative.toFixed(4)}</p>
                      )}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />

          {/* Bid area (green) */}
          <Area
            type="stepAfter"
            dataKey="bidCumulative"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
            strokeWidth={2}
          />

          {/* Ask area (red) */}
          <Area
            type="stepBefore"
            dataKey="askCumulative"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
