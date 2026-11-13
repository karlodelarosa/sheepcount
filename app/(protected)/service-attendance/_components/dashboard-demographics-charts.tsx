"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users } from "lucide-react";
import {
  AGE_BRACKET_COLORS,
  AGE_BRACKET_LABELS,
  GENDER_COLORS,
  GENDER_LABELS,
  getAgeBracket,
  getGenderKey,
  type AgeBracketKey,
  type GenderKey,
} from "@/lib/person-demographics";
import type { DashboardAttendeeSummary } from "../_lib/group-attendance";

interface DashboardDemographicsChartsProps {
  attendees: DashboardAttendeeSummary[];
  hideAge?: boolean;
}

export function DashboardDemographicsCharts({
  attendees,
  hideAge = false,
}: DashboardDemographicsChartsProps) {
  const genderData = useMemo(() => {
    const counts: Record<GenderKey, number> = {
      male: 0,
      female: 0,
      unknown: 0,
    };
    for (const person of attendees) {
      counts[getGenderKey(person.gender)]++;
    }
    return (Object.keys(counts) as GenderKey[])
      .filter(key => counts[key] > 0)
      .map(key => ({
        key,
        label: GENDER_LABELS[key],
        count: counts[key],
        color: GENDER_COLORS[key],
      }));
  }, [attendees]);

  const ageData = useMemo(() => {
    const counts: Record<AgeBracketKey, number> = {
      kids: 0,
      youth: 0,
      young_adults: 0,
      adults: 0,
      seniors: 0,
      unknown: 0,
    };
    for (const person of attendees) {
      counts[getAgeBracket(person.age, person.birthdate)]++;
    }
    const order: AgeBracketKey[] = [
      "kids",
      "youth",
      "young_adults",
      "adults",
      "seniors",
      "unknown",
    ];
    return order
      .filter(key => counts[key] > 0)
      .map(key => ({
        key,
        label: AGE_BRACKET_LABELS[key],
        count: counts[key],
        color: AGE_BRACKET_COLORS[key],
      }));
  }, [attendees]);

  if (attendees.length === 0) return null;

  return (
    <div
      className={
        hideAge ? "grid min-w-0 grid-cols-1" : "grid gap-4 lg:grid-cols-2"
      }
    >
      <Card className="min-w-0 rounded-2xl border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base font-bold">
            <Users className="size-5 shrink-0 text-[var(--accent-color)]" />
            By gender
          </CardTitle>
          <CardDescription className="text-sm">
            Unique people in selected filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {genderData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {genderData.map(entry => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 w-full">
                {genderData.map(item => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="tabular-nums font-medium">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">
              No gender data
            </p>
          )}
        </CardContent>
      </Card>

      {!hideAge && (
        <Card className="min-w-0 rounded-2xl border-border/60 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base font-bold">
              <Users className="w-4 h-4 text-indigo-500" />
              By age bracket
            </CardTitle>
            <CardDescription className="text-sm">
              People without birthdates are grouped as Unknown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ageData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={ageData}
                    layout="vertical"
                    margin={{ left: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={72}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {ageData.map(entry => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">
                No age data
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
