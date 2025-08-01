"use client"

import { useState, useEffect, useRef } from "react"

interface BinanceTickerData {
  symbol: string
  price: string
  priceChangePercent: string
  volume: string
  high: string
  low: string
  open: string
  close: string
}

interface CandlestickData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function useBinanceData(symbol: string) {
  const [data, setData] = useState<BinanceTickerData | null>(null)
  const [historicalData, setHistoricalData] = useState<CandlestickData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let mounted = true

    const connectWebSocket = () => {
      try {
        // Connect to Binance WebSocket for real-time ticker data
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
        wsRef.current = ws

        ws.onopen = () => {
          if (mounted) {
            setIsConnected(true)
            setConnectionStatus("Connected")
            setLoading(false)
          }
        }

        ws.onmessage = (event) => {
          if (mounted) {
            try {
              const tickerData = JSON.parse(event.data)
              setData({
                symbol: tickerData.s,
                price: tickerData.c,
                priceChangePercent: tickerData.P,
                volume: tickerData.v,
                high: tickerData.h,
                low: tickerData.l,
                open: tickerData.o,
                close: tickerData.c,
              })
            } catch (error) {
              console.error("Error parsing WebSocket data:", error)
            }
          }
        }

        ws.onclose = () => {
          if (mounted) {
            setIsConnected(false)
            setConnectionStatus("Disconnected")

            // Attempt to reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mounted) {
                setConnectionStatus("Reconnecting...")
                connectWebSocket()
              }
            }, 3000)
          }
        }

        ws.onerror = (error) => {
          if (mounted) {
            console.error("WebSocket error:", error)
            setConnectionStatus("Error")
            setIsConnected(false)
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to connect to WebSocket:", error)
          setConnectionStatus("Failed")
          setIsConnected(false)
          setLoading(false)
        }
      }
    }

    // Generate mock historical data
    const generateHistoricalData = () => {
      const data: CandlestickData[] = []
      const basePrice = 45000 + Math.random() * 10000

      for (let i = 0; i < 100; i++) {
        const timestamp = Date.now() - (100 - i) * 3600000 // 1 hour intervals
        const open = i === 0 ? basePrice : data[i - 1].close
        const change = (Math.random() - 0.5) * 1000
        const close = open + change
        const high = Math.max(open, close) + Math.random() * 200
        const low = Math.min(open, close) - Math.random() * 200
        const volume = Math.random() * 1000000

        data.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume,
        })
      }

      if (mounted) {
        setHistoricalData(data)
      }
    }

    connectWebSocket()
    generateHistoricalData()

    return () => {
      mounted = false
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [symbol])

  return {
    data,
    historicalData,
    isConnected,
    connectionStatus,
    loading,
  }
}
