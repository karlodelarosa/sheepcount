"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, ClipboardList } from "lucide-react";

type Person = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  // keep placeholders for other fields if you later extend
  householdName?: string;
  joinDate?: string;
  role?: string;
  age?: number;
  membershipType?: string;
};

const mockPeople: Person[] = [
  {
    id: "p1",
    name: "Karlo Dela Rosa",
    email: "karlo@email.com",
    phone: "09171234567",
    status: "Prospect",
  },
  {
    id: "p2",
    name: "May Santos",
    email: "may@email.com",
    phone: "09171234568",
    status: "Prospect",
  },
  {
    id: "p3",
    name: "Titus Cruz",
    email: "titus@email.com",
    phone: "09171234569",
    status: "Prospect",
  },
];

export function ProspectDirectory() {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  if (selectedPersonId) {
    const person = mockPeople.find((p) => p.id === selectedPersonId) ?? undefined;
    return <ProspectDetails person={person} onBack={() => setSelectedPersonId(null)} />;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prospect Directory</h1>
      <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">List of Prospects</CardTitle>
          <CardDescription className="text-slate-600 dark:text-zinc-400">
            Click on a prospect to view details or convert to member.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-slate-300 dark:border-zinc-700">
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
                {mockPeople.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50 dark:hover:bg-zinc-700">
                    <td className="border px-4 py-2 text-slate-900 dark:text-white">{person.name}</td>
                    <td className="border px-4 py-2 text-slate-900 dark:text-white">{person.email ?? "-"}</td>
                    <td className="border px-4 py-2 text-slate-900 dark:text-white">{person.phone ?? "-"}</td>
                    <td className="border px-4 py-2">
                      <Badge className="rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                        {person.status ?? "—"}
                      </Badge>
                    </td>
                    <td className="border px-4 py-2">
                      <Button size="sm" onClick={() => setSelectedPersonId(person.id)}>
                        View / Convert
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProspectDetails({ person, onBack }: { person?: Person; onBack: () => void }) {
  if (!person) {
    return (
      <div className="p-6 text-center text-slate-600 dark:text-zinc-400">
        <Button onClick={onBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p>Prospect not found.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock submit behavior - replace with your handler
    alert(`${person.name} converted (mock).`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div>
          <h1 className="text-slate-900 dark:text-white">Prospect Details</h1>
          <p className="text-slate-600 dark:text-zinc-400">View and convert prospect information</p>
        </div>
      </div>

      <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-400 dark:from-amber-700 dark:to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl">{person.name.charAt(0)}</span>
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900 dark:text-white">{person.name}</CardTitle>
                <CardDescription className="text-slate-600 dark:text-zinc-400">Prospect Record</CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge className="rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                    {person.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                <div>
                  <p className="text-slate-500 dark:text-zinc-500">Email</p>
                  <p className="text-slate-900 dark:text-white">{person.email ?? "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                <div>
                  <p className="text-slate-500 dark:text-zinc-500">Phone</p>
                  <p className="text-slate-900 dark:text-white">{person.phone ?? "Not provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-slate-500 dark:text-zinc-500" />
                <div>
                  <p className="text-slate-500 dark:text-zinc-500">Status</p>
                  <p className="text-slate-900 dark:text-white">{person.status}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t mt-6 pt-6">
            <h2 className="font-semibold text-slate-900 dark:text-white">Convert to Member</h2>

            <div>
              <label className="block mb-1 text-slate-600 dark:text-zinc-400">Joining Date</label>
              <input type="date" className="w-full border p-2 rounded dark:bg-zinc-700 dark:border-zinc-600" />
            </div>

            <div>
              <label className="block mb-1 text-slate-600 dark:text-zinc-400">Role / Position</label>
              <input type="text" placeholder="e.g., Worship Team" className="w-full border p-2 rounded dark:bg-zinc-700 dark:border-zinc-600" />
            </div>

            <div>
              <label className="block mb-1 text-slate-600 dark:text-zinc-400">Notes</label>
              <textarea className="w-full border p-2 rounded dark:bg-zinc-700 dark:border-zinc-600" />
            </div>

            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
              Convert to Member
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// default export for convenience (page.tsx importing default or named will work)
export default ProspectDirectory;
