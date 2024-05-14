import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface IAppProps {}

export function ImportButton(props: IAppProps) {
  return (
    <div>
      <div className=" flex p-4  justify-end">
        <Button asChild>
          <Link href="/tracker">Import</Link>
        </Button>
      </div>
    </div>
  );
}
