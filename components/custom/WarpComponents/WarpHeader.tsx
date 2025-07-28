import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface WarpHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  highlightValue: string | number;
  highlightLabel: string;
  highlightColor?: string;
  stats: Array<{
    value: string | number;
    label: string;
    color?: string;
  }>;
}

export function WarpHeader({
  title,
  description,
  icon: Icon,
  highlightValue,
  highlightLabel,
  highlightColor = "text-blue-500",
  stats,
}: WarpHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Icon className="w-6 h-6 text-primary" />
              <span>{title}</span>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${highlightColor}`}>
              {highlightValue}
            </div>
            <div className="text-sm text-muted-foreground">
              {highlightLabel}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`grid grid-cols-2 md:grid-cols-${stats.length} gap-4 text-center`}
        >
          {stats.map((stat, index) => (
            <div key={index}>
              <div className={`text-xl font-bold ${stat.color || ""}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
