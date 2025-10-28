import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserPlus, UserCog } from "lucide-react";
import { mockPeople } from "@/components/mock-data";
import { Button } from "@/components/ui/button";

export function WorkersView() {
  const workers = mockPeople.filter(p => p.membershipType === "Worker" && p.status === "Active");
  const members = mockPeople.filter(p => p.membershipType === "Member" && p.status === "Active");
  const attenders = mockPeople.filter(p => p.membershipType === "Attender" && p.status === "Active");

  const getMembershipColor = (type: string) => {
    switch(type) {
      case "Worker": return "from-purple-500 to-purple-700";
      case "Member": return "from-blue-500 to-blue-700";
      case "Attender": return "from-green-500 to-green-700";
      default: return "from-slate-500 to-slate-700";
    }
  };

  const getMembershipBadge = (type: string) => {
    switch(type) {
      case "Worker": return "bg-purple-100 text-purple-700";
      case "Member": return "bg-blue-100 text-blue-700";
      case "Attender": return "bg-green-100 text-green-700";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Active</CardTitle>
            <Users className="h-5 w-5 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{workers.length + members.length + attenders.length}</div>
            <p className="text-slate-600">All categories</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Workers</CardTitle>
            <UserCog className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{workers.length}</div>
            <p className="text-slate-600">Serving in ministries</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Members</CardTitle>
            <UserCheck className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{members.length}</div>
            <p className="text-slate-600">Official members</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Attenders</CardTitle>
            <UserPlus className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900">{attenders.length}</div>
            <p className="text-slate-600">Regular attenders</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-slate-200/60 bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="text-slate-900">Membership Levels</h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-start gap-2">
                <UserPlus className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-slate-900">Attenders</p>
                  <p>Regular visitors who attend services but haven't formally joined the church</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <UserCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-slate-900">Members</p>
                  <p>Officially registered church members who have completed membership requirements</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <UserCog className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-slate-900">Workers</p>
                  <p>Members actively serving in church ministries and leadership positions</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Workers ({workers.length})</CardTitle>
          <CardDescription>Members serving in church ministries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workers.map((person) => (
              <Card key={person.id} className="border-slate-200/60 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMembershipColor(person.membershipType)} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-lg">{person.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-900">{person.name}</p>
                        <Badge className={`rounded-lg ${getMembershipBadge(person.membershipType)}`}>
                          {person.membershipType}
                        </Badge>
                      </div>
                      <p className="text-slate-600">{person.householdName}</p>
                      <p className="text-slate-500">{person.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members ({members.length})</CardTitle>
              <CardDescription>Official church members</CardDescription>
            </div>
            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
              Promote to Worker
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((person) => (
              <Card key={person.id} className="border-slate-200/60 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMembershipColor(person.membershipType)} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-lg">{person.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-900">{person.name}</p>
                        <Badge className={`rounded-lg ${getMembershipBadge(person.membershipType)}`}>
                          {person.membershipType}
                        </Badge>
                      </div>
                      <p className="text-slate-600">{person.householdName}</p>
                      <p className="text-slate-500">{person.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attenders */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attenders ({attenders.length})</CardTitle>
              <CardDescription>Regular visitors and newcomers</CardDescription>
            </div>
            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
              Promote to Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attenders.map((person) => (
              <Card key={person.id} className="border-slate-200/60 hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMembershipColor(person.membershipType)} flex items-center justify-center shadow-sm`}>
                      <span className="text-white text-lg">{person.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-900">{person.name}</p>
                        <Badge className={`rounded-lg ${getMembershipBadge(person.membershipType)}`}>
                          {person.membershipType}
                        </Badge>
                      </div>
                      <p className="text-slate-600">{person.householdName}</p>
                      <p className="text-slate-500">{person.email || "No email"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
