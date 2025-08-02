"use client"

import { useEffect, useState, useCallback } from "react"

interface BinanceTickerData {
  symbol: string
  price: string
  priceChangePercent: string
  volume: string
  highPrice: string
  lowPrice: string
  openPrice: string
  lastPrice: string
}

interface BinanceKlineData {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  quoteAssetVolume: string
  numberOfTrades: number
  takerBuyBaseAssetVolume: string
  takerBuyQuoteAssetVolume: string
}

export function useBinanceData(symbol: string) {
  const [data, setData] = useState<BinanceTickerData | null>(null)
  const [historicalData, setHistoricalData] = useState<BinanceKlineData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch historical data
  const fetchHistoricalData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=100`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const klineData = await response.json()

      const formattedData = klineData.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volume: kline[5],
        closeTime: kline[6],
        quoteAssetVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: kline[9],
        takerBuyQuoteAssetVolume: kline[10],
      }))

      setHistoricalData(formattedData)
      setError(null)
    } catch (error) {
      console.error("Error fetching historical data:", error)
      setError("Failed to fetch historical data")
    } finally {
      setLoading(false)
    }
  }, [symbol])

  // WebSocket connection for real-time data
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connectWebSocket = () => {
      try {
        setConnectionStatus("Connecting...")
        const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.log(`WebSocket connected for ${symbol}`)
          setIsConnected(true)
          setConnectionStatus("Connected")
          setError(null)
          reconnectAttempts = 0
        }

        ws.onmessage = (event) => {
          try {
            const tickerData = JSON.parse(event.data)
            setData({
              symbol: tickerData.s,
              price: tickerData.c,
              priceChangePercent: tickerData.P,
              volume: tickerData.v,
              highPrice: tickerData.h,
              lowPrice: tickerData.l,
              openPrice: tickerData.o,
              lastPrice: tickerData.c,
            })
          } catch (error) {
            console.error("Error parsing WebSocket data:", error)
          }
        }

        ws.onerror = (error) => {
          setIsConnected(false)
          setConnectionStatus("Error")
          setError("WebSocket connection error")
        }

        ws.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason)
          setIsConnected(false)

          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
            setConnectionStatus(`Reconnecting in ${delay / 1000}s...`)

            reconnectTimeout = setTimeout(() => {
              reconnectAttempts++
              connectWebSocket()
            }, delay)
          } else {
            setConnectionStatus("Disconnected")
          }
        }
      } catch (error) {
        console.error("Error creating WebSocket connection:", error)
        setIsConnected(false)
        setConnectionStatus("Failed to connect")
        setError("Failed to create WebSocket connection")
      }
    }

    // Initial connection
    connectWebSocket()

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (ws) {
        ws.close(1000, "Component unmounting")
      }
    }
  }, [symbol])

  // Fetch historical data when symbol changes
  useEffect(() => {
    fetchHistoricalData()
  }, [fetchHistoricalData])

  // Fetch initial ticker data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
        if (response.ok) {
          const tickerData = await response.json()
          setData({
            symbol: tickerData.symbol,
            price: tickerData.lastPrice,
            priceChangePercent: tickerData.priceChangePercent,
            volume: tickerData.volume,
            highPrice: tickerData.highPrice,
            lowPrice: tickerData.lowPrice,
            openPrice: tickerData.openPrice,
            lastPrice: tickerData.lastPrice,
          })
        }
      } catch (error) {
        console.error("Error fetching initial ticker data:", error)
      }
    }

    fetchInitialData()
  }, [symbol])

  return {
    data,
    historicalData,
    isConnected,
    connectionStatus,
    loading,
    error,
    refetch: fetchHistoricalData,
  }
}
