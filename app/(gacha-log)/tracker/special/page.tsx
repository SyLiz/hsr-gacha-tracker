"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useRouter } from "next/navigation";
import { Star, Sparkles, Trophy, Gift, ChevronRight } from "lucide-react";

function SpecialBannersPage() {
  const router = useRouter();

  const specialBanners = [
    {
      id: "departure",
      title: "Departure Warp",
      description: "Novice banner for new Trailblazers with 50-pull guarantee",
      gachaType: "2",
      icon: Gift,
      iconColor: "text-blue-500",
      route: "/tracker/special/departure",
    },
    {
      id: "fate-character",
      title: "Fate Collaboration - Characters",
      description:
        "Special collaboration character banner with exclusive units",
      gachaType: "21",
      icon: Trophy,
      iconColor: "text-purple-500",
      route: "/tracker/special/fate-character",
    },
    {
      id: "fate-lightcone",
      title: "Fate Collaboration - Light Cones",
      description:
        "Special collaboration light cone banner with unique weapons",
      gachaType: "22",
      icon: Sparkles,
      iconColor: "text-amber-500",
      route: "/tracker/special/fate-lightcone",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Simple Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Special Banners</h1>
        </div>
        <p className="text-muted-foreground">
          View your pull history for special banner types including Departure
          Warp and collaboration banners.
        </p>
      </div>

      <Separator />

      {/* Simple Vertical List */}
      <div className="space-y-3">
        {specialBanners.map((banner) => {
          const IconComponent = banner.icon;
          return (
            <Card
              key={banner.id}
              className="transition-colors hover:bg-accent/50 cursor-pointer"
              onClick={() => router.push(banner.route)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <IconComponent
                        className={`h-8 w-8 ${banner.iconColor}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {banner.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          Type {banner.gachaType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {banner.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Simple Info Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">About Special Banners</CardTitle>
          <CardDescription>
            Special banners have unique mechanics and rates different from
            standard character and light cone banners.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Gift className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Departure Warp:</span>{" "}
                Beginner-friendly banner with guaranteed 5-star within 50 pulls
                and discounted rates.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Fate Characters:</span>{" "}
                Limited-time collaboration featuring exclusive characters from
                the Fate universe.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Fate Light Cones:</span>{" "}
                Collaboration weapons with unique designs and effects.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SpecialBannersPage;
