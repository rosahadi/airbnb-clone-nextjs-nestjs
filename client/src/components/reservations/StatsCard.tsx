import { Card, CardContent } from "../ui/card";
import { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: number | string;
  icon?: ReactNode;
  description?: string;
  color?: "blue" | "green" | "indigo" | "purple" | "red";
};

function StatsCard({
  title,
  value,
  icon,
  description,
  color = "blue",
}: StatsCardProps) {
  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
    purple: "text-purple-600 dark:text-purple-400",
    red: "text-red-600 dark:text-red-400",
  };

  const backgroundClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/30",
    green: "bg-green-50 dark:bg-green-950/30",
    indigo: "bg-indigo-50 dark:bg-indigo-950/30",
    purple: "bg-purple-50 dark:bg-purple-950/30",
    red: "bg-red-50 dark:bg-red-950/30",
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div
              className={`p-2 sm:p-2.5 rounded-lg ${backgroundClasses[color]} ml-3 flex-shrink-0`}
            >
              <div className={colorClasses[color]}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
