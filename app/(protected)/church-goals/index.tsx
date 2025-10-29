"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, BookOpen, Edit, Plus } from "lucide-react";
import { mockChurchGoals } from "@/components/mock-data";

export function ChurchGoalsView() {
  const { yearlyGoal, monthlyThemes } = mockChurchGoals;
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthTheme = monthlyThemes.find(t => t.month === currentMonth);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Church Goals & Themes</h1>
          <p className="text-muted-foreground">
            Annual vision and monthly service themes
          </p>
        </div>
        <Button className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Goals
        </Button>
      </div>

      {/* Current Month Theme - Highlighted */}
      {currentMonthTheme && (
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-card shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle>Current Month Theme - {currentMonthTheme.name}</CardTitle>
                  <Badge className="bg-blue-500">Active</Badge>
                </div>
                <CardDescription className="mt-1">Monthly focus for services and activities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="text-foreground mb-2">{currentMonthTheme.theme}</h3>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-background/50 border border-border/60">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-muted-foreground">{currentMonthTheme.scripture}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yearly Goal */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-sm">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>{yearlyGoal.year} Vision - {yearlyGoal.theme}</CardTitle>
              <CardDescription>Overall church goal for the year</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl border border-border/60 bg-background/50">
            <h4 className="text-foreground mb-2">Vision Statement</h4>
            <p className="text-muted-foreground leading-relaxed">{yearlyGoal.vision}</p>
          </div>

          <div>
            <h4 className="text-foreground mb-3">Key Objectives</h4>
            <div className="space-y-2">
              {yearlyGoal.objectives.map((objective, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background/50"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 dark:text-purple-400">{index + 1}</span>
                  </div>
                  <p className="text-foreground flex-1">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Themes Overview */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Service Themes</CardTitle>
              <CardDescription>Themes for each month of the year</CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Theme
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {monthlyThemes.map((theme) => {
              const isCurrent = theme.month === currentMonth;

              return (
                <Card
                  key={theme.month}
                  className={`
                    border transition-all duration-200
                    ${isCurrent 
                      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800 shadow-lg' 
                      : 'border-border/60 hover:shadow-md'
                    }
                  `}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">{theme.name}</CardTitle>
                      {isCurrent && <Badge className="bg-blue-500">Current</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-foreground mb-1">{theme.theme}</p>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                        <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">{theme.scripture}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Overview */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quarterly Breakdown</CardTitle>
          <CardDescription>Themes organized by quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((quarter) => {
              const startMonth = (quarter - 1) * 3 + 1;
              const quarterThemes = monthlyThemes.filter(
                t => t.month >= startMonth && t.month < startMonth + 3
              );

              return (
                <div key={quarter} className="p-4 rounded-xl border border-border/60 bg-background/50">
                  <h4 className="text-foreground mb-3">Q{quarter}</h4>
                  <div className="space-y-2">
                    {quarterThemes.map((theme) => (
                      <div key={theme.month} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{theme.name}:</span> {theme.theme}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
