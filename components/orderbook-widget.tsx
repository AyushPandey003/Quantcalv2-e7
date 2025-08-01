"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OrderbookEntry {
  price: number
  quantity: number
  total: number
}

interface OrderbookWidgetProps {
  symbol: string
}

export function OrderbookWidget({ symbol }: OrderbookWidgetProps) {
  const [bids, setBids] = useState<OrderbookEntry[]>([])
  const [asks, setAsks] = useState<OrderbookEntry[]>([])
  const [spread, setSpread] = useState<number>(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Generate mock orderbook data
    const generateOrderbook = () => {
      const basePrice = 45000 + Math.random() * 10000

      const newBids: OrderbookEntry[] = []
      const newAsks: OrderbookEntry[] = []

      // Generate bids (below current price)
      for (let i = 0; i < 15; i++) {
        const price = basePrice - (i + 1) * (Math.random() * 50 + 10)
        const quantity = Math.random() * 10 + 0.1
        const total = i === 0 ? quantity : newBids[i - 1].total + quantity
        newBids.push({ price, quantity, total })
      }

      // Generate asks (above current price)
      for (let i = 0; i < 15; i++) {
        const price = basePrice + (i + 1) * (Math.random() * 50 + 10)
        const quantity = Math.random() * 10 + 0.1
        const total = i === 0 ? quantity : newAsks[i - 1].total + quantity
        newAsks.push({ price, quantity, total })
      }

      setBids(newBids)
      setAsks(newAsks.reverse()) // Reverse asks to show lowest first
      setSpread(newAsks[0]?.price - newBids[0]?.price || 0)
      setIsConnected(true)
    }

    generateOrderbook()
    const interval = setInterval(generateOrderbook, 1000) // Update every second

    return () => clearInterval(interval)
  }, [symbol])

  const maxBidTotal = Math.max(...bids.map((b) => b.total))
  const maxAskTotal = Math.max(...asks.map((a) => a.total))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order Book</CardTitle>
          <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Live" : "Offline"}</Badge>
        </div>
        <CardDescription>{symbol}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="combined" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
            <TabsTrigger value="combined">Combined</TabsTrigger>
            <TabsTrigger value="bids">Bids</TabsTrigger>
            <TabsTrigger value="asks">Asks</TabsTrigger>
          </TabsList>

          <TabsContent value="combined" className="mt-0">
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>

              {/* Asks */}
              <div className="max-h-[200px] overflow-y-auto">
                {asks.slice(0, 10).map((ask, index) => (
                  <div key={index} className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-muted/50">
                    <div
                      className="absolute inset-y-0 right-0 bg-red-500/10"
                      style={{ width: `${(ask.total / maxAskTotal) * 100}%` }}
                    />
                    <span className="text-red-500 font-mono relative z-10">{ask.price.toFixed(2)}</span>
                    <span className="text-right relative z-10">{ask.quantity.toFixed(4)}</span>
                    <span className="text-right text-muted-foreground relative z-10">{ask.total.toFixed(4)}</span>
                  </div>
                ))}
              </div>

              {/* Spread */}
              <div className="px-4 py-2 bg-muted/30 border-y">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Spread</span>
                  <span className="font-medium">${spread.toFixed(2)}</span>
                </div>
              </div>

              {/* Bids */}
              <div className="max-h-[200px] overflow-y-auto">
                {bids.slice(0, 10).map((bid, index) => (
                  <div key={index} className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-muted/50">
                    <div
                      className="absolute inset-y-0 right-0 bg-green-500/10"
                      style={{ width: `${(bid.total / maxBidTotal) * 100}%` }}
                    />
                    <span className="text-green-500 font-mono relative z-10">{bid.price.toFixed(2)}</span>
                    <span className="text-right relative z-10">{bid.quantity.toFixed(4)}</span>
                    <span className="text-right text-muted-foreground relative z-10">{bid.total.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bids" className="mt-0">
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {bids.map((bid, index) => (
                  <div key={index} className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-muted/50">
                    <div
                      className="absolute inset-y-0 right-0 bg-green-500/10"
                      style={{ width: `${(bid.total / maxBidTotal) * 100}%` }}
                    />
                    <span className="text-green-500 font-mono relative z-10">{bid.price.toFixed(2)}</span>
                    <span className="text-right relative z-10">{bid.quantity.toFixed(4)}</span>
                    <span className="text-right text-muted-foreground relative z-10">{bid.total.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="asks" className="mt-0">
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Total</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {asks.map((ask, index) => (
                  <div key={index} className="relative grid grid-cols-3 gap-2 px-4 py-1 text-xs hover:bg-muted/50">
                    <div
                      className="absolute inset-y-0 right-0 bg-red-500/10"
                      style={{ width: `${(ask.total / maxAskTotal) * 100}%` }}
                    />
                    <span className="text-red-500 font-mono relative z-10">{ask.price.toFixed(2)}</span>
                    <span className="text-right relative z-10">{ask.quantity.toFixed(4)}</span>
                    <span className="text-right text-muted-foreground relative z-10">{ask.total.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
