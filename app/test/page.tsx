// app/some-page/page.tsx
import { CandlestickChart } from "@/components/candlesticksChart";

export default function page() {
    return (
        <main className="p-4 bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">BTC/USDT - 1h</h1>
            <CandlestickChart symbol="btcusdt" timeframe="1h" />
        </main>
    );
}