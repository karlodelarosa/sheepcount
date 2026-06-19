import { redirect } from "next/navigation";

export default function Page() {
  redirect("/leadership?tab=org-chart");
}
