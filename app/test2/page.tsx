// app/some-page/page.tsx
import { CandlestickChart } from "@/components/candlesticksChart";

export default function page() {
    return (
        <main className="p-4 bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mt-8 mb-4">ETH/BUSD - 15m</h1>
            <CandlestickChart symbol="ethusdt" timeframe="15m" />
        </main>
    );
}