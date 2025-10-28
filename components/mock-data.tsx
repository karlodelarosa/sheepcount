export const mockPeople = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Head",
    householdId: "h1",
    householdName: "Johnson Family",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    age: 42,
    joinDate: "2023-01-15",
    status: "Active",
    membershipType: "Worker",
    evangelismStage: "Worker", // New field for evangelism journey
    lastAttendance: "2024-10-20"
  },
  {
    id: "2",
    name: "Michael Johnson",
    role: "Spouse",
    householdId: "h1",
    householdName: "Johnson Family",
    email: "michael.j@email.com",
    phone: "(555) 123-4567",
    age: 44,
    joinDate: "2023-01-15",
    status: "Active",
    membershipType: "Worker",
    evangelismStage: "Worker",
    lastAttendance: "2024-10-20"
  },
  {
    id: "3",
    name: "Emma Johnson",
    role: "Child",
    householdId: "h1",
    householdName: "Johnson Family",
    email: "",
    phone: "",
    age: 12,
    joinDate: "2023-01-15",
    status: "Active",
    membershipType: "Member",
    evangelismStage: "Discipleship",
    lastAttendance: "2024-10-20"
  },
  {
    id: "4",
    name: "David Martinez",
    role: "Head",
    householdId: "h2",
    householdName: "Martinez Family",
    email: "d.martinez@email.com",
    phone: "(555) 234-5678",
    age: 38,
    joinDate: "2023-03-20",
    status: "Active",
    membershipType: "Member",
    evangelismStage: "Small Group",
    lastAttendance: "2024-10-20"
  },
  {
    id: "5",
    name: "Lisa Martinez",
    role: "Spouse",
    householdId: "h2",
    householdName: "Martinez Family",
    email: "lisa.m@email.com",
    phone: "(555) 234-5678",
    age: 36,
    joinDate: "2023-03-20",
    status: "Active",
    membershipType: "Worker",
    evangelismStage: "Worker",
    lastAttendance: "2024-10-20"
  },
  {
    id: "6",
    name: "James Wilson",
    role: "Head",
    householdId: "h3",
    householdName: "Wilson Household",
    email: "james.w@email.com",
    phone: "(555) 345-6789",
    age: 52,
    joinDate: "2022-11-10",
    status: "Active",
    membershipType: "Worker",
    evangelismStage: "Worker",
    lastAttendance: "2024-10-20"
  },
  {
    id: "7",
    name: "Patricia Wilson",
    role: "Spouse",
    householdId: "h3",
    householdName: "Wilson Household",
    email: "patricia.w@email.com",
    phone: "(555) 345-6789",
    age: 50,
    joinDate: "2022-11-10",
    status: "Active",
    membershipType: "Worker",
    evangelismStage: "Worker",
    lastAttendance: "2024-10-20"
  },
  {
    id: "8",
    name: "Robert Chen",
    role: "Head",
    householdId: "h4",
    householdName: "Chen Family",
    email: "robert.chen@email.com",
    phone: "(555) 456-7890",
    age: 35,
    joinDate: "2024-01-05",
    status: "Active",
    membershipType: "Worker",
    evangelismStage: "Worker",
    lastAttendance: "2024-10-20"
  },
  {
    id: "9",
    name: "Jennifer Anderson",
    role: "Single",
    householdId: "h5",
    householdName: "Anderson",
    email: "jen.anderson@email.com",
    phone: "(555) 567-8901",
    age: 29,
    joinDate: "2024-02-14",
    status: "Inactive",
    membershipType: "Member",
    evangelismStage: "Follow-up",
    lastAttendance: "2024-08-15"
  },
  {
    id: "10",
    name: "Thomas Brown",
    role: "Head",
    householdId: "h6",
    householdName: "Brown Family",
    email: "tom.brown@email.com",
    phone: "(555) 678-9012",
    age: 47,
    joinDate: "2023-06-22",
    status: "Active",
    membershipType: "Worker",
    evangelismStage: "Worker",
    lastAttendance: "2024-10-20"
  },
  {
    id: "11",
    name: "Emily Davis",
    role: "Child",
    householdId: "h6",
    householdName: "Brown Family",
    email: "",
    phone: "",
    age: 14,
    joinDate: "2023-06-22",
    status: "Active",
    membershipType: "Member",
    evangelismStage: "Discipleship",
    lastAttendance: "2024-10-20"
  },
  {
    id: "12",
    name: "Mark Thompson",
    role: "Single",
    householdId: "h7",
    householdName: "Thompson",
    email: "mark.t@email.com",
    phone: "(555) 789-0123",
    age: 27,
    joinDate: "2024-09-10",
    status: "Active",
    membershipType: "Attender",
    evangelismStage: "First-time Attendee",
    lastAttendance: "2024-10-20"
  },
  {
    id: "13",
    name: "Rachel Green",
    role: "Single",
    householdId: "h8",
    householdName: "Green",
    email: "rachel.g@email.com",
    phone: "(555) 890-1234",
    age: 31,
    joinDate: "2024-08-15",
    status: "Active",
    membershipType: "Attender",
    evangelismStage: "Follow-up",
    lastAttendance: "2024-10-13"
  },
  // New non-member evangelism attendees
  {
    id: "14",
    name: "Alex Rivera",
    role: "Single",
    householdId: "h9",
    householdName: "Rivera",
    email: "alex.r@email.com",
    phone: "(555) 901-2345",
    age: 24,
    joinDate: "2024-10-13",
    status: "Active",
    membershipType: "For Evangelism",
    evangelismStage: "First-time Attendee",
    lastAttendance: "2024-10-13"
  },
  {
    id: "15",
    name: "Sophia Kim",
    role: "Single",
    householdId: "h10",
    householdName: "Kim",
    email: "sophia.k@email.com",
    phone: "(555) 012-3456",
    age: 28,
    joinDate: "2024-10-06",
    status: "Active",
    membershipType: "For Evangelism",
    evangelismStage: "Follow-up",
    lastAttendance: "2024-10-20"
  }
];

// Generate attendance records for the last 30 days
const generateAttendance = () => {
  const records = [];
  const types = ["Service", "Meeting", "Event", "Class"];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random number of people attend each day (3-8 people)
    const attendeeCount = Math.floor(Math.random() * 6) + 3;
    const selectedPeople = [...mockPeople]
      .sort(() => Math.random() - 0.5)
      .slice(0, attendeeCount);
    
    selectedPeople.forEach((person, idx) => {
      records.push({
        id: `a${i}-${idx}`,
        personId: person.id,
        date: date.toISOString().split('T')[0],
        type: types[Math.floor(Math.random() * types.length)]
      });
    });
  }
  
  return records;
};

export const mockAttendance = generateAttendance();

// Households
export const mockHouseholds = [
  { id: "h1", name: "Johnson Family", address: "123 Oak Street, Springfield, IL 62701", createdDate: "2023-01-15" },
  { id: "h2", name: "Martinez Family", address: "456 Maple Ave, Springfield, IL 62702", createdDate: "2023-03-20" },
  { id: "h3", name: "Wilson Household", address: "789 Pine Road, Springfield, IL 62703", createdDate: "2022-11-10" },
  { id: "h4", name: "Chen Family", address: "321 Elm Street, Springfield, IL 62704", createdDate: "2024-01-05" },
  { id: "h5", name: "Anderson", address: "654 Birch Lane, Springfield, IL 62705", createdDate: "2024-02-14" },
  { id: "h6", name: "Brown Family", address: "987 Cedar Court, Springfield, IL 62706", createdDate: "2023-06-22" },
  { id: "h7", name: "Thompson", address: "246 Ash Street, Springfield, IL 62707", createdDate: "2024-09-10" },
  { id: "h8", name: "Green", address: "135 Willow Road, Springfield, IL 62708", createdDate: "2024-08-15" },
  { id: "h9", name: "Rivera", address: "579 Oakwood Lane, Springfield, IL 62709", createdDate: "2024-10-13" },
  { id: "h10", name: "Kim", address: "864 Maplewood Street, Springfield, IL 62710", createdDate: "2024-10-06" },
];

// Work Ministries (allows multiple assignments per person)
export const mockMinistries = [
  { id: "m1", name: "Worship Team", description: "Music and worship leadership", color: "purple" },
  { id: "m2", name: "Children's Teachers", description: "Sunday school and children's programs", color: "blue" },
  { id: "m3", name: "Youth Ministry Pastor and Leaders", description: "Teen ministry leadership", color: "green" },
  { id: "m4", name: "Hospitality", description: "Greeting and welcoming visitors", color: "orange" },
  { id: "m5", name: "Pastorals", description: "Pastoral care and support", color: "indigo" },
  { id: "m6", name: "Christian Education", description: "Teaching and discipleship programs", color: "cyan" },
  { id: "m7", name: "Outreach", description: "Community service and evangelism", color: "red" },
];

// Ministry Assignments (people can be in multiple ministries)
export const mockMinistryAssignments = [
  { id: "ma1", personId: "1", ministryId: "m2", role: "Team Lead", assignedDate: "2023-02-01" },
  { id: "ma2", personId: "1", ministryId: "m6", role: "Member", assignedDate: "2023-02-01" },
  { id: "ma3", personId: "2", ministryId: "m1", role: "Member", assignedDate: "2023-02-15" },
  { id: "ma4", personId: "4", ministryId: "m7", role: "Coordinator", assignedDate: "2023-04-10" },
  { id: "ma5", personId: "4", ministryId: "m5", role: "Member", assignedDate: "2023-04-10" },
  { id: "ma6", personId: "5", ministryId: "m4", role: "Member", assignedDate: "2023-04-10" },
  { id: "ma7", personId: "6", ministryId: "m1", role: "Team Lead", assignedDate: "2022-12-01" },
  { id: "ma8", personId: "8", ministryId: "m3", role: "Coordinator", assignedDate: "2024-02-01" },
  { id: "ma9", personId: "10", ministryId: "m5", role: "Team Lead", assignedDate: "2023-07-01" },
];

// Admin Positions
export const mockAdminPositions = [
  { id: "ap1", title: "Head Pastor", personId: "6", appointedDate: "2020-01-01", term: "Permanent" },
  { id: "ap2", title: "Secretary", personId: "1", appointedDate: "2023-01-20", term: "2023-2025" },
  { id: "ap3", title: "Treasurer", personId: "6", appointedDate: "2023-01-20", term: "2023-2025" },
  { id: "ap4", title: "Deacon", personId: "4", appointedDate: "2023-06-15", term: "2023-2026" },
  { id: "ap5", title: "Deacon", personId: "10", appointedDate: "2023-06-15", term: "2023-2026" },
  { id: "ap6", title: "Worship Team Lead", personId: "2", appointedDate: "2023-01-20", term: "2023-2025" },
  { id: "ap7", title: "Stewardship Head", personId: "4", appointedDate: "2023-01-20", term: "2023-2025" },
  { id: "ap8", title: "Christian Education Head", personId: "1", appointedDate: "2023-01-20", term: "2023-2025" },
  { id: "ap9", title: "Outreach Coordinator", personId: "5", appointedDate: "2023-01-20", term: "2023-2025" },
];

// Organization Chart Structure
export const mockOrgChart = {
  admin: {
    title: "Admin",
    head: "6", // Head Pastor
    departments: [
      {
        id: "worship",
        name: "Worship Team",
        head: "2",
        subDepartments: [
          {
            id: "production",
            name: "Production Team",
            roles: ["Musician", "Audio Tech", "Lyricist"],
            members: ["2", "8"]
          },
          {
            id: "digital",
            name: "Digital Ministry",
            roles: ["Social Media", "Content Creation", "Presentation and Visuals"],
            members: ["12", "15"]
          },
          {
            id: "worship-others",
            name: "Others",
            roles: ["Choir", "Dancer", "Emcee"],
            members: ["3", "11"]
          }
        ]
      },
      {
        id: "stewardship",
        name: "Stewardship",
        head: "4",
        subDepartments: [
          {
            id: "deacons",
            name: "Deacons",
            roles: ["Deacon"],
            members: ["4", "10"]
          },
          {
            id: "ushering",
            name: "Ushering and Hospitality",
            roles: ["Usher", "Hospitality Team"],
            members: ["5", "7"]
          }
        ]
      },
      {
        id: "christian-education",
        name: "Christian Education",
        head: "1",
        subDepartments: [
          {
            id: "life-groups",
            name: "Life Groups",
            roles: ["Life Group Leaders"],
            members: ["1", "6", "12"]
          },
          {
            id: "teachers",
            name: "Teachers",
            roles: ["Sunday School Teacher", "Bible Study Teacher"],
            members: ["1", "8"]
          }
        ]
      },
      {
        id: "outreach",
        name: "Outreach",
        head: "5",
        subDepartments: []
      }
    ]
  }
};

// Church Goals and Themes
export const mockChurchGoals = {
  yearlyGoal: {
    year: 2024,
    theme: "Building Strong Foundations",
    vision: "To establish a Christ-centered community that transforms lives through worship, discipleship, and outreach. Our goal is to grow deeper in faith, broader in fellowship, and stronger in service.",
    objectives: [
      "Increase active membership by 20%",
      "Launch 5 new small groups",
      "Complete sanctuary renovation project",
      "Expand community outreach programs",
      "Strengthen discipleship through mentorship"
    ]
  },
  monthlyThemes: [
    { month: 1, name: "January", theme: "New Beginnings in Christ", scripture: "2 Corinthians 5:17" },
    { month: 2, name: "February", theme: "Love Without Limits", scripture: "1 Corinthians 13:4-7" },
    { month: 3, name: "March", theme: "Faith and Obedience", scripture: "Hebrews 11:1" },
    { month: 4, name: "April", theme: "The Resurrection Power", scripture: "Romans 6:4" },
    { month: 5, name: "May", theme: "Family and Unity", scripture: "Ephesians 4:3" },
    { month: 6, name: "June", theme: "The Great Commission", scripture: "Matthew 28:19-20" },
    { month: 7, name: "July", theme: "Freedom in Christ", scripture: "Galatians 5:1" },
    { month: 8, name: "August", theme: "Spiritual Gifts and Service", scripture: "1 Peter 4:10" },
    { month: 9, name: "September", theme: "Harvest Time", scripture: "Matthew 9:37-38" },
    { month: 10, name: "October", theme: "Prayer and Intercession", scripture: "1 Thessalonians 5:17" },
    { month: 11, name: "November", theme: "Gratitude and Thanksgiving", scripture: "1 Thessalonians 5:18" },
    { month: 12, name: "December", theme: "Emmanuel - God With Us", scripture: "Matthew 1:23" }
  ]
};

// Training Events
export const mockTrainingEvents = [
  {
    id: "t1",
    name: "Leadership Fundamentals",
    description: "Basic leadership principles and practices",
    date: "2024-03-15",
    duration: "4 hours",
    instructor: "Pastor Williams",
    category: "Leadership"
  },
  {
    id: "t2",
    name: "Child Safety Training",
    description: "Required training for all children's ministry volunteers",
    date: "2024-05-10",
    duration: "2 hours",
    instructor: "Jennifer Brown",
    category: "Safety"
  },
  {
    id: "t3",
    name: "Financial Management",
    description: "Church finance and accounting basics",
    date: "2024-07-20",
    duration: "3 hours",
    instructor: "David Clark",
    category: "Administration"
  },
  {
    id: "t4",
    name: "Worship Leading Workshop",
    description: "Advanced techniques for worship leaders",
    date: "2024-09-05",
    duration: "6 hours",
    instructor: "Sarah Martinez",
    category: "Worship"
  },
];

// Training Completions
export const mockTrainingCompletions = [
  { id: "tc1", personId: "1", trainingId: "t1", completedDate: "2024-03-15", score: "95%", certified: true },
  { id: "tc2", personId: "1", trainingId: "t2", completedDate: "2024-05-10", score: "100%", certified: true },
  { id: "tc3", personId: "2", trainingId: "t1", completedDate: "2024-03-15", score: "88%", certified: true },
  { id: "tc4", personId: "4", trainingId: "t1", completedDate: "2024-03-15", score: "92%", certified: true },
  { id: "tc5", personId: "4", trainingId: "t3", completedDate: "2024-07-20", score: "97%", certified: true },
  { id: "tc6", personId: "6", trainingId: "t3", completedDate: "2024-07-20", score: "100%", certified: true },
  { id: "tc7", personId: "8", trainingId: "t2", completedDate: "2024-05-10", score: "90%", certified: true },
  { id: "tc8", personId: "10", trainingId: "t1", completedDate: "2024-03-15", score: "85%", certified: true },
];

// Life Groups
export const mockLifeGroups = [
  { id: "lg1", name: "Children's Sunday School", description: "Bible lessons for ages 5-12", category: "Children", color: "blue" },
  { id: "lg2", name: "Kids Programs", description: "Special activities and events for children", category: "Children", color: "blue" },
  { id: "lg3", name: "Youth Service", description: "Teen worship and fellowship", category: "Youth", color: "green" },
  { id: "lg4", name: "Young Professional", description: "Career-age adults fellowship", category: "Adults", color: "purple" },
  { id: "lg5", name: "Ladies Fellowship", description: "Women's ministry and support group", category: "Adults", color: "pink" },
  { id: "lg6", name: "Men's Fellowship", description: "Men's ministry and discipleship", category: "Adults", color: "indigo" },
];

// Life Group Members
export const mockLifeGroupMembers = [
  { id: "lgm1", lifeGroupId: "lg1", personId: "3", joinedDate: "2023-02-01" },
  { id: "lgm2", lifeGroupId: "lg3", personId: "3", joinedDate: "2024-01-10" },
  { id: "lgm3", lifeGroupId: "lg4", personId: "9", joinedDate: "2024-03-01" },
  { id: "lgm4", lifeGroupId: "lg5", personId: "1", joinedDate: "2023-02-01" },
  { id: "lgm5", lifeGroupId: "lg5", personId: "5", joinedDate: "2023-04-15" },
  { id: "lgm6", lifeGroupId: "lg5", personId: "7", joinedDate: "2022-12-01" },
  { id: "lgm7", lifeGroupId: "lg6", personId: "2", joinedDate: "2023-02-01" },
  { id: "lgm8", lifeGroupId: "lg6", personId: "4", joinedDate: "2023-04-01" },
  { id: "lgm9", lifeGroupId: "lg6", personId: "6", joinedDate: "2022-12-01" },
  { id: "lgm10", lifeGroupId: "lg6", personId: "10", joinedDate: "2023-07-01" },
];

// Church Properties
export const mockProperties = [
  {
    id: "p1",
    name: "Main Church Building",
    type: "Building",
    address: "100 Church Street, Springfield, IL 62701",
    purchaseDate: "1998-05-15",
    estimatedValue: 2500000,
    status: "Owned",
    notes: "Primary worship facility with 500-seat sanctuary"
  },
  {
    id: "p2",
    name: "Fellowship Hall",
    type: "Building",
    address: "102 Church Street, Springfield, IL 62701",
    purchaseDate: "2005-08-20",
    estimatedValue: 800000,
    status: "Owned",
    notes: "Community events and large gatherings"
  },
  {
    id: "p3",
    name: "Church Van",
    type: "Vehicle",
    address: "N/A",
    purchaseDate: "2020-03-10",
    estimatedValue: 45000,
    status: "Owned",
    notes: "15-passenger van for youth activities"
  },
  {
    id: "p4",
    name: "Parking Lot A",
    type: "Land",
    address: "Adjacent to Main Building",
    purchaseDate: "2010-11-05",
    estimatedValue: 350000,
    status: "Owned",
    notes: "Primary parking with 100 spaces"
  },
];

// Financial Records - Income (Tithes, Offerings, Donations)
export const mockFinancialIncome = [
  { id: "fi1", date: "2024-10-13", type: "Tithes", amount: 12500, category: "Weekly Collection", notes: "" },
  { id: "fi2", date: "2024-10-13", type: "Offering", amount: 3200, category: "Building Fund", notes: "" },
  { id: "fi3", date: "2024-10-06", type: "Tithes", amount: 11800, category: "Weekly Collection", notes: "" },
  { id: "fi4", date: "2024-10-06", type: "Offering", amount: 2800, category: "Missions", notes: "" },
  { id: "fi5", date: "2024-09-29", type: "Tithes", amount: 13200, category: "Weekly Collection", notes: "" },
  { id: "fi6", date: "2024-09-15", type: "Donation", amount: 50000, category: "Building Fund", notes: "Anonymous donor" },
  { id: "fi7", date: "2024-09-01", type: "Donation", amount: 5000, category: "Youth Ministry", notes: "Youth retreat support" },
  { id: "fi8", date: "2024-08-20", type: "Tithes", amount: 14500, category: "Weekly Collection", notes: "" },
];

// Financial Records - Expenses (Where money is spent)
export const mockFinancialExpenses = [
  { id: "fe1", date: "2024-10-15", category: "Utilities", amount: 2500, description: "Electric and water bills", vendor: "City Utilities" },
  { id: "fe2", date: "2024-10-10", category: "Salaries", amount: 15000, description: "Staff salaries", vendor: "Payroll" },
  { id: "fe3", date: "2024-10-08", category: "Building Maintenance", amount: 3500, description: "HVAC repair", vendor: "Climate Control Inc" },
  { id: "fe4", date: "2024-10-05", category: "Ministry Supplies", amount: 850, description: "Children's ministry materials", vendor: "Christian Bookstore" },
  { id: "fe5", date: "2024-10-01", category: "Missions Support", amount: 5000, description: "Monthly missionary support", vendor: "Mission Partners" },
  { id: "fe6", date: "2024-09-28", category: "Insurance", amount: 1200, description: "Property insurance", vendor: "Church Insurance Co" },
  { id: "fe7", date: "2024-09-20", category: "Office Supplies", amount: 450, description: "Printer paper and supplies", vendor: "Office Depot" },
  { id: "fe8", date: "2024-09-15", category: "Building Maintenance", amount: 2800, description: "Landscaping services", vendor: "Green Thumb Services" },
  { id: "fe9", date: "2024-09-10", category: "Technology", amount: 1500, description: "Sound system upgrades", vendor: "Audio Tech Solutions" },
  { id: "fe10", date: "2024-09-05", category: "Youth Ministry", amount: 1200, description: "Youth retreat expenses", vendor: "Camp Facilities" },
];

// Goal Projects
export const mockGoalProjects = [
  {
    id: "gp1",
    name: "New Sanctuary Renovation",
    description: "Complete renovation of main sanctuary including new seating, sound system, and lighting",
    goalAmount: 1000000,
    raisedAmount: 675000,
    startDate: "2024-01-01",
    targetDate: "2025-12-31",
    status: "Active",
    category: "Building"
  },
  {
    id: "gp2",
    name: "Mission Trip to Philippines",
    description: "Support for summer mission trip and outreach programs",
    goalAmount: 35000,
    raisedAmount: 28500,
    startDate: "2024-06-01",
    targetDate: "2025-06-30",
    status: "Active",
    category: "Missions"
  },
  {
    id: "gp3",
    name: "Youth Center Equipment",
    description: "New equipment and resources for youth ministry programs",
    goalAmount: 15000,
    raisedAmount: 15000,
    startDate: "2024-03-01",
    targetDate: "2024-09-30",
    status: "Completed",
    category: "Youth"
  },
];

// Discipleship Programs
export const mockDiscipleshipPrograms = [
  {
    id: "dp1",
    name: "New Believers Class",
    description: "Foundational teachings for new Christians",
    duration: "8 weeks",
    schedule: "Sundays, 9:00 AM",
    leader: "Pastor Johnson",
    category: "Foundation",
    color: "blue"
  },
  {
    id: "dp2",
    name: "Bible Study Groups",
    description: "In-depth study of Scripture in small groups",
    duration: "Ongoing",
    schedule: "Wednesdays, 7:00 PM",
    leader: "Emily Martinez",
    category: "Growth",
    color: "green"
  },
  {
    id: "dp3",
    name: "Leadership Development",
    description: "Training for future church leaders",
    duration: "12 weeks",
    schedule: "Saturdays, 10:00 AM",
    leader: "David Wilson",
    category: "Leadership",
    color: "purple"
  },
  {
    id: "dp4",
    name: "Mentorship Program",
    description: "One-on-one discipleship and spiritual guidance",
    duration: "6 months",
    schedule: "Flexible",
    leader: "Sarah Chen",
    category: "Mentorship",
    color: "pink"
  },
];

// Discipleship Program Participants
export const mockDiscipleshipParticipants = [
  { id: "dpp1", programId: "dp1", personId: "3", enrolledDate: "2024-09-01", status: "Active" },
  { id: "dpp2", programId: "dp1", personId: "9", enrolledDate: "2024-09-01", status: "Active" },
  { id: "dpp3", programId: "dp2", personId: "1", enrolledDate: "2024-01-15", status: "Active" },
  { id: "dpp4", programId: "dp2", personId: "2", enrolledDate: "2024-01-15", status: "Active" },
  { id: "dpp5", programId: "dp2", personId: "4", enrolledDate: "2024-01-15", status: "Active" },
  { id: "dpp6", programId: "dp2", personId: "5", enrolledDate: "2024-02-01", status: "Active" },
  { id: "dpp7", programId: "dp3", personId: "6", enrolledDate: "2024-08-01", status: "Active" },
  { id: "dpp8", programId: "dp3", personId: "8", enrolledDate: "2024-08-01", status: "Active" },
  { id: "dpp9", programId: "dp3", personId: "10", enrolledDate: "2024-08-01", status: "Active" },
  { id: "dpp10", programId: "dp4", personId: "1", enrolledDate: "2024-06-01", status: "Active" },
  { id: "dpp11", programId: "dp4", personId: "7", enrolledDate: "2024-06-15", status: "Active" },
];

// General Programs (Events, Activities, Special Programs)
export const mockPrograms = [
  {
    id: "pr1",
    name: "Summer Vacation Bible School",
    description: "Week-long program for children with Bible stories, crafts, and activities",
    type: "Event",
    startDate: "2024-06-15",
    endDate: "2024-06-19",
    coordinator: "Sarah Martinez",
    category: "Children",
    color: "blue"
  },
  {
    id: "pr2",
    name: "Men's Breakfast Fellowship",
    description: "Monthly breakfast and fellowship for men",
    type: "Recurring",
    startDate: "2024-01-01",
    endDate: null,
    coordinator: "Michael Johnson",
    category: "Adults",
    color: "indigo"
  },
  {
    id: "pr3",
    name: "Women's Retreat 2024",
    description: "Annual women's retreat for spiritual renewal",
    type: "Event",
    startDate: "2024-11-08",
    endDate: "2024-11-10",
    coordinator: "Emily Chen",
    category: "Adults",
    color: "pink"
  },
  {
    id: "pr4",
    name: "Youth Lock-In",
    description: "Overnight event with games, worship, and fellowship",
    type: "Event",
    startDate: "2024-10-25",
    endDate: "2024-10-26",
    coordinator: "David Wilson",
    category: "Youth",
    color: "green"
  },
  {
    id: "pr5",
    name: "Community Outreach Days",
    description: "Monthly community service projects",
    type: "Recurring",
    startDate: "2024-01-01",
    endDate: null,
    coordinator: "Lisa Anderson",
    category: "Outreach",
    color: "orange"
  },
];

// Program Participants
export const mockProgramParticipants = [
  { id: "prp1", programId: "pr1", personId: "3", registeredDate: "2024-06-01" },
  { id: "prp2", programId: "pr1", personId: "11", registeredDate: "2024-06-01" },
  { id: "prp3", programId: "pr2", personId: "2", registeredDate: "2024-01-01" },
  { id: "prp4", programId: "pr2", personId: "4", registeredDate: "2024-01-01" },
  { id: "prp5", programId: "pr2", personId: "6", registeredDate: "2024-01-01" },
  { id: "prp6", programId: "pr2", personId: "10", registeredDate: "2024-01-01" },
  { id: "prp7", programId: "pr3", personId: "1", registeredDate: "2024-10-01" },
  { id: "prp8", programId: "pr3", personId: "5", registeredDate: "2024-10-01" },
  { id: "prp9", programId: "pr3", personId: "7", registeredDate: "2024-10-01" },
  { id: "prp10", programId: "pr4", personId: "3", registeredDate: "2024-10-15" },
  { id: "prp11", programId: "pr4", personId: "8", registeredDate: "2024-10-15" },
  { id: "prp12", programId: "pr5", personId: "4", registeredDate: "2024-01-01" },
  { id: "prp13", programId: "pr5", personId: "5", registeredDate: "2024-01-01" },
];

// Service Types for Attendance Management
export const mockServiceTypes = [
  { id: "st1", name: "Sunday Service", description: "Main worship service", color: "blue" },
  { id: "st2", name: "Sunday School", description: "Bible study and classes", color: "green" },
  { id: "st3", name: "Men's Fellowship", description: "Men's gathering and discipleship", color: "indigo" },
  { id: "st4", name: "Ladies' Fellowship", description: "Women's meeting and fellowship", color: "pink" },
  { id: "st5", name: "Young Professionals Fellowship", description: "YP fellowship and networking", color: "purple" },
  { id: "st6", name: "Prayer Meeting", description: "Corporate prayer gathering", color: "orange" },
];

// Service Attendance Records
export const mockServiceAttendance = [
  // Sunday Service - October 20, 2024
  { id: "sa1", serviceId: "st1", date: "2024-10-20", personId: "1", serviceType: "Sunday Service" },
  { id: "sa2", serviceId: "st1", date: "2024-10-20", personId: "2", serviceType: "Sunday Service" },
  { id: "sa3", serviceId: "st1", date: "2024-10-20", personId: "3", serviceType: "Sunday Service" },
  { id: "sa4", serviceId: "st1", date: "2024-10-20", personId: "5", serviceType: "Sunday Service" },
  { id: "sa5", serviceId: "st1", date: "2024-10-20", personId: "6", serviceType: "Sunday Service" },
  { id: "sa6", serviceId: "st1", date: "2024-10-20", personId: "7", serviceType: "Sunday Service" },
  { id: "sa7", serviceId: "st1", date: "2024-10-20", personId: "8", serviceType: "Sunday Service" },
  { id: "sa8", serviceId: "st1", date: "2024-10-20", personId: "10", serviceType: "Sunday Service" },
  { id: "sa9", serviceId: "st1", date: "2024-10-20", personId: "11", serviceType: "Sunday Service" },
  { id: "sa10", serviceId: "st1", date: "2024-10-20", personId: "12", serviceType: "Sunday Service" },
  { id: "sa11", serviceId: "st1", date: "2024-10-20", personId: "14", serviceType: "Sunday Service" },
  { id: "sa12", serviceId: "st1", date: "2024-10-20", personId: "15", serviceType: "Sunday Service" },
  
  // Sunday School - October 20, 2024
  { id: "sa13", serviceId: "st2", date: "2024-10-20", personId: "1", serviceType: "Sunday School" },
  { id: "sa14", serviceId: "st2", date: "2024-10-20", personId: "3", serviceType: "Sunday School" },
  { id: "sa15", serviceId: "st2", date: "2024-10-20", personId: "11", serviceType: "Sunday School" },
  
  // Prayer Meeting - October 16, 2024
  { id: "sa16", serviceId: "st6", date: "2024-10-16", personId: "1", serviceType: "Prayer Meeting" },
  { id: "sa17", serviceId: "st6", date: "2024-10-16", personId: "2", serviceType: "Prayer Meeting" },
  { id: "sa18", serviceId: "st6", date: "2024-10-16", personId: "4", serviceType: "Prayer Meeting" },
  { id: "sa19", serviceId: "st6", date: "2024-10-16", personId: "6", serviceType: "Prayer Meeting" },
  { id: "sa20", serviceId: "st6", date: "2024-10-16", personId: "10", serviceType: "Prayer Meeting" },
  
  // Sunday Service - October 13, 2024
  { id: "sa21", serviceId: "st1", date: "2024-10-13", personId: "1", serviceType: "Sunday Service" },
  { id: "sa22", serviceId: "st1", date: "2024-10-13", personId: "2", serviceType: "Sunday Service" },
  { id: "sa23", serviceId: "st1", date: "2024-10-13", personId: "5", serviceType: "Sunday Service" },
  { id: "sa24", serviceId: "st1", date: "2024-10-13", personId: "6", serviceType: "Sunday Service" },
  { id: "sa25", serviceId: "st1", date: "2024-10-13", personId: "7", serviceType: "Sunday Service" },
  { id: "sa26", serviceId: "st1", date: "2024-10-13", personId: "8", serviceType: "Sunday Service" },
  { id: "sa27", serviceId: "st1", date: "2024-10-13", personId: "13", serviceType: "Sunday Service" },
  { id: "sa28", serviceId: "st1", date: "2024-10-13", personId: "14", serviceType: "Sunday Service" },
];

// Small Groups (4-5 people with shared interests)
export const mockSmallGroups = [
  { 
    id: "sg1", 
    name: "Young Adults Connect", 
    description: "Professional development and spiritual growth",
    leaderId: "12",
    category: "Young Adults",
    meetingDay: "Thursdays",
    meetingTime: "7:00 PM",
    color: "purple"
  },
  { 
    id: "sg2", 
    name: "Married Couples Fellowship", 
    description: "Building stronger marriages through faith",
    leaderId: "1",
    category: "Families",
    meetingDay: "Fridays",
    meetingTime: "7:30 PM",
    color: "pink"
  },
  { 
    id: "sg3", 
    name: "New Believers Support", 
    description: "Foundation for new Christians",
    leaderId: "6",
    category: "New Believers",
    meetingDay: "Tuesdays",
    meetingTime: "6:30 PM",
    color: "blue"
  },
];

// Small Group Members
export const mockSmallGroupMembers = [
  { id: "sgm1", smallGroupId: "sg1", personId: "12", joinedDate: "2024-09-15" },
  { id: "sgm2", smallGroupId: "sg1", personId: "13", joinedDate: "2024-09-20" },
  { id: "sgm3", smallGroupId: "sg1", personId: "15", joinedDate: "2024-10-10" },
  
  { id: "sgm4", smallGroupId: "sg2", personId: "1", joinedDate: "2024-06-01" },
  { id: "sgm5", smallGroupId: "sg2", personId: "2", joinedDate: "2024-06-01" },
  { id: "sgm6", smallGroupId: "sg2", personId: "4", joinedDate: "2024-06-15" },
  { id: "sgm7", smallGroupId: "sg2", personId: "5", joinedDate: "2024-06-15" },
  
  { id: "sgm8", smallGroupId: "sg3", personId: "6", joinedDate: "2024-08-01" },
  { id: "sgm9", smallGroupId: "sg3", personId: "14", joinedDate: "2024-10-15" },
];

// Bible Study Groups (Household-based)
export const mockBibleStudyGroups = [
  {
    id: "bsg1",
    householdId: "h1",
    householdName: "Johnson Family",
    leaderId: "1",
    leaderName: "Sarah Johnson",
    location: "123 Oak Street, Springfield, IL 62701",
    meetingDay: "Wednesdays",
    meetingTime: "7:00 PM",
    status: "Active",
    startDate: "2024-01-10"
  },
  {
    id: "bsg2",
    householdId: "h3",
    householdName: "Wilson Household",
    leaderId: "6",
    leaderName: "James Wilson",
    location: "789 Pine Road, Springfield, IL 62703",
    meetingDay: "Thursdays",
    meetingTime: "7:30 PM",
    status: "Active",
    startDate: "2023-11-15"
  },
  {
    id: "bsg3",
    householdId: "h6",
    householdName: "Brown Family",
    leaderId: "10",
    leaderName: "Thomas Brown",
    location: "987 Cedar Court, Springfield, IL 62706",
    meetingDay: "Tuesdays",
    meetingTime: "6:30 PM",
    status: "Active",
    startDate: "2024-06-25"
  },
];

// Bible Study Group Members
export const mockBibleStudyMembers = [
  { id: "bsm1", bibleStudyId: "bsg1", personId: "1", joinedDate: "2024-01-10" },
  { id: "bsm2", bibleStudyId: "bsg1", personId: "2", joinedDate: "2024-01-10" },
  { id: "bsm3", bibleStudyId: "bsg1", personId: "4", joinedDate: "2024-02-05" },
  { id: "bsm4", bibleStudyId: "bsg1", personId: "5", joinedDate: "2024-02-05" },
  { id: "bsm5", bibleStudyId: "bsg1", personId: "8", joinedDate: "2024-03-01" },
  
  { id: "bsm6", bibleStudyId: "bsg2", personId: "6", joinedDate: "2023-11-15" },
  { id: "bsm7", bibleStudyId: "bsg2", personId: "7", joinedDate: "2023-11-15" },
  { id: "bsm8", bibleStudyId: "bsg2", personId: "9", joinedDate: "2024-03-10" },
  
  { id: "bsm9", bibleStudyId: "bsg3", personId: "10", joinedDate: "2024-06-25" },
  { id: "bsm10", bibleStudyId: "bsg3", personId: "12", joinedDate: "2024-09-15" },
  { id: "bsm11", bibleStudyId: "bsg3", personId: "13", joinedDate: "2024-09-20" },
];