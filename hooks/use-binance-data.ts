"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface BinanceTickerData {
  symbol: string
  price: string
  priceChangePercent: string
  highPrice: string
  lowPrice: string
  volume: string
  openPrice: string
}

interface BinanceKlineData {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
}

export function useBinanceData(symbol: string) {
  const [data, setData] = useState<BinanceTickerData | null>(null)
  const [historicalData, setHistoricalData] = useState<BinanceKlineData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Disconnected")
  const [loading, setLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)

  // Fetch historical data
  const fetchHistoricalData = useCallback(async (symbol: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=100`)

      if (!response.ok) {
        throw new Error("Failed to fetch historical data")
      }

      const klines = await response.json()
      const formattedData: BinanceKlineData[] = klines.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
      }))

      setHistoricalData(formattedData)
    } catch (error) {
      console.error("Error fetching historical data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // WebSocket connection for real-time data
  const connectWebSocket = useCallback((symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    setConnectionStatus("Connecting...")

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
    wsRef.current = ws

    ws.onopen = () => {
      setIsConnected(true)
      setConnectionStatus("Connected")
      console.log("WebSocket connected")
    }

    ws.onmessage = (event) => {
      try {
        const tickerData = JSON.parse(event.data)
        setData({
          symbol: tickerData.s,
          price: tickerData.c,
          priceChangePercent: tickerData.P,
          highPrice: tickerData.h,
          lowPrice: tickerData.l,
          volume: tickerData.v,
          openPrice: tickerData.o,
        })
      } catch (error) {
        console.error("Error parsing WebSocket data:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setConnectionStatus("Error")
      setIsConnected(false)
    }

    ws.onclose = () => {
      setIsConnected(false)
      setConnectionStatus("Disconnected")
      console.log("WebSocket disconnected")

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWebSocket(symbol)
        }
      }, 5000)
    }
  }, [])

  // Initialize connection and fetch data when symbol changes
  useEffect(() => {
    fetchHistoricalData(symbol)
    connectWebSocket(symbol)

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [symbol, fetchHistoricalData, connectWebSocket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return {
    data,
    historicalData,
    isConnected,
    connectionStatus,
    loading,
  }
}
