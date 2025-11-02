"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Mock data
const mockPeople = [
  { id: "p1", name: "Karlo Dela Rosa", email: "karlo@email.com", phone: "09171234567", status: "Prospect" },
  { id: "p2", name: "May Santos", email: "may@email.com", phone: "09171234568", status: "Prospect" },
  { id: "p3", name: "Titus Cruz", email: "titus@email.com", phone: "09171234569", status: "Prospect" },
];

export default function ProspectList() {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    router.push(`/prospects/${id}`); // Navigate to dynamic page
  };

  return (
    <div className="overflow-x-auto p-6">
      <table className="table-auto w-full border-collapse border border-slate-300">
        <thead className="bg-slate-100 dark:bg-zinc-700">
          <tr>
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Email</th>
            <th className="border px-4 py-2 text-left">Phone</th>
            <th className="border px-4 py-2 text-left">Status</th>
            <th className="border px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockPeople.map(person => (
            <tr
              key={person.id}
              className="cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-700"
            >
              <td className="border px-4 py-2">{person.name}</td>
              <td className="border px-4 py-2">{person.email || "-"}</td>
              <td className="border px-4 py-2">{person.phone || "-"}</td>
              <td className="border px-4 py-2">{person.status}</td>
              <td className="border px-4 py-2">
                <Button size="sm" onClick={() => handleRowClick(person.id)}>
                  View / Convert
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
