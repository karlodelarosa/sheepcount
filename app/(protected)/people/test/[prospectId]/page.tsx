"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Same mock data (static)
const mockPeople = [
  { id: "p1", name: "Karlo Dela Rosa", email: "karlo@email.com", phone: "09171234567", status: "Prospect" },
  { id: "p2", name: "May Santos", email: "may@email.com", phone: "09171234568", status: "Prospect" },
  { id: "p3", name: "Titus Cruz", email: "titus@email.com", phone: "09171234569", status: "Prospect" },
];

interface Props {
  params: { prospectId: string };
}

export default function ProspectDetailPage({ params }: Props) {
  const router = useRouter();
  const { prospectId } = params;

  const person = mockPeople.find(p => p.id === prospectId);

  if (!person) return <p className="p-6 text-red-500">Prospect not found.</p>;

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <Button onClick={() => router.back()} className="bg-gray-200 hover:bg-gray-300">
        Back
      </Button>

      <h1 className="text-2xl font-bold">{person.name}</h1>
      <p>Email: {person.email}</p>
      <p>Phone: {person.phone}</p>
      <p>Status: {person.status}</p>

      <form className="space-y-3 border p-4 rounded">
        <h2 className="font-semibold">Convert to Member</h2>
        <div>
          <label className="block mb-1">Joining Date</label>
          <input type="date" className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1">Role / Position</label>
          <input type="text" placeholder="e.g., Worship Team" className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1">Notes</label>
          <textarea className="w-full border p-2 rounded" />
        </div>
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
          Convert to Member
        </Button>
      </form>
    </div>
  );
}
