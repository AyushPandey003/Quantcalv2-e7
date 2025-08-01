"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, TrendingUp } from "lucide-react"

interface FilterControlsProps {
  selectedSymbol: string
  onSymbolChange: (symbol: string) => void
}

const POPULAR_SYMBOLS = [
  { symbol: "BTCUSDT", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETHUSDT", name: "Ethereum", category: "Crypto" },
  { symbol: "ADAUSDT", name: "Cardano", category: "Crypto" },
  { symbol: "SOLUSDT", name: "Solana", category: "Crypto" },
  { symbol: "DOTUSDT", name: "Polkadot", category: "Crypto" },
  { symbol: "LINKUSDT", name: "Chainlink", category: "Crypto" },
  { symbol: "MATICUSDT", name: "Polygon", category: "Crypto" },
  { symbol: "AVAXUSDT", name: "Avalanche", category: "Crypto" },
]

export function FilterControls({ selectedSymbol, onSymbolChange }: FilterControlsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [customSymbol, setCustomSymbol] = useState("")

  const filteredSymbols = POPULAR_SYMBOLS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCustomSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customSymbol.trim()) {
      onSymbolChange(customSymbol.trim().toUpperCase())
      setCustomSymbol("")
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search symbols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Custom Symbol Input */}
          <form onSubmit={handleCustomSymbolSubmit} className="flex gap-2">
            <Input
              placeholder="Enter symbol (e.g., BTCUSDT)"
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value)}
              className="w-48"
            />
            <Button type="submit" variant="outline">
              Add
            </Button>
          </form>
        </div>

        {/* Current Selection */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Current:</span>
          <Badge variant="default" className="bg-blue-600">
            {selectedSymbol}
          </Badge>
        </div>

        {/* Popular Symbols */}
        <div>
          <h3 className="text-sm font-medium mb-2">Popular Symbols</h3>
          <div className="flex flex-wrap gap-2">
            {filteredSymbols.map((item) => (
              <Button
                key={item.symbol}
                variant={selectedSymbol === item.symbol ? "default" : "outline"}
                size="sm"
                onClick={() => onSymbolChange(item.symbol)}
                className="h-auto py-2 px-3"
              >
                <div className="text-left">
                  <div className="font-medium text-xs">{item.symbol}</div>
                  <div className="text-xs opacity-70">{item.name}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {searchTerm && filteredSymbols.length === 0 && (
          <div className="text-center py-4 text-slate-500">No symbols found matching "{searchTerm}"</div>
        )}
      </CardContent>
    </Card>
  )
}
