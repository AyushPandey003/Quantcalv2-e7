"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, TrendingUp, TrendingDown } from "lucide-react"

interface TradingPanelProps {
  symbol: string
}

export function TradingPanel({ symbol }: TradingPanelProps) {
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [stopPrice, setStopPrice] = useState("")
  const [leverage, setLeverage] = useState([1])
  const [percentage, setPercentage] = useState(0)

  const currentPrice = 43250 // Mock current price
  const balance = 1000 // Mock balance

  const calculateTotal = () => {
    const qty = Number.parseFloat(quantity) || 0
    const prc = orderType === "market" ? currentPrice : Number.parseFloat(price) || currentPrice
    return qty * prc
  }

  const calculateQuantityFromPercentage = (percent: number) => {
    const total = (balance * percent) / 100
    const prc = orderType === "market" ? currentPrice : Number.parseFloat(price) || currentPrice
    return prc > 0 ? (total / prc).toFixed(6) : "0"
  }

  const handlePercentageClick = (percent: number) => {
    setPercentage(percent)
    setQuantity(calculateQuantityFromPercentage(percent))
  }

  return (
    <div className="space-y-4">
      {/* Order Type Tabs */}
      <Tabs value={orderType} onValueChange={(value) => setOrderType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
          <TabsTrigger value="stop">Stop</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <div className="text-sm text-muted-foreground">Execute immediately at current market price</div>
        </TabsContent>

        <TabsContent value="limit" className="space-y-4">
          <div>
            <Label htmlFor="limit-price">Limit Price</Label>
            <Input
              id="limit-price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </TabsContent>

        <TabsContent value="stop" className="space-y-4">
          <div>
            <Label htmlFor="stop-price">Stop Price</Label>
            <Input
              id="stop-price"
              type="number"
              placeholder="0.00"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={side === "buy" ? "default" : "outline"}
          onClick={() => setSide("buy")}
          className={side === "buy" ? "bg-green-500 hover:bg-green-600" : ""}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Buy
        </Button>
        <Button
          variant={side === "sell" ? "default" : "outline"}
          onClick={() => setSide("sell")}
          className={side === "sell" ? "bg-red-500 hover:bg-red-600" : ""}
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          Sell
        </Button>
      </div>

      {/* Leverage Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Leverage</Label>
          <Badge variant="outline">{leverage[0]}x</Badge>
        </div>
        <Slider value={leverage} onValueChange={setLeverage} max={125} min={1} step={1} className="w-full" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1x</span>
          <span>125x</span>
        </div>
      </div>

      {/* Quantity Input */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          placeholder="0.00000000"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {[25, 50, 75, 100].map((percent) => (
            <Button
              key={percent}
              variant="outline"
              size="sm"
              onClick={() => handlePercentageClick(percent)}
              className={percentage === percent ? "bg-primary/10" : ""}
            >
              {percent}%
            </Button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Price:</span>
            <span className="font-mono">${currentPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Quantity:</span>
            <span className="font-mono">{quantity || "0.00000000"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total:</span>
            <span className="font-mono">${calculateTotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Fee (0.1%):</span>
            <span className="font-mono">${(calculateTotal() * 0.001).toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Cost:</span>
              <span className="font-mono">${(calculateTotal() * 1.001).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Place Order Button */}
      <Button
        className={`w-full ${side === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
        disabled={!quantity || Number.parseFloat(quantity) <= 0}
      >
        <Calculator className="h-4 w-4 mr-2" />
        {side === "buy" ? "Buy" : "Sell"} {symbol}
      </Button>

      {/* Balance Info */}
      <div className="text-xs text-muted-foreground text-center">Available Balance: ${balance.toLocaleString()}</div>
    </div>
  )
}
