"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface TradingPanelProps {
  symbol: string
  currentPrice?: string
}

export function TradingPanel({ symbol, currentPrice }: TradingPanelProps) {
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market")
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [stopPrice, setStopPrice] = useState("")
  const [leverage, setLeverage] = useState([1])

  const handleSubmitOrder = () => {
    // Mock order submission
    console.log("Order submitted:", {
      symbol,
      side,
      orderType,
      quantity,
      price,
      stopPrice,
      leverage: leverage[0],
    })
  }

  const currentPriceNum = currentPrice ? Number.parseFloat(currentPrice) : 45000

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trading Panel</span>
          <Badge variant="outline">{symbol}</Badge>
        </CardTitle>
        <CardDescription>Current Price: ${currentPriceNum.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={side} onValueChange={(value) => setSide(value as "buy" | "sell")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="text-green-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-red-600">
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value={side} className="space-y-4 mt-4">
            {/* Order Type */}
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(value) => setOrderType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {symbol.replace("USDT", "")}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setQuantity("0.25")}>
                  25%
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuantity("0.5")}>
                  50%
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuantity("0.75")}>
                  75%
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQuantity("1")}>
                  100%
                </Button>
              </div>
            </div>

            {/* Price (for limit orders) */}
            {orderType === "limit" && (
              <div className="space-y-2">
                <Label>Price</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={currentPriceNum.toString()}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Stop Price (for stop orders) */}
            {orderType === "stop" && (
              <div className="space-y-2">
                <Label>Stop Price</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={currentPriceNum.toString()}
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                  />
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Leverage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Leverage</Label>
                <Badge variant="outline">{leverage[0]}x</Badge>
              </div>
              <Slider value={leverage} onValueChange={setLeverage} max={100} min={1} step={1} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1x</span>
                <span>50x</span>
                <span>100x</span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Order Value:</span>
                <span>${(Number.parseFloat(quantity || "0") * currentPriceNum).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Fee (0.1%):</span>
                <span>${(Number.parseFloat(quantity || "0") * currentPriceNum * 0.001).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Total:</span>
                <span>${(Number.parseFloat(quantity || "0") * currentPriceNum * 1.001).toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className={`w-full ${side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              onClick={handleSubmitOrder}
            >
              {side === "buy" ? "Buy" : "Sell"} {symbol.replace("USDT", "")}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
