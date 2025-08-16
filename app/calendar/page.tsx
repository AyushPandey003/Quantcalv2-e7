"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarView } from "@/components/calendar-view";
import { useBinanceData } from "@/hooks/use-binance-data";

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day");

  const { data, historicalData, isConnected, connectionStatus, loading } = useBinanceData(selectedSymbol);

  const handleNavigate = (view: "home" | "calendar" | "dashboard" | "profile") => {
    switch (view) {
      case "home":
        router.push("/");
        break;
      case "dashboard":
        router.push("/dashboard");
        break;
      case "profile":
        router.push("/profile");
        break;
      case "calendar":
      default:
        break;
    }
  };

  return (
    <CalendarView
      timeframe={timeframe}
      data={historicalData}
      selectedDate={selectedDate}
      selectedRange={selectedRange}
      onDateSelect={setSelectedDate}
      onRangeSelect={setSelectedRange}
      loading={loading}
      onNavigate={handleNavigate}
      selectedSymbol={selectedSymbol}
      onSymbolChange={setSelectedSymbol}
      onTimeframeChange={setTimeframe}
      marketData={data}
      isConnected={isConnected}
      connectionStatus={connectionStatus}
    />
  );
}
