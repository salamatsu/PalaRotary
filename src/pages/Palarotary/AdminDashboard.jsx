import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
  ScanOutlined,
  BarChartOutlined,
  DownloadOutlined,
  RiseOutlined,
  FallOutlined,
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
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
  useAdminDashboard,
  useAttendanceStats,
  useAdvancedAnalytics,
} from "../../services/requests/usePalarotary";

const COLORS = ["#52c41a", "#1890ff", "#faad14", "#ff4d4f", "#722ed1"];

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard();
  const { data: attendanceData } = useAttendanceStats();
  const { data: analyticsData, isLoading: analyticsLoading } =
    useAdvancedAnalytics();

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

  const dashboard = data?.data || {};
  const clubs = dashboard.clubs || {};
  const attendance = attendanceData?.data || {};
  const analytics = analyticsData?.data || {};

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
      dataIndex: "club_name",
      key: "club_name",
    },
    {
      title: "Contact Person",
      dataIndex: "contact_person",
      key: "contact_person",
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => {
        const colorMap = {
          pending: "default",
          paid: "processing",
          approved: "success",
          rejected: "error",
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Registered",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const topClubsColumns = [
    {
      title: "Rank",
      key: "rank",
      render: (_, __, index) => (
        <div style={{ fontSize: "16px", fontWeight: "bold" }}>#{index + 1}</div>
      ),
      width: 60,
    },
    {
      title: "Club Name",
      dataIndex: "club_name",
      key: "club_name",
    },
    {
      title: "Zone",
      dataIndex: "zone",
      key: "zone",
    },
    {
      title: "Members",
      dataIndex: "total_members",
      key: "total_members",
    },
    {
      title: "Checked In",
      dataIndex: "checked_in",
      key: "checked_in",
      render: (count) => (
        <Tag color="green" style={{ fontSize: "14px" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Rate",
      dataIndex: "attendance_rate",
      key: "attendance_rate",
      render: (rate) => (
        <div
          style={{
            fontWeight: "bold",
            color: rate >= 75 ? "#52c41a" : rate >= 50 ? "#1890ff" : "#faad14",
          }}
        >
          {rate || 0}%
        </div>
      ),
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
              value={clubs.total || 0}
              prefix={<BankOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Members"
              value={dashboard.total_members || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Event Check-ins"
              value={attendance.checked_in_today || 0}
              prefix={<ScanOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            {/* <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
              {analytics.overview?.total_scans_today || 0} total scans
            </div> */}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Attendance Rate"
              value={attendance.attendance_rate || 0}
              suffix="%"
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
                {/* Hourly Scan Pattern */}
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
                          <span>📊 Hourly Scan Pattern (Today)</span>
                          <Button
                            icon={<DownloadOutlined />}
                            size="small"
                            onClick={() =>
                              exportToCSV(
                                analytics.hourly_scans,
                                "hourly_scans"
                              )
                            }
                          >
                            Export
                          </Button>
                        </div>
                      }
                    >
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics.hourly_scans || []}>
                          <defs>
                            <linearGradient
                              id="colorScans"
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
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="scans"
                            stroke="#52c41a"
                            fillOpacity={1}
                            fill="url(#colorScans)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      {analytics.peak_hours &&
                        analytics.peak_hours.length > 0 && (
                          <div
                            style={{
                              marginTop: "16px",
                              padding: "12px",
                              background: "#f0f2f5",
                              borderRadius: "8px",
                            }}
                          >
                            <strong>Peak Hours:</strong>{" "}
                            {analytics.peak_hours.map((p, i) => (
                              <Tag
                                key={i}
                                color="green"
                                style={{ margin: "4px" }}
                              >
                                {p.time} ({p.count} scans)
                              </Tag>
                            ))}
                          </div>
                        )}
                    </Card>
                  </Col>
                </Row>

                {/* Club Statistics */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Approved Clubs"
                        value={clubs.approved || 0}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Pending Approval"
                        value={(clubs.paid || 0) + (clubs.pending || 0)}
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Total Revenue"
                        value={dashboard.total_revenue || 0}
                        prefix="₱"
                        precision={2}
                        valueStyle={{ color: "#cf1322" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Zones Complete"
                        value={dashboard.zones_complete || 0}
                        prefix={<TrophyOutlined />}
                        suffix={`/ ${dashboard.zone_stats?.length || 0}`}
                        valueStyle={{ color: "#722ed1" }}
                      />
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          marginTop: "8px",
                        }}
                      >
                        Free Lechon for complete zones
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: "leaderboard",
            label: "🏆 Leaderboard",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>🥇 Top 5 Clubs by Attendance</span>
                        <Button
                          icon={<DownloadOutlined />}
                          size="small"
                          onClick={() =>
                            exportToCSV(analytics.top_clubs, "top_clubs")
                          }
                        >
                          Export
                        </Button>
                      </div>
                    }
                  >
                    <Table
                      dataSource={analytics.top_clubs || []}
                      columns={topClubsColumns}
                      pagination={false}
                      size="small"
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>🗺️ Top 5 Zones by Attendance</span>
                        <Button
                          icon={<DownloadOutlined />}
                          size="small"
                          onClick={() =>
                            exportToCSV(analytics.top_zones, "top_zones")
                          }
                        >
                          Export
                        </Button>
                      </div>
                    }
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.top_zones || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="zone" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="checked_in"
                          fill="#52c41a"
                          name="Checked In"
                        />
                        <Bar
                          dataKey="total_members"
                          fill="#1890ff"
                          name="Total Members"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "trends",
            label: "📈 Trends",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="📅 Member Registration Trend (Last 30 Days)">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.registration_trend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#1890ff"
                          strokeWidth={2}
                          name="Registrations"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="📊 Attendance Trend (Last 7 Days)">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.attendance_trend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#52c41a" name="Check-ins" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "participation",
            label: "🎯 Participation",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="📊 Club Participation Breakdown">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.club_participation || []}
                          dataKey="count"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label
                        >
                          {(analytics.club_participation || []).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="📋 Participation Summary">
                    <div style={{ padding: "20px" }}>
                      {(analytics.club_participation || []).map(
                        (item, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px",
                              marginBottom: "8px",
                              background: "#f5f5f5",
                              borderRadius: "8px",
                              borderLeft: `4px solid ${
                                COLORS[index % COLORS.length]
                              }`,
                            }}
                          >
                            <div>
                              <div
                                style={{ fontWeight: "600", fontSize: "16px" }}
                              >
                                {item.category}
                              </div>
                              <div style={{ fontSize: "12px", color: "#999" }}>
                                Clubs in this range
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: "24px",
                                fontWeight: "bold",
                                color: COLORS[index % COLORS.length],
                              }}
                            >
                              {item.count}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: "recent",
            label: "Recent Activity",
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                  <Card
                    title="Recent Club Registrations"
                    extra={<a href="/admin/palarotary/clubs">View All</a>}
                  >
                    <Table
                      dataSource={dashboard.recent_clubs || []}
                      columns={recentClubsColumns}
                      pagination={false}
                      rowKey="id"
                      size="small"
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card
                    title="Recent Member Registrations"
                    extra={<a href="/admin/palarotary/members">View All</a>}
                  >
                    <Table
                      dataSource={(dashboard.recent_members || []).map((m) => ({
                        ...m,
                        name: `${m.first_name} ${m.last_name}`,
                      }))}
                      columns={[
                        { title: "Name", dataIndex: "name", key: "name" },
                        {
                          title: "Club",
                          dataIndex: "club_name",
                          key: "club_name",
                        },
                        {
                          title: "Date",
                          dataIndex: "created_at",
                          key: "created_at",
                          render: (date) => new Date(date).toLocaleDateString(),
                        },
                      ]}
                      pagination={false}
                      rowKey="id"
                      size="small"
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={8}>
                  <Card
                    title="Recent Check-ins"
                    extra={<a href="/admin/palarotary/scanner">Scanner</a>}
                  >
                    <Table
                      dataSource={attendance.recent_scans?.slice(0, 5) || []}
                      columns={[
                        {
                          title: "Name",
                          dataIndex: "member_name",
                          key: "member_name",
                        },
                        {
                          title: "Club",
                          dataIndex: "club_name",
                          key: "club_name",
                        },
                        {
                          title: "Time",
                          dataIndex: "scanned_at",
                          key: "scanned_at",
                          render: (date) => new Date(date).toLocaleTimeString(),
                        },
                      ]}
                      pagination={false}
                      rowKey="id"
                      size="small"
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
