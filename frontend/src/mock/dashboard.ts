export const mockDashboardData = {
  overdueAlert: {
    active: true,
    count: 3,
    message: "3 assets are overdue for return and require follow-up. Please review the pending returns list."
  },
  stats: {
    assetsAvailable: { value: "1,248", trend: "+12 this month", trendDirection: "up" },
    assetsAllocated: { value: "892", trend: "71% allocation rate", trendDirection: "neutral" },
    maintenanceToday: { value: "14", trend: "-3 from yesterday", trendDirection: "down" },
    activeBookings: { value: "45", trend: "8 rooms available", trendDirection: "neutral" },
    pendingTransfers: { value: "12", trend: "4 require approval", trendDirection: "neutral" },
    upcomingReturns: { value: "28", trend: "Next 7 days", trendDirection: "neutral" }
  },
  recentActivities: [
    {
      id: 1,
      type: "allocation",
      assetCode: "AF-0014",
      user: "Priya Shah",
      time: "2 min ago"
    },
    {
      id: 2,
      type: "booking",
      resourceName: "Room B2",
      duration: "2:00 PM to 3:00 PM",
      time: "15 min ago"
    },
    {
      id: 3,
      type: "maintenance",
      assetCode: "AF-0062",
      status: "resolved",
      time: "1 hour ago"
    },
    {
      id: 4,
      type: "transfer",
      assetCode: "AF-0114",
      status: "submitted",
      time: "3 hours ago"
    },
    {
      id: 5,
      type: "audit",
      assetCode: "AF-0238",
      status: "flagged",
      time: "5 hours ago"
    }
  ]
};
