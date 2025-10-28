import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserPlus, UserCog } from "lucide-react";
import { mockPeople } from "@/components/mock-data";
import { Button } from "@/components/ui/button";

export function WorkersView() {
  const workers = mockPeople.filter(
    p => p.membershipType === "Worker" && p.status === "Active",
  );
  const members = mockPeople.filter(
    p => p.membershipType === "Member" && p.status === "Active",
  );
  const attenders = mockPeople.filter(
    p => p.membershipType === "Attender" && p.status === "Active",
  );

  // Gradient colors for avatars (Light and Dark)
  const getMembershipColor = (type: string) => {
    switch (type) {
      // Light Mode: Indigo/Purple, Dark Mode: Purple/Violet
      case "Worker":
        return "from-indigo-500 to-indigo-700 dark:from-purple-500 dark:to-purple-700";
      // Light Mode: Blue, Dark Mode: Blue
      case "Member":
        return "from-blue-500 to-blue-700";
      // Light Mode: Green, Dark Mode: Emerald
      case "Attender":
        return "from-green-500 to-green-700 dark:from-emerald-500 dark:to-emerald-700";
      default:
        return "from-slate-500 to-slate-700 dark:from-zinc-500 dark:to-zinc-700";
    }
  };

  // --- Dual-Mode Badge Colors ---
  const getMembershipBadge = (type: string) => {
    switch (type) {
      // Light Mode: Purple-100/700, Dark Mode: Purple-800/300
      case "Worker":
        return "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300";
      // Light Mode: Blue-100/700, Dark Mode: Blue-800/300
      case "Member":
        return "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300";
      // Light Mode: Green-100/700, Dark Mode: Emerald-800/300
      case "Attender":
        return "bg-green-100 text-green-700 dark:bg-emerald-800 dark:text-emerald-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300";
    }
  };

  // Styling for the dual-mode primary button (Light: Slate, Dark: Purple)
  const DualModeButtonClass =
    "rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 dark:bg-purple-600 dark:hover:bg-purple-700 dark:shadow-purple-900/40";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Card styling: Light: white/slate, Dark: zinc-800/zinc-700, Light Text: slate-900, Dark Text: white */}
        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-500 dark:text-zinc-300">Total Active</CardTitle>
            <Users className="h-5 w-5 text-slate-500 dark:text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white text-2xl font-bold">
              {workers.length + members.length + attenders.length}
            </div>
            <p className="text-slate-500 dark:text-zinc-500">All categories</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-500 dark:text-zinc-300">Workers</CardTitle>
            <UserCog className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white text-2xl font-bold">
              {workers.length}
            </div>
            <p className="text-slate-500 dark:text-zinc-500">Serving in ministries</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-500 dark:text-zinc-300">Members</CardTitle>
            <UserCheck className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white text-2xl font-bold">
              {members.length}
            </div>
            <p className="text-slate-500 dark:text-zinc-500">Official members</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-slate-500 dark:text-zinc-300">Attenders</CardTitle>
            <UserPlus className="h-5 w-5 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-slate-900 dark:text-white text-2xl font-bold">
              {attenders.length}
            </div>
            <p className="text-slate-500 dark:text-zinc-500">Regular attenders</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card (Membership Levels) */}
      <Card className="border-slate-200/60 bg-white dark:border-zinc-700/60 dark:bg-zinc-800">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="text-slate-900 dark:text-white text-xl font-semibold">
              Membership Levels
            </h3>
            <div className="space-y-2 text-slate-600 dark:text-zinc-400">
              <div className="flex items-start gap-2">
                <UserPlus className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="text-slate-900 dark:text-white">Attenders</p>
                  <p>
                    Regular visitors who attend services but haven't formally
                    joined the church
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <UserCheck className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-slate-900 dark:text-white">Members</p>
                  <p>
                    Officially registered church members who have completed
                    membership requirements
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <UserCog className="w-5 h-5 text-purple-500 dark:text-purple-400 mt-0.5" />
                <div>
                  <p className="text-slate-900 dark:text-white">Workers</p>
                  <p>
                    Members actively serving in church ministries and leadership
                    positions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers List */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Workers ({workers.length})</CardTitle>
          <CardDescription className="text-slate-600 dark:text-zinc-400">
            Members serving in church ministries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workers.map(person => (
              <Card
                key={person.id}
                // Dual-mode card items
                className="border-slate-200/60 bg-white hover:shadow-lg transition-all dark:border-zinc-700/60 dark:bg-zinc-700/50"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMembershipColor(person.membershipType)} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-white text-lg">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-900 dark:text-white font-medium">{person.name}</p>
                        <Badge
                          className={`rounded-lg ${getMembershipBadge(person.membershipType)}`}
                        >
                          {person.membershipType}
                        </Badge>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400">{person.householdName}</p>
                      <p className="text-slate-500 dark:text-zinc-500">{person.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Members ({members.length})</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Official church members
              </CardDescription>
            </div>
            <Button className={DualModeButtonClass}>Promote to Worker</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map(person => (
              <Card
                key={person.id}
                className="border-slate-200/60 bg-white hover:shadow-lg transition-all dark:border-zinc-700/60 dark:bg-zinc-700/50"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMembershipColor(person.membershipType)} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-white text-lg">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-900 dark:text-white font-medium">{person.name}</p>
                        <Badge
                          className={`rounded-lg ${getMembershipBadge(person.membershipType)}`}
                        >
                          {person.membershipType}
                        </Badge>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400">{person.householdName}</p>
                      <p className="text-slate-500 dark:text-zinc-500">{person.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attenders List */}
      <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900 dark:text-white">Attenders ({attenders.length})</CardTitle>
              <CardDescription className="text-slate-600 dark:text-zinc-400">
                Regular visitors and newcomers
              </CardDescription>
            </div>
            <Button className={DualModeButtonClass}>Promote to Member</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attenders.map(person => (
              <Card
                key={person.id}
                className="border-slate-200/60 bg-white hover:shadow-lg transition-all dark:border-zinc-700/60 dark:bg-zinc-700/50"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMembershipColor(person.membershipType)} flex items-center justify-center shadow-sm`}
                    >
                      <span className="text-white text-lg">
                        {person.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-slate-900 dark:text-white font-medium">{person.name}</p>
                        <Badge
                          className={`rounded-lg ${getMembershipBadge(person.membershipType)}`}
                        >
                          {person.membershipType}
                        </Badge>
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400">{person.householdName}</p>
                      <p className="text-slate-500 dark:text-zinc-500">
                        {person.email || "No email"}
                      </p>
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