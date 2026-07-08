"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  bgGlow?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  subtitle,
  icon: Icon,
  gradient,
  bgGlow = "bg-primary/10",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {change && trend && (
                <div className="flex items-center gap-1 mt-2">
                  {trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      trend === "up"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {change}
                  </span>
                </div>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div
            className={`absolute -top-8 -right-8 w-24 h-24 ${bgGlow} rounded-full blur-2xl`}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
