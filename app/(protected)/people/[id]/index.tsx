import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  Phone,
  Home,
  Calendar,
  Users,
  Award,
} from "lucide-react";
import {
  mockPeople,
  mockMinistryAssignments,
  mockLifeGroupMembers,
  mockAttendance,
  mockMinistries,
  mockLifeGroups,
} from "@/components/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PersonDetailsProps {
  personId: string;
  onBack: () => void;
}

export function PersonDetails({ personId, onBack }: PersonDetailsProps) {
  const person = mockPeople.find(p => p.id === personId);

  if (!person) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-slate-900">Person Not Found</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            The requested person could not be found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const ministries = mockMinistryAssignments
    .filter(a => a.personId === personId)
    .map(a => ({
      ...a,
      ministry: mockMinistries.find(m => m.id === a.ministryId),
    }));

  const lifeGroups = mockLifeGroupMembers
    .filter(m => m.personId === personId)
    .map(m => ({
      ...m,
      group: mockLifeGroups.find(g => g.id === m.lifeGroupId),
    }));

  const attendanceRecords = mockAttendance.filter(r => r.personId === personId);

  const last12Weeks = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i * 7);
    return date;
  }).reverse();

  const weeklyAttendance = last12Weeks.map(week => {
    const attended = attendanceRecords.some(r => {
      const recordDate = new Date(r.date);
      return (
        Math.abs(recordDate.getTime() - week.getTime()) <
        7 * 24 * 60 * 60 * 1000
      );
    });
    return {
      week: `Week ${last12Weeks.indexOf(week) + 1}`,
      attended: attended ? 1 : 0,
    };
  });

  const totalAttended = attendanceRecords.length;
  const attendanceRate = Math.round((totalAttended / 52) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-yellow-100 text-yellow-700";
      case "Exited":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case "Worker":
        return "bg-purple-100 text-purple-700";
      case "Member":
        return "bg-blue-100 text-blue-700";
      case "Attender":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-slate-900">Person Details</h1>
          <p className="text-slate-600">
            Comprehensive view of member information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200/60 bg-white md:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl">
                    {person.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{person.name}</CardTitle>
                  <CardDescription>
                    {person.role} • {person.age} years old
                  </CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      className={`rounded-lg ${getStatusColor(person.status)}`}
                    >
                      {person.status}
                    </Badge>
                    <Badge
                      className={`rounded-lg ${getMembershipColor(person.membershipType)}`}
                    >
                      {person.membershipType}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="text-slate-900">
                      {person.email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="text-slate-900">
                      {person.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-slate-500">Household</p>
                    <p className="text-slate-900">{person.householdName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-slate-500">Join Date</p>
                    <p className="text-slate-900">
                      {new Date(person.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Ministries</span>
              <span className="text-slate-900">{ministries.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Life Groups</span>
              <span className="text-slate-900">{lifeGroups.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Attendance Rate</span>
              <span className="text-slate-900">{attendanceRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total Attended</span>
              <span className="text-slate-900">{totalAttended}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/60 bg-white">
        <CardHeader>
          <CardTitle>Attendance Trend (Last 12 Weeks)</CardTitle>
          <CardDescription>Weekly service attendance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
                formatter={(value: number) =>
                  value === 1 ? "Present" : "Absent"
                }
              />
              <Bar dataKey="attended" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200/60 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ministry Assignments</CardTitle>
              <Award className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            {ministries.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Not assigned to any ministries
              </p>
            ) : (
              <div className="space-y-3">
                {ministries.map(assignment => (
                  <div
                    key={assignment.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/60"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-slate-900">
                        {assignment.ministry?.name}
                      </p>
                      <Badge variant="secondary" className="rounded-lg">
                        {assignment.role}
                      </Badge>
                    </div>
                    <p className="text-slate-600 mt-1">
                      {assignment.ministry?.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Life Groups</CardTitle>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            {lifeGroups.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Not part of any life groups
              </p>
            ) : (
              <div className="space-y-3">
                {lifeGroups.map(membership => (
                  <div
                    key={membership.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/60"
                  >
                    <p className="text-slate-900">{membership.group?.name}</p>
                    <p className="text-slate-600 mt-1">
                      {membership.group?.description}
                    </p>
                    <p className="text-slate-500 mt-2">
                      Joined:{" "}
                      {new Date(membership.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
