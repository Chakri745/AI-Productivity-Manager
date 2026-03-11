"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { getContexts, getCriticalAnalysis, getAuthStatus, getEvents, updateEvent } from "../../lib/api";

type CriticalItem = {
    event: any;
    reasoning: string;
    priorityScore: number;
};

type ContextGroup = {
    contextName: string;
    summary: string;
    eventIds: string[];
};

interface DataContextType {
    contexts: any[];
    analysisData: {
        criticalItems: CriticalItem[];
        contextGroups: ContextGroup[];
        executiveSummary: string;
    } | null;
    authenticated: boolean;
    loading: boolean;
    lastUpdated: number | null;
    refreshData: () => Promise<void>;
    criticalItems: CriticalItem[];
    events: any[];
    updateStatus: (id: string, newStatus: string) => Promise<void>;
}

const DataContext = createContext<DataContextType>({
    contexts: [],
    analysisData: null,
    authenticated: false,
    loading: true,
    lastUpdated: null,
    refreshData: async () => { },
    criticalItems: [],
    events: [],
    updateStatus: async () => { },
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [contexts, setContexts] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [analysisData, setAnalysisData] = useState<{
        criticalItems: CriticalItem[];
        contextGroups: ContextGroup[];
        executiveSummary: string;
    } | null>(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const [ctxRes, critRes, authRes, eventsRes] = await Promise.all([
                getContexts(),
                getCriticalAnalysis(),
                getAuthStatus(),
                getEvents(),
            ]);
            setContexts(ctxRes.contexts || []);
            setEvents(eventsRes.events || []);
            setAnalysisData({
                criticalItems: critRes.criticalItems || [],
                contextGroups: critRes.contextGroups || [],
                executiveSummary: critRes.executiveSummary || ""
            });
            setAuthenticated(authRes.authenticated);
            setLastUpdated(Date.now());
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async (id: string, newStatus: string) => {
        // Optimistic update
        setEvents((prev) =>
            prev.map((e) =>
                e.id === id ? { ...e, metadata: { ...e.metadata, status: newStatus } } : e
            )
        );

        try {
            await updateEvent(id, { metadata: { status: newStatus } });
        } catch (error) {
            console.error("Failed to update status:", error);
            // Revert on failure (optional for now, but good practice)
            // For now, we'll just log it. A real app would revert the state.
        }
    }, []);

    useEffect(() => {
        // Only fetch if we haven't fetched yet (lastUpdated is null)
        if (lastUpdated === null) {
            refreshData();
        }
    }, [lastUpdated, refreshData]);

    return (
        <DataContext.Provider
            value={{
                contexts,
                analysisData,
                authenticated,
                loading,
                lastUpdated,
                refreshData,
                criticalItems: analysisData?.criticalItems || [],
                events,
                updateStatus,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
