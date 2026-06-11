"use client";

const mockNotes = [
  { id: 1, title: "Today I created a Supabase project." },
  { id: 2, title: "I added some data and queried it from Next.js." },
  { id: 3, title: "It was awesome!" },
];

export default function Page() {
  return <pre>{JSON.stringify(mockNotes, null, 2)}</pre>;
}
