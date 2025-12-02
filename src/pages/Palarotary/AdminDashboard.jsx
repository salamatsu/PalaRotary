import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  ScanOutlined,
  BarChartOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Card,
  Col,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Button,
  Tabs,
} from "antd";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  useGetAdminDashboardOverviewApi,
  useGetAdminDashboardClubsDetailedApi,
  useGetAdminDashboardAttendeesApi,
  useGetAdminDashboardDailyRegistrationsApi,
} from "../../services/requests/usePalarotary";

export default function AdminDashboard() {
  const {
    data: overview,
    isLoading,
    error,
  } = useGetAdminDashboardOverviewApi();
  const { data: clubsData } = useGetAdminDashboardClubsDetailedApi({
    page: 1,
    limit: 10,
    status: "ALL",
  });
  const { data: attendeesData } = useGetAdminDashboardAttendeesApi({
    page: 1,
    limit: 10,
  });
  const { data: dailyRegistrations, isLoading: analyticsLoading } =
    useGetAdminDashboardDailyRegistrationsApi({ days: 30 });

  if (isLoading || analyticsLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  const dashboard = overview || {};
  const clubs = clubsData?.clubs || [];
  const attendees = attendeesData?.attendees || [];
  const analytics = dailyRegistrations || {};

  // Map API response to component data
  const clubStats = {
    total: dashboard.clubs?.total || 0,
    approved: parseInt(dashboard.clubs?.approved || 0),
    pending: parseInt(dashboard.clubs?.pending || 0),
    rejected: parseInt(dashboard.clubs?.rejected || 0),
  };

  const attendanceStats = {
    total: dashboard.attendees?.total || 0,
    clubsWithAttendees: dashboard.attendees?.clubsWithAttendees || 0,
    recent_scans: attendees,
  };

  const registrationStats = {
    today: dashboard.dailyRegistrations?.today || 0,
    totalAttendees: analytics.totals?.totalAttendees || 0,
    totalNewClubs: analytics.totals?.totalNewClubs || 0,
    dailyBreakdown: analytics.dailyBreakdown || [],
    period: analytics.period || {},
  };

  const exportToCSV = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(","));
    return [headers, ...rows].join("\n");
  };

  const recentClubsColumns = [
    {
      title: "Club Name",
      dataIndex: "clubName",
      key: "clubName",
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Payment Channel",
      dataIndex: ["transaction", "paymentChannel"],
      key: "paymentChannel",
      render: (_, record) => record.transaction?.paymentChannel || "-",
    },
    {
      title: "Amount",
      dataIndex: ["transaction", "amount"],
      key: "amount",
      render: (_, record) =>
        record.transaction?.amount
          ? `₱${parseFloat(record.transaction.amount).toFixed(2)}`
          : "-",
    },
    {
      title: "Status",
      dataIndex: ["transaction", "status"],
      key: "status",
      render: (_, record) => {
        const status = record.transaction?.status;
        const colorMap = {
          PENDING: "processing",
          APPROVED: "success",
          REJECTED: "error",
        };
        return status ? (
          <Tag color={colorMap[status]}>{status}</Tag>
        ) : (
          <Tag>NO PAYMENT</Tag>
        );
      },
    },
    {
      title: "Attendees",
      dataIndex: "attendeeCount",
      key: "attendeeCount",
      render: (count) => count || 0,
    },
    {
      title: "Registered",
      dataIndex: "registeredAt",
      key: "registeredAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "8px", color: "#1E3A71" }}>
          PALAROTARY 2026 - Analytics Dashboard
        </h1>
        <p style={{ color: "#666" }}>
          January 25, 2026 | Marikina Sports Center | Comprehensive Event
          Analytics
        </p>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Clubs"
              value={clubStats.total}
              prefix={<BankOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Attendees"
              value={attendanceStats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Clubs with Attendees"
              value={attendanceStats.clubsWithAttendees}
              prefix={<ScanOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Registrations Today"
              value={registrationStats.today}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#1E3A71" }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <>
                {/* Daily Registrations Pattern */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col xs={24}>
                    <Card
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>
                            📊 Daily Registration Trend (Last{" "}
                            {registrationStats.period?.days || 30} Days)
                          </span>
                          <Button
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={() =>
                              exportToCSV(
                                registrationStats.dailyBreakdown,
                                "daily_registrations"
                              )
                            }
                          >
                            Export
                          </Button>
                        </div>
                      }
                    >
                      <div style={{ marginBottom: "16px" }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Card size="small">
                              <Statistic
                                title="Total Attendees"
                                value={registrationStats.totalAttendees}
                                prefix={<TeamOutlined />}
                                valueStyle={{ fontSize: "20px" }}
                              />
                            </Card>
                          </Col>
                          <Col span={12}>
                            <Card size="small">
                              <Statistic
                                title="Total New Clubs"
                                value={registrationStats.totalNewClubs}
                                prefix={<BankOutlined />}
                                valueStyle={{ fontSize: "20px" }}
                              />
                            </Card>
                          </Col>
                        </Row>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                          data={registrationStats.dailyBreakdown.map(
                            (item) => ({
                              date: item.date,
                              attendees: item.attendees?.total || 0,
                              newClubs: item.newClubs || 0,
                            })
                          )}
                        >
                          <defs>
                            <linearGradient
                              id="colorAttendees"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#1890ff"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#1890ff"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorClubs"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#52c41a"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#52c41a"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="attendees"
                            stroke="#1890ff"
                            fillOpacity={1}
                            fill="url(#colorAttendees)"
                            name="Attendees"
                          />
                          <Area
                            type="monotone"
                            dataKey="newClubs"
                            stroke="#52c41a"
                            fillOpacity={1}
                            fill="url(#colorClubs)"
                            name="New Clubs"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>

                {/* Club Statistics */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={12} lg={8}>
                    <Card>
                      <Statistic
                        title="Approved Clubs"
                        value={clubStats.approved}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Card>
                      <Statistic
                        title="Pending Approval"
                        value={clubStats.pending}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={8}>
                    <Card>
                      <Statistic
                        title="Rejected Clubs"
                        value={clubStats.rejected}
                        prefix={<TrophyOutlined />}
                        valueStyle={{ color: "#ff4d4f" }}
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: "clubs",
            label: "🏆 Clubs",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Card
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>Registered Clubs</span>
                        <Button
                          icon={<DownloadOutlined />}
                          size="small"
                          onClick={() => exportToCSV(clubs, "clubs")}
                        >
                          Export
                        </Button>
                      </div>
                    }
                  >
                    <Table
                      dataSource={clubs}
                      columns={recentClubsColumns}
                      rowKey="clubId"
                      pagination={{ pageSize: 10 }}
                      size="small"
                      scroll={{ x: 1200 }}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "attendees",
            label: "📈 Attendees",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Card
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>📅 Registered Attendees</span>
                        <Button
                          icon={<DownloadOutlined />}
                          size="small"
                          onClick={() =>
                            exportToCSV(
                              attendanceStats.recent_scans,
                              "attendees"
                            )
                          }
                        >
                          Export
                        </Button>
                      </div>
                    }
                  >
                    <Table
                      dataSource={attendanceStats.recent_scans}
                      columns={[
                        {
                          title: "Name",
                          dataIndex: "fullName",
                          key: "fullName",
                        },
                        {
                          title: "Last Name",
                          dataIndex: "lastName",
                          key: "lastName",
                        },
                        {
                          title: "Email",
                          dataIndex: "email",
                          key: "email",
                        },
                        {
                          title: "Club",
                          dataIndex: "clubName",
                          key: "clubName",
                        },
                        {
                          title: "Registered As",
                          dataIndex: "registerAs",
                          key: "registerAs",
                          render: (type) => (
                            <Tag color={type === "MEMBER" ? "blue" : "green"}>
                              {type}
                            </Tag>
                          ),
                        },
                        {
                          title: "Registered Date",
                          dataIndex: "registeredAt",
                          key: "registeredAt",
                          render: (date) =>
                            date ? new Date(date).toLocaleDateString() : "-",
                        },
                      ]}
                      rowKey={(record) => record.visitorId || record.email}
                      pagination={{ pageSize: 10 }}
                      size="small"
                      scroll={{ x: 1000 }}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />
    </div>
  );
}
