interface PulseMetricsConfig {
    apiKey: string;
    apiUrl?: string;
    autoTrack?: boolean;
    debug?: boolean;
}

interface PulseMetrics {
    init: (config: PulseMetricsConfig) => void;
    track: (eventName: string, data?: Record<string, any>) => void;
    identify?: (userId: string, traits?: Record<string, any>) => void;
    reset?: () => void;
}

declare global {
    interface Window {
        PulseMetrics: PulseMetrics;
    }
}

export {};
