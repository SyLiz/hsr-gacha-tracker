"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

interface Props {
  onAuthKeyFound: (key: string) => void;
}

function findWordIndex(sentence: string, word: string) {
  const index = sentence.indexOf(word);
  return index !== -1 ? index : null;
}

export default function DropFileSectorV2({ onAuthKeyFound }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = reader.result as string;
        const array = data.split(/\\r?\\n/);
        const filtered = array.filter((word: string) =>
          word.includes("getGachaLog")
        );
        const lastItem = filtered[filtered.length - 1];
        if (lastItem) {
          const fIndex = findWordIndex(lastItem, "1/0/");
          const lIndex = findWordIndex(lastItem, "&end_id");
          if (fIndex && lIndex) {
            let result = lastItem.substring(fIndex + 4, lIndex);
            const params = Object.fromEntries(new URLSearchParams(result));
            let authkey = encodeURIComponent(params["authkey"]);
            if (authkey) {
              onAuthKeyFound(authkey);
            }
          }
        }
      };
      reader.readAsText(files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <Card
      className={cn(
        "border-2 border-dashed rounded-lg transition-all",
        isDragging ? "border-primary bg-primary/10" : ""
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-8 text-center">
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-lg font-semibold">
          Drag and drop your log file here
        </p>
        <p className="mt-1 text-sm text-gray-500">
          or click the button to browse
        </p>
        <Button className="mt-4" onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </CardContent>
    </Card>
  );
}
