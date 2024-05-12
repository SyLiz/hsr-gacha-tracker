import { GachaLogProvider } from "@/lib/Context/gacha-logs-provider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GachaLogProvider>{children}</GachaLogProvider>;
}
