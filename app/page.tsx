"use client";
import React, { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

const UploadPage = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <Card className={cn("w-[480px]")}>
        <CardHeader className="text-center">
          <CardTitle>Honkai: Star Rail Gacha Tracker</CardTitle>
          <CardDescription>
            Track your warp history and analyze your luck!
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            To get started, import your gacha log file.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/tracker" className="w-full">
            <Button className="w-full">Go to Tracker</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UploadPage;
