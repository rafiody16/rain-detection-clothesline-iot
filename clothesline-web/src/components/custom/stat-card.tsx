import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  title: string;
  value: string | number;
  desc: string;
  icon: ReactNode;
  color: string;
}

export function StatCard({ title, value, desc, icon, color }: StatCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color.replace('bg-', 'text-').replace('/10', '')} bg-zinc-100 dark:bg-zinc-900`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}