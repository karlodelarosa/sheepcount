"use client";

import { useState } from "react";
// Import UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, MapPin, Calendar, Clock, Users, Home, Plus } from "lucide-react";
// Import Mock Data
import { mockBibleStudyGroups as initialGroups, mockBibleStudyMembers as initialMembers, mockPeople, mockHouseholds } from "@/components/mock-data";
// Import New Components
import { AddBibleStudyGroupDialog } from "./_components/add-bible-group-dialog";
import { ManageMembersDialog } from "./_components/manage-member-dialog";


// Define types for clarity (You should define these in a separate types file)
type BibleStudyGroup = typeof initialGroups[0];
type BibleStudyMember = typeof initialMembers[0];
type Person = typeof mockPeople[0];


export function BibleStudyGroupsView() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  // Use state to manage the data so it can be updated by the dialogs
  const [bibleStudyGroups, setBibleStudyGroups] = useState<BibleStudyGroup[]>(initialGroups);
  const [bibleStudyMembers, setBibleStudyMembers] = useState<BibleStudyMember[]>(initialMembers);

  // --- Data Calculations ---
  
  // Get households with active Bible studies
  const householdsWithBibleStudy = new Set(bibleStudyGroups.map(g => g.householdId));
  
  const selectedGroupData = selectedGroup 
    ? bibleStudyGroups.find(g => g.id === selectedGroup)
    : null;

  const selectedGroupMembers = selectedGroup
    ? bibleStudyMembers
        .filter(m => m.bibleStudyId === selectedGroup)
        .map(m => mockPeople.find(p => p.id === m.personId))
        .filter((m): m is Person => Boolean(m)) // Type guard for clarity
    : [];

  // --- Handlers for Dialogs ---

  const handleAddGroup = (newGroupData: BibleStudyGroup) => {
    // Add the new group to the state
    setBibleStudyGroups(prev => [...prev, newGroupData]);
    // Optionally add the leader as the first member
    setBibleStudyMembers(prev => [...prev, {
        id: Date.now().toString() + "-L",
        bibleStudyId: newGroupData.id,
        personId: newGroupData.leaderId,
        membershipType: "Leader"
    } as BibleStudyMember]);
    setSelectedGroup(newGroupData.id); // Select the new group
  };

  const handleUpdateMembers = (groupId: string, newMemberIds: string[]) => {
    // 1. Filter out all existing members for this group
    const otherGroupMembers = bibleStudyMembers.filter(m => m.bibleStudyId !== groupId);

    // Find the leader and ensure they are included
    const group = bibleStudyGroups.find(g => g.id === groupId);
    const leaderId = group?.leaderId;
    
    // 2. Create new member objects
    const newMembers: BibleStudyMember[] = newMemberIds
        .map(personId => {
            const person = mockPeople.find(p => p.id === personId);
            if (!person) return null;

            return {
                id: `${groupId}-${personId}`, // Simple unique ID
                bibleStudyId: groupId,
                personId: personId,
                membershipType: personId === leaderId ? "Leader" : "Member",
            } as BibleStudyMember;
        })
        .filter((m): m is BibleStudyMember => Boolean(m));

    // 3. Update the state
    setBibleStudyMembers([...otherGroupMembers, ...newMembers]);
  };

  // --- Render ---

  // Safety check for division
  const avgGroupSize = bibleStudyGroups.length > 0 
    ? Math.round(bibleStudyMembers.length / bibleStudyGroups.length) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Bible Study Groups</h1>
          <p className="text-muted-foreground">
            Household-based Bible study groups and their members
          </p>
        </div>
        
        {/* === INTEGRATION: ADD GROUP DIALOG === */}
        <AddBibleStudyGroupDialog onAddGroup={handleAddGroup}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Bible Study Group
          </Button>
        </AddBibleStudyGroupDialog>
      </div>

      {/* --- Statistics --- */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Active Groups</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{bibleStudyGroups.length}</div>
            <p className="text-muted-foreground">Bible study groups</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{bibleStudyMembers.length}</div>
            <p className="text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Host Households</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">{householdsWithBibleStudy.size}</div>
            <p className="text-muted-foreground">Hosting Bible studies</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Avg Group Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-foreground">
              {avgGroupSize}
            </div>
            <p className="text-muted-foreground">Members per group</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Bible Study Groups List --- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3>Bible Study Groups</h3>
          <div className="space-y-3">
            {bibleStudyGroups.map((group) => {
              const memberCount = bibleStudyMembers.filter(
                m => m.bibleStudyId === group.id
              ).length;

              return (
                <Card
                  key={group.id}
                  className={`
                    border-border/60 bg-card/50 backdrop-blur-sm cursor-pointer transition-all duration-200
                    ${selectedGroup === group.id 
                      ? 'ring-2 ring-foreground shadow-lg' 
                      : 'hover:shadow-lg hover:border-border'
                    }
                  `}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                          <Book className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>{group.householdName}</CardTitle>
                          <CardDescription>Led by {group.leaderName}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={group.status === "Active" ? "default" : "secondary"}>
                        {group.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{group.location}</span>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{group.meetingDay}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{group.meetingTime}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Started: {new Date(group.startDate).toLocaleDateString()}</span>
                        <Badge variant="outline">{memberCount} members</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* --- Group Details --- */}
        <div className="space-y-4">
          <h3>Group Details</h3>
          {selectedGroupData ? (
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>{selectedGroupData.householdName}</CardTitle>
                <CardDescription>Bible Study Group Members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {selectedGroupMembers.map((member: Person) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border/60 bg-background/50"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center shadow-sm">
                        <span className="text-white dark:text-slate-900">{member.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">{member.name}</p>
                        <p className="text-muted-foreground">{member.role} - {member.householdName}</p>
                      </div>
                      {/* Find the membership type from the member list */}
                      <Badge variant="outline">
                        {bibleStudyMembers.find(m => m.personId === member.id && m.bibleStudyId === selectedGroup)?.membershipType || 'Member'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border/60">
                  {/* === INTEGRATION: MANAGE MEMBERS DIALOG === */}
                  <ManageMembersDialog 
                    group={selectedGroupData} 
                    currentMembers={selectedGroupMembers}
                    onUpdateMembers={handleUpdateMembers}
                  >
                    <Button className="w-full gap-2">
                      <Users className="w-4 h-4" />
                      Manage Members
                    </Button>
                  </ManageMembersDialog>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a Bible study group to view details and members
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- Households without Bible Studies --- */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Households Without Bible Studies</CardTitle>
          <CardDescription>Consider starting Bible study groups in these households</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {mockHouseholds
              .filter(h => !householdsWithBibleStudy.has(h.id))
              .map(household => (
                <div
                  key={household.id}
                  className="p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Home className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground">{household.name}</p>
                      <p className="text-muted-foreground">{household.address.split(',')[0]}</p>
                    </div>
                  </div>
                  {/* === INTEGRATION: START BIBLE STUDY (Reuses Add Dialog) === */}
                  <AddBibleStudyGroupDialog onAddGroup={handleAddGroup}>
                    <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                      <Plus className="w-3 h-3" />
                      Start Bible Study
                    </Button>
                  </AddBibleStudyGroupDialog>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}