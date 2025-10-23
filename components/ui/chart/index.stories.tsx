import React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "./index";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
  RadialBarChart,
  RadialBar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

const meta: Meta<typeof ChartContainer> = {
  title: "ui/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A responsive chart container built around Recharts. Supports theme-aware color variables and styled tooltip and legend components.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ChartContainer>;

// Shared Data
const sampleData = [
  { month: "Jan", revenue: 4000, profit: 2400 },
  { month: "Feb", revenue: 3000, profit: 1398 },
  { month: "Mar", revenue: 2000, profit: 9800 },
  { month: "Apr", revenue: 2780, profit: 3908 },
  { month: "May", revenue: 1890, profit: 4800 },
  { month: "Jun", revenue: 2390, profit: 3800 },
  { month: "Jul", revenue: 3490, profit: 4300 },
];

const pieData = [
  { name: "Revenue", value: 54000 },
  { name: "Profit", value: 21600 },
  { name: "Expenses", value: 32400 },
];

const radarData = [
  { subject: "A", revenue: 120, profit: 110 },
  { subject: "B", revenue: 98, profit: 130 },
  { subject: "C", revenue: 86, profit: 130 },
  { subject: "D", revenue: 99, profit: 100 },
  { subject: "E", revenue: 85, profit: 90 },
  { subject: "F", revenue: 65, profit: 85 },
];

const scatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(220, 90%, 56%)",
  },
  profit: {
    label: "Profit",
    color: "hsl(160, 75%, 40%)",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(10, 80%, 55%)",
  },
};

// =======================
// LINE CHART
// =======================
export const LineExample: Story = {
  args: { config: chartConfig },
  render: args => (
    <div className="w-[600px] h-[350px]">
      <ChartContainer {...args}>
        <LineChart data={sampleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="var(--color-profit)"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  ),
};

// =======================
// BAR CHART
// =======================
export const BarExample: Story = {
  args: { config: chartConfig },
  render: args => (
    <div className="w-[600px] h-[350px]">
      <ChartContainer {...args}>
        <BarChart data={sampleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" />
          <Bar dataKey="profit" fill="var(--color-profit)" />
        </BarChart>
      </ChartContainer>
    </div>
  ),
};

// =======================
// AREA CHART
// =======================
export const AreaExample: Story = {
  args: { config: chartConfig },
  render: args => (
    <div className="w-[600px] h-[350px]">
      <ChartContainer {...args}>
        <AreaChart data={sampleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            fill="var(--color-revenue)"
            fillOpacity={0.25}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="var(--color-profit)"
            fill="var(--color-profit)"
            fillOpacity={0.25}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  ),
};

// =======================
// PIE CHART
// =======================
export const PieExample: Story = {
  args: { config: chartConfig },
  render: args => (
    <div className="w-[400px] h-[400px]">
      <ChartContainer {...args}>
        <PieChart>
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {pieData.map((entry, index) => {
              const colorKey = entry.name.toLowerCase();
              const fill = `var(--color-${colorKey})`;
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  ),
};

// =======================
// COMPOSED CHART
// =======================
export const ComposedExample: Story = {
  args: { config: chartConfig },
  render: args => (
    <div className="w-[650px] h-[350px]">
      <ChartContainer {...args}>
        <ComposedChart data={sampleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Area
            type="monotone"
            dataKey="profit"
            fill="var(--color-profit)"
            fillOpacity={0.2}
            stroke="var(--color-profit)"
          />
          <Bar dataKey="revenue" barSize={20} fill="var(--color-revenue)" />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="var(--color-expenses)"
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  ),
};

// =======================
// RADAR CHART
// =======================
export const RadarExample: Story = {
  args: { config: chartConfig },
  render: args => (
    <div className="w-[450px] h-[350px]">
      <ChartContainer {...args}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis />
          <Radar
            name="Revenue"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            fill="var(--color-revenue)"
            fillOpacity={0.4}
          />
          <Radar
            name="Profit"
            dataKey="profit"
            stroke="var(--color-profit)"
            fill="var(--color-profit)"
            fillOpacity={0.4}
          />
          <Legend />
        </RadarChart>
      </ChartContainer>
    </div>
  ),
};

// =======================
// RADIAL BAR CHART
// =======================
export const RadialBarExample: Story = {
  args: { config: chartConfig },
  render: args => (
    <div className="w-[400px] h-[400px]">
      <ChartContainer {...args}>
        <RadialBarChart
          innerRadius="20%"
          outerRadius="90%"
          data={pieData}
          startAngle={90}
          endAngle={450}
        >
          <RadialBar
            background
            dataKey="value"
            label={{ position: "insideStart", fill: "#fff" }}
          >
            {pieData.map((entry, index) => {
              const colorKey = entry.name.toLowerCase();
              const fill = `var(--color-${colorKey})`;
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </RadialBar>
          <Legend content={<ChartLegendContent />} />
          <Tooltip content={<ChartTooltipContent />} />
        </RadialBarChart>
      </ChartContainer>
    </div>
  ),
};

// =======================
// SCATTER CHART
// =======================
export const ScatterExample: Story = {
  args: { config: chartConfig },
  render: args => (
    <div className="w-[650px] h-[350px]">
      <ChartContainer {...args}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="stature" unit="cm" />
          <YAxis type="number" dataKey="y" name="weight" unit="kg" />
          <ZAxis type="number" dataKey="z" range={[100, 500]} />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend content={<ChartLegendContent />} />
          <Scatter
            name="A data set"
            data={scatterData}
            fill="var(--color-revenue)"
          />
        </ScatterChart>
      </ChartContainer>
    </div>
  ),
};
