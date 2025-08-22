interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

interface UserAction {
  action: string;
  component?: string;
  details?: Record<string, any>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.loadStoredEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem("analytics_events");
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load stored analytics events:", error);
    }
  }

  private saveEvents(): void {
    try {
      // Keep only recent events (last 1000)
      const recentEvents = this.events.slice(-1000);
      localStorage.setItem("analytics_events", JSON.stringify(recentEvents));
    } catch (error) {
      console.warn("Failed to save analytics events:", error);
    }
  }

  track(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionDuration: Date.now() - this.startTime,
        url: window.location.href,
        userAgent: navigator.userAgent.slice(0, 100), // Truncate for privacy
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(analyticsEvent);
    this.saveEvents();

    // In a real app, you would send this to your analytics service
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Analytics Event:", analyticsEvent);
    }
  }

  trackUserAction(action: UserAction): void {
    this.track("user_action", {
      action: action.action,
      component: action.component,
      ...action.details,
    });
  }

  trackComponentUsage(
    componentType: string,
    action: "create" | "edit" | "delete" | "duplicate"
  ): void {
    this.track("component_usage", {
      componentType,
      action,
    });
  }

  trackFeatureUsage(feature: string, context?: Record<string, any>): void {
    this.track("feature_usage", {
      feature,
      ...context,
    });
  }

  trackPerformance(metrics: {
    renderTime: number;
    componentCount: number;
    memoryUsage?: number;
    fps: number;
  }): void {
    this.track("performance", metrics);
  }

  trackError(error: string, context?: Record<string, any>): void {
    this.track("error", {
      error,
      ...context,
    });
  }

  getEvents(filter?: { event?: string; since?: number }): AnalyticsEvent[] {
    let filtered = [...this.events];

    if (filter?.event) {
      filtered = filtered.filter(e => e.event === filter.event);
    }

    if (filter?.since) {
      filtered = filtered.filter(e => e.timestamp >= filter.since!);
    }

    return filtered;
  }

  getSessionStats(): {
    duration: number;
    eventCount: number;
    componentActions: number;
    featureUsage: Record<string, number>;
    topComponents: Array<{ type: string; count: number }>;
  } {
    const sessionEvents = this.events.filter(
      e => e.sessionId === this.sessionId
    );
    const componentEvents = sessionEvents.filter(
      e => e.event === "component_usage"
    );
    const featureEvents = sessionEvents.filter(
      e => e.event === "feature_usage"
    );

    // Count feature usage
    const featureUsage: Record<string, number> = {};
    featureEvents.forEach(e => {
      const feature = e.properties.feature;
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    // Count component usage
    const componentCounts: Record<string, number> = {};
    componentEvents.forEach(e => {
      const type = e.properties.componentType;
      componentCounts[type] = (componentCounts[type] || 0) + 1;
    });

    const topComponents = Object.entries(componentCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      duration: Date.now() - this.startTime,
      eventCount: sessionEvents.length,
      componentActions: componentEvents.length,
      featureUsage,
      topComponents,
    };
  }

  exportData(): string {
    return JSON.stringify(
      {
        sessionId: this.sessionId,
        events: this.events,
        stats: this.getSessionStats(),
        exportedAt: Date.now(),
      },
      null,
      2
    );
  }

  clearData(): void {
    this.events = [];
    localStorage.removeItem("analytics_events");
  }
}

// Singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackComponentCreate = (componentType: string) => {
  analytics.trackComponentUsage(componentType, "create");
};

export const trackComponentEdit = (componentType: string) => {
  analytics.trackComponentUsage(componentType, "edit");
};

export const trackComponentDelete = (componentType: string) => {
  analytics.trackComponentUsage(componentType, "delete");
};

export const trackFeature = (
  feature: string,
  context?: Record<string, any>
) => {
  analytics.trackFeatureUsage(feature, context);
};

export const trackError = (error: string, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackPerformance = (metrics: {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  fps: number;
}) => {
  analytics.trackPerformance(metrics);
};
