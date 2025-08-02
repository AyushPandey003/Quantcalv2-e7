// components/GenericChart.tsx
"use client";

import React, { useEffect, useRef } from 'react';
import {
    createChart,
    ChartOptions,
    DeepPartial,
    ChartApi,
    ISeriesApi,
    SeriesType,
    SeriesDataItemTypeMap,
    SeriesOptionsMap,
    SeriesPartialOptionsMap,
} from 'lightweight-charts';

// Define a generic series configuration
export interface SeriesConfig<T extends SeriesType> {
    type: T;
    options: SeriesPartialOptionsMap[T];
    initialData: SeriesDataItemTypeMap[T][];
}

interface GenericChartProps {
    chartOptions: DeepPartial<ChartOptions>;
    seriesConfigs: SeriesConfig<any>[]; // Use `any` to allow for different series types
    onChartCreated?: (chart: ChartApi) => void;
    onSeriesCreated?: (series: ISeriesApi<SeriesType>, index: number) => void;
}

export const GenericChart: React.FC<GenericChartProps> = ({
    chartOptions,
    seriesConfigs,
    onChartCreated,
    onSeriesCreated,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ChartApi | null>(null);

    useEffect(() => {
        const chartElement = containerRef.current;
        if (!chartElement) return;

        // Create the chart with provided options
        const chart = createChart(chartElement, {
            ...chartOptions,
            width: chartElement.clientWidth,
            height: chartElement.clientHeight,
        });
        chartRef.current = chart;
        if (onChartCreated) {
            onChartCreated(chart);
        }

        // Add each series based on the configuration
        seriesConfigs.forEach((config, index) => {
            // The library doesn't have a universal `addSeries` type, so `any` is a pragmatic choice here
            const series = (chart as any).addSeries(config.type, config.options);
            series.setData(config.initialData);
            if (onSeriesCreated) {
                onSeriesCreated(series, index);
            }
        });

        // Handle resizing
        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length > 0 && entries[0].contentRect.width > 0) {
                const { width, height } = entries[0].contentRect;
                chart.applyOptions({ width, height });
            }
        });
        resizeObserver.observe(chartElement);

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};