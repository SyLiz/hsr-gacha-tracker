import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AnalyticsMetric {
  label: string;
  value: string | number;
  color?: string;
}

interface AnalyticsCardData {
  title: string;
  icon: LucideIcon;
  metrics: AnalyticsMetric[];
}

interface AnalyticsCardsProps {
  cards: AnalyticsCardData[];
}

export function AnalyticsCards({ cards }: AnalyticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card, cardIndex) => (
        <Card key={cardIndex}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <card.icon className="w-5 h-5" />
              <span>{card.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {card.metrics.map((metric, metricIndex) => (
                <div key={metricIndex} className="flex justify-between">
                  <span>{metric.label}</span>
                  <span className={`font-bold ${metric.color || ""}`}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
