import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  Award,
  UserCircle,
} from "lucide-react";
import {
  mockAttendance,
  mockPeople,
  mockTrainingCompletions,
  mockTrainingEvents,
  mockMinistryAssignments,
  mockMinistries,
  mockAdminPositions,
  mockLifeGroupMembers,
  mockLifeGroups,
} from "@/components/mock-data";

interface PersonDetailsDialogProps {
  person: any;
  onClose: () => void;
}

export function PersonDetailsDialog({
  person,
  onClose,
}: PersonDetailsDialogProps) {
  if (!person) return null;

  // Get household members
  const householdMembers = mockPeople.filter(
    p => p.householdId === person.householdId && p.id !== person.id,
  );

  // Get attendance history
  const attendanceHistory = mockAttendance
    .filter(a => a.personId === person.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get training completions
  const trainingCompletions = mockTrainingCompletions
    .filter(tc => tc.personId === person.id)
    .map(tc => ({
      ...tc,
      training: mockTrainingEvents.find(t => t.id === tc.trainingId),
    }));

  // Get ministry assignments
  const ministryAssignments = mockMinistryAssignments
    .filter(ma => ma.personId === person.id)
    .map(ma => ({
      ...ma,
      ministry: mockMinistries.find(m => m.id === ma.ministryId),
    }));

  // Get admin positions
  const adminPositions = mockAdminPositions.filter(
    ap => ap.personId === person.id,
  );

  // Get life group memberships
  const lifeGroupMemberships = mockLifeGroupMembers
    .filter(lgm => lgm.personId === person.id)
    .map(lgm => ({
      ...lgm,
      group: mockLifeGroups.find(lg => lg.id === lgm.lifeGroupId),
    }));

  return (
    <Dialog open={!!person} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-2xl border-slate-200/60">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">
                {person.name.charAt(0)}
              </span>
            </div>
            <div>
              <DialogTitle>{person.name}</DialogTitle>
              <DialogDescription>
                Member since {new Date(person.joinDate).toLocaleDateString()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <h3 className="text-slate-900 mb-3">Basic Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="rounded-lg">{person.role}</Badge>
                <span className="text-slate-600">Age: {person.age}</span>
              </div>
              {person.email && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4" />
                  <span>{person.email}</span>
                </div>
              )}
              {person.phone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4" />
                  <span>{person.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Household */}
          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Household Members
            </h3>
            {householdMembers.length === 0 ? (
              <p className="text-slate-500">No other household members</p>
            ) : (
              <div className="space-y-2">
                {householdMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60"
                  >
                    <span className="text-slate-700">{member.name}</span>
                    <Badge variant="secondary" className="rounded-lg">
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Life Group Memberships */}
          {lifeGroupMemberships.length > 0 && (
            <>
              <div>
                <h3 className="text-slate-900 mb-3 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  Life Groups
                </h3>
                <div className="space-y-2">
                  {lifeGroupMemberships.map(membership => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60"
                    >
                      <span className="text-slate-700">
                        {membership.group?.name}
                      </span>
                      <Badge variant="secondary" className="rounded-lg">
                        {membership.group?.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Ministry Assignments */}
          {ministryAssignments.length > 0 && (
            <>
              <div>
                <h3 className="text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Work Ministry Assignments
                </h3>
                <div className="space-y-2">
                  {ministryAssignments.map(assignment => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60"
                    >
                      <span className="text-slate-700">
                        {assignment.ministry?.name}
                      </span>
                      <Badge variant="secondary" className="rounded-lg">
                        {assignment.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Admin Positions */}
          {adminPositions.length > 0 && (
            <>
              <div>
                <h3 className="text-slate-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Administrative Positions
                </h3>
                <div className="space-y-2">
                  {adminPositions.map(position => (
                    <div
                      key={position.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60"
                    >
                      <span className="text-slate-700">{position.title}</span>
                      <Badge className="rounded-lg">{position.term}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Training Completions */}
          {trainingCompletions.length > 0 && (
            <>
              <div>
                <h3 className="text-slate-900 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Training Completions
                </h3>
                <div className="space-y-2">
                  {trainingCompletions.map(completion => (
                    <div
                      key={completion.id}
                      className="p-3 border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-900">
                          {completion.training?.name}
                        </span>
                        {completion.certified && (
                          <Badge className="rounded-lg bg-green-500">
                            Certified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-slate-600">
                        <span>
                          Completed:{" "}
                          {new Date(
                            completion.completedDate,
                          ).toLocaleDateString()}
                        </span>
                        {completion.score && (
                          <span>Score: {completion.score}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Attendance History */}
          <div>
            <h3 className="text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Attendance
            </h3>
            {attendanceHistory.length === 0 ? (
              <p className="text-slate-500">No attendance records</p>
            ) : (
              <div className="space-y-2">
                {attendanceHistory.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="secondary" className="rounded-lg">
                      {record.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
