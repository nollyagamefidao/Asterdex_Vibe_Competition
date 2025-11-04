import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  valueColor?: string;
  testId?: string;
}

export default function StatCard({ label, value, icon: Icon, valueColor = "text-foreground", testId }: StatCardProps) {
  return (
    <Card className="p-6 hover-elevate" data-testid={testId}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${valueColor} tabular-nums`} data-testid={`${testId}-value`}>
            {value}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  );
}
