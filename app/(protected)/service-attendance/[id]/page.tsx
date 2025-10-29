import { AttendanceDetailsView } from "./index";

export default function Page({ params }: { params: { id: string } }) {
  return <AttendanceDetailsView attendanceId={params.id} />;
}
