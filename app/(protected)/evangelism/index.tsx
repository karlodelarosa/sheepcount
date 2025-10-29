import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, UserPlus, Users, BookOpen, Award } from "lucide-react";
import { mockPeople } from "@/components/mock-data";

export function EvangelismFlowView() {
  const stages = [
    {
      id: "first-time",
      name: "First-time Attendee",
      description: "New visitors who attended for the first time",
      icon: UserPlus,
      color: "blue",
      nextAction: "Schedule follow-up visit or call"
    },
    {
      id: "follow-up",
      name: "Follow-up",
      description: "People who have been contacted after first visit",
      icon: Users,
      color: "purple",
      nextAction: "Invite to Small Group"
    },
    {
      id: "small-group",
      name: "Small Group",
      description: "Participating in small groups (4-5 people)",
      icon: Users,
      color: "green",
      nextAction: "Progress to Discipleship"
    },
    {
      id: "discipleship",
      name: "Discipleship",
      description: "Enrolled in discipleship programs",
      icon: BookOpen,
      color: "orange",
      nextAction: "Consider for Worker role"
    },
    {
      id: "worker",
      name: "Worker / Volunteer",
      description: "Active in ministry and service",
      icon: Award,
      color: "indigo",
      nextAction: "Continue development"
    }
  ];

  const getStageCount = (stageName: string) => {
    return mockPeople.filter(p => p.evangelismStage === stageName).length;
  };

  const getPeopleInStage = (stageName: string) => {
    return mockPeople.filter(p => p.evangelismStage === stageName);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Evangelism Journey Flow</h1>
        <p className="text-muted-foreground">
          Track individual spiritual progress through stages of growth
        </p>
      </div>

      {/* Flow Overview */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Journey Stages</CardTitle>
          <CardDescription>Visual representation of the evangelism and growth flow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-5">
            {stages.map((stage, index) => (
              <div key={stage.id} className="relative">
                <Card className={`border-${stage.color}-200 dark:border-${stage.color}-800 bg-card`}>
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stage.color}-500 to-${stage.color}-700 flex items-center justify-center mb-3 shadow-sm`}>
                      <stage.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="mb-1 text-foreground">{stage.name}</h4>
                    <p className="text-muted-foreground mb-3">{stage.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-foreground">{getStageCount(stage.name)}</span>
                      <Badge variant="outline">{getStageCount(stage.name)} people</Badge>
                    </div>
                  </CardContent>
                </Card>
                {index < stages.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed View by Stage */}
      <div className="grid gap-6">
        {stages.map((stage) => {
          const peopleInStage = getPeopleInStage(stage.name);
          
          if (peopleInStage.length === 0) return null;

          return (
            <Card key={stage.id} className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${stage.color}-500 to-${stage.color}-700 flex items-center justify-center shadow-sm`}>
                    <stage.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{stage.name}</CardTitle>
                    <CardDescription>{peopleInStage.length} people in this stage</CardDescription>
                  </div>
                  <Badge className={`bg-${stage.color}-500`}>{stage.nextAction}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {peopleInStage.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-background/50 hover:bg-background transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center shadow-sm">
                        <span className="text-white dark:text-slate-900">{person.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">{person.name}</p>
                        <p className="text-muted-foreground">{person.householdName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{person.membershipType}</Badge>
                        <p className="text-muted-foreground mt-1">
                          Last: {new Date(person.lastAttendance).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Actions Summary */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>Suggested next steps for each stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stages.map((stage) => {
              const count = getStageCount(stage.name);
              if (count === 0) return null;

              return (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${stage.color}-500 to-${stage.color}-700 flex items-center justify-center`}>
                      <stage.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-foreground">{stage.name}</p>
                      <p className="text-muted-foreground">{stage.nextAction}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{count} people</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
