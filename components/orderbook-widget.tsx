"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface OrderbookWidgetProps {
  symbol: string
}

interface OrderbookEntry {
  price: number
  quantity: number
  total: number
}

interface OrderbookData {
  bids: OrderbookEntry[]
  asks: OrderbookEntry[]
  lastUpdateId: number
}

export function OrderbookWidget({ symbol }: OrderbookWidgetProps) {
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [spread, setSpread] = useState<number>(0)

  useEffect(() => {
    let ws: WebSocket | null = null

    const connectWebSocket = () => {
      try {
        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log(`Orderbook WebSocket connected for ${symbol}`)
          setLoading(false)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.bids && data.asks) {
              const bids = data.bids.slice(0, 10).map((bid: string[], index: number) => {
                const price = Number.parseFloat(bid[0])
                const quantity = Number.parseFloat(bid[1])
                return {
                  price,
                  quantity,
                  total: quantity * price,
                }
              })

              const asks = data.asks.slice(0, 10).map((ask: string[], index: number) => {
                const price = Number.parseFloat(ask[0])
                const quantity = Number.parseFloat(ask[1])
                return {
                  price,
                  quantity,
                  total: quantity * price,
                }
              })

              // Calculate spread
              if (bids.length > 0 && asks.length > 0) {
                const bestBid = bids[0].price
                const bestAsk = asks[0].price
                setSpread(bestAsk - bestBid)
              }

              setOrderbook({
                bids,
                asks,
                lastUpdateId: data.lastUpdateId,
              })
            }
          } catch (error) {
            console.error("Error parsing orderbook data:", error)
          }
        }

        ws.onerror = (error) => {
          console.error("Orderbook WebSocket error:", error)
          setLoading(false)
        }

        ws.onclose = () => {
          console.log("Orderbook WebSocket disconnected")
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000)
        }
      } catch (error) {
        console.error("Error connecting to orderbook WebSocket:", error)
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
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!orderbook) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        <p>Unable to load orderbook data</p>
      </div>
    )
  }

  const maxVolume = Math.max(...orderbook.bids.map((bid) => bid.quantity), ...orderbook.asks.map((ask) => ask.quantity))

  return (
    <div className="space-y-4">
      {/* Spread Info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Spread</span>
        <Badge variant="outline">
          ${spread.toFixed(2)} ({((spread / orderbook.asks[0]?.price) * 100).toFixed(3)}%)
        </Badge>
      </div>

      <div className="space-y-2">
        {/* Asks (Sell Orders) */}
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground px-2">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {orderbook.asks
            .slice()
            .reverse()
            .map((ask, index) => (
              <div
                key={`ask-${index}`}
                className="relative grid grid-cols-3 gap-2 text-xs py-1 px-2 hover:bg-muted/50 rounded"
              >
                <div
                  className="absolute inset-0 bg-red-500/10 rounded"
                  style={{
                    width: `${(ask.quantity / maxVolume) * 100}%`,
                    right: 0,
                  }}
                />
                <span className="relative text-red-500 font-mono">${ask.price.toLocaleString()}</span>
                <span className="relative text-right font-mono">{ask.quantity.toFixed(4)}</span>
                <span className="relative text-right font-mono text-muted-foreground">
                  ${ask.total.toLocaleString()}
                </span>
              </div>
            ))}
        </div>

        {/* Current Price */}
        <div className="py-2 px-2 bg-muted/30 rounded text-center">
          <div className="text-lg font-bold">${orderbook.asks[0]?.price.toLocaleString() || "N/A"}</div>
          <div className="text-xs text-muted-foreground">Last Price</div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          {orderbook.bids.map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="relative grid grid-cols-3 gap-2 text-xs py-1 px-2 hover:bg-muted/50 rounded"
            >
              <div
                className="absolute inset-0 bg-green-500/10 rounded"
                style={{
                  width: `${(bid.quantity / maxVolume) * 100}%`,
                  right: 0,
                }}
              />
              <span className="relative text-green-500 font-mono">${bid.price.toLocaleString()}</span>
              <span className="relative text-right font-mono">{bid.quantity.toFixed(4)}</span>
              <span className="relative text-right font-mono text-muted-foreground">${bid.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
