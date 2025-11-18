import {
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Alert, Card, Col, Row, Spin, Statistic, Table, Tag } from "antd";
import { useAdminDashboard } from "../../services/requests/usePalarotary";

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
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

  const recentMembersColumns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: "Club",
      dataIndex: "club_name",
      key: "club_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Registered",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
          PALAROTARY 2025 Dashboard
        </h1>
        <p style={{ color: "#666" }}>
          January 25, 2026 | Marikina Sports Center
        </p>
      </div>

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
              title="Total Members"
              value={dashboard.total_members || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
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
        <Col xs={24} lg={12}>
          <Card>
            <Statistic
              title="Zones with Complete Payment"
              value={dashboard.zones_complete || 0}
              prefix={<TrophyOutlined />}
              suffix={`/ ${dashboard.zone_stats?.length || 0}`}
              valueStyle={{ color: "#722ed1" }}
            />
            <p
              style={{
                fontSize: "12px",
                color: "#666",
                marginTop: "8px",
                marginBottom: 0,
              }}
            >
              Free Lechon for complete zones!
            </p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Recent Club Registrations"
            extra={<a href="/admin/clubs">View All</a>}
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
        <Col xs={24} lg={12}>
          <Card
            title="Recent Member Registrations"
            extra={<a href="/admin/members">View All</a>}
          >
            <Table
              dataSource={dashboard.recent_members || []}
              columns={recentMembersColumns}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
