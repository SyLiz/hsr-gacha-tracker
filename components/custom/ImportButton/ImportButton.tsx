import * as React from "react";
import Link from "next/link";

interface IAppProps {}

export function ImportButton(props: IAppProps) {
  return (
    <div>
      <div className=" flex p-4  justify-end">
        <Link href="/">Import</Link>
      </div>
    </div>
  );
}
