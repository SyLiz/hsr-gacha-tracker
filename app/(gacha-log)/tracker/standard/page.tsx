"use client";
import React from "react";
import { SummarySector } from "@/components/custom";
import { DataTable } from "@/components/custom/LogTable/data-table";
import { columns } from "@/components/custom/LogTable/columns";
import { useGachaLog } from "@/lib/Context/gacha-logs-provider";
import { BannerType } from "@/lib/constant";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FilePlus, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

function TrackerStandard() {
  const { logs } = useGachaLog();
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Stellar Warp</CardTitle>
            <CardDescription>
              Analysis of your Stellar Warp history.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="history">Warp History</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <div className="grid gap-4 mt-4">
              <SummarySector
                data={logs.standard}
                bannerType={BannerType.Standard}
              />
            </div>
          </TabsContent>
          <TabsContent value="history">
            <DataTable columns={columns} data={logs.standard} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TrackerStandard;
