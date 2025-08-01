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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  // Generate mock data for demonstration
  const generateMockData = useCallback((symbol: string) => {
    const mockData: BinanceKlineData[] = []
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    let basePrice = symbol.includes("BTC") ? 45000 : symbol.includes("ETH") ? 3000 : 100

    for (let i = 99; i >= 0; i--) {
      const timestamp = now - i * oneDay
      const volatility = 0.02 + Math.random() * 0.03 // 2-5% daily volatility
      const change = (Math.random() - 0.5) * volatility

      const open = basePrice
      const close = open * (1 + change)
      const high = Math.max(open, close) * (1 + Math.random() * 0.01)
      const low = Math.min(open, close) * (1 - Math.random() * 0.01)
      const volume = (Math.random() * 1000000 + 100000).toString()

      mockData.push({
        openTime: timestamp,
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        close: close.toFixed(2),
        volume: volume,
        closeTime: timestamp + oneDay - 1,
      })

      basePrice = close
    }

    return mockData
  }, [])

  // Generate mock ticker data
  const generateMockTicker = useCallback((symbol: string, historicalData: BinanceKlineData[]) => {
    if (historicalData.length === 0) return null

    const latest = historicalData[historicalData.length - 1]
    const previous = historicalData[historicalData.length - 2]

    if (!latest || !previous) return null

    const currentPrice = Number.parseFloat(latest.close)
    const previousPrice = Number.parseFloat(previous.close)
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100

    return {
      symbol,
      price: latest.close,
      priceChangePercent: priceChange.toFixed(2),
      highPrice: latest.high,
      lowPrice: latest.low,
      volume: latest.volume,
      openPrice: latest.open,
    }
  }, [])

  // Fetch historical data with fallback to mock data
  const fetchHistoricalData = useCallback(
    async (symbol: string) => {
      try {
        setLoading(true)
        setConnectionStatus("Fetching data...")

        // Try to fetch real data first
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        try {
          const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=100`, {
            signal: controller.signal,
            mode: "cors",
            headers: {
              Accept: "application/json",
            },
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
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
          setData(generateMockTicker(symbol, formattedData))
          setConnectionStatus("Connected (Live Data)")
          setIsConnected(true)
        } catch (fetchError) {
          clearTimeout(timeoutId)
          console.warn("Failed to fetch live data, using mock data:", fetchError)

          // Fallback to mock data
          const mockData = generateMockData(symbol)
          setHistoricalData(mockData)
          setData(generateMockTicker(symbol, mockData))
          setConnectionStatus("Connected (Demo Data)")
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error in fetchHistoricalData:", error)

        // Final fallback to mock data
        const mockData = generateMockData(symbol)
        setHistoricalData(mockData)
        setData(generateMockTicker(symbol, mockData))
        setConnectionStatus("Connected (Demo Data)")
        setIsConnected(true)
      } finally {
        setLoading(false)
      }
    },
    [generateMockData, generateMockTicker],
  )

  // WebSocket connection with better error handling
  const connectWebSocket = useCallback((symbol: string) => {
    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Don't attempt WebSocket if we've exceeded max attempts
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log("Max WebSocket reconnection attempts reached, staying with demo data")
      return
    }

    try {
      setConnectionStatus("Connecting to live feed...")

      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`)
      wsRef.current = ws

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close()
          console.log("WebSocket connection timeout")
        }
      }, 10000)

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        setIsConnected(true)
        setConnectionStatus("Connected (Live Data)")
        reconnectAttempts.current = 0
        console.log("WebSocket connected successfully")
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
        clearTimeout(connectionTimeout)
        console.warn("WebSocket error, continuing with demo data:", error)
        setConnectionStatus("Connected (Demo Data)")
        // Don't set isConnected to false here, keep using demo data
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log("WebSocket disconnected:", event.code, event.reason)

        // Only attempt reconnection if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000) // Exponential backoff, max 30s

          setConnectionStatus(`Reconnecting... (${reconnectAttempts.current}/${maxReconnectAttempts})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(symbol)
          }, delay)
        } else {
          setConnectionStatus("Connected (Demo Data)")
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      setConnectionStatus("Connected (Demo Data)")
    }
  }, [])

  // Initialize data when symbol changes
  useEffect(() => {
    reconnectAttempts.current = 0
    fetchHistoricalData(symbol)

    // Try to connect WebSocket after a short delay
    const wsTimeout = setTimeout(() => {
      connectWebSocket(symbol)
    }, 1000)

    return () => {
      clearTimeout(wsTimeout)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [symbol, fetchHistoricalData, connectWebSocket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
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
