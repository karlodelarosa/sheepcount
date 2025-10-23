// Table.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./index";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

// Mock data
const mockData = [
  {
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Editor",
    status: "Inactive",
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Viewer",
    status: "Active",
  },
  {
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
  },
];

export const WithMockData: Story = {
  render: () => (
    <Table className="border border-border">
      <TableCaption>Users Table</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockData.map((user, index) => (
          <TableRow key={index}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Total Users: {mockData.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
