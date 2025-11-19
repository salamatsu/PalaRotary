import {
  DeleteOutlined,
  EyeOutlined,
  QrcodeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
} from "antd";
import { useState } from "react";
import {
  useAdminClubs,
  useAdminMembers,
  useDeleteMember,
} from "../../services/requests/usePalarotary";

export default function AdminMembers() {
  const [filters, setFilters] = useState({
    club_id: "",
    search: "",
    page: 1,
    limit: 50,
  });
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const { data, isLoading, refetch } = useAdminMembers(filters);
  const { data: clubsData } = useAdminClubs({ status: "approved" });
  const deleteMember = useDeleteMember();

  const clubs = clubsData?.data?.clubs || [];

  const handleClubFilter = (value) => {
    setFilters({ ...filters, club_id: value, page: 1 });
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleDelete = (member) => {
    Modal.confirm({
      title: "Delete Member",
      content: `Are you sure you want to delete ${member.first_name} ${member.last_name}?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteMember.mutateAsync(member.id);
          message.success("Member deleted successfully");
          refetch();
        } catch (error) {
          message.error(
            error.response?.data?.message || "Failed to delete member"
          );
        }
      },
    });
  };

  const showDetails = (member) => {
    setSelectedMember(member);
    setDetailsModal(true);
  };

  const columns = [
    {
      title: "Badge Number",
      dataIndex: "badge_number",
      key: "badge_number",
      fixed: "left",
      width: 150,
    },
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Contact Number",
      dataIndex: "contact_number",
      key: "contact_number",
    },
    {
      title: "Club",
      dataIndex: "club_name",
      key: "club_name",
    },
    {
      title: "Zone",
      dataIndex: "zone",
      key: "zone",
      render: (zone) => zone || "-",
    },
    {
      title: "Attendance",
      dataIndex: "has_attended",
      key: "has_attended",
      width: 120,
      render: (hasAttended, record) => (
        <Space>
          {hasAttended ? (
            <>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              <span style={{ color: "#52c41a" }}>Checked In</span>
            </>
          ) : (
            <>
              <ClockCircleOutlined style={{ color: "#d9d9d9" }} />
              <span style={{ color: "#999" }}>Not Yet</span>
            </>
          )}
        </Space>
      ),
    },
    {
      title: "Registered",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
          >
            View
          </Button>
          <Button
            danger
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const memberData = data?.data?.members || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Member Registrations">
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Input
            placeholder="Search by name, email, badge number"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ maxWidth: "400px" }}
            allowClear
          />
          <Select
            placeholder="Filter by club"
            onChange={handleClubFilter}
            style={{ width: "250px" }}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {clubs.map((club) => (
              <Select.Option key={club.id} value={club.id}>
                {club.club_name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <Table
          dataSource={memberData}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setFilters({ ...filters, page }),
            showSizeChanger: true,
            pageSizeOptions: ["20", "50", "100"],
            onShowSizeChange: (_, size) =>
              setFilters({ ...filters, limit: size, page: 1 }),
          }}
        />
      </Card>

      {/* Member Details Modal */}
      <Modal
        title="Member Details"
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={null}
        width={600}
      >
        {selectedMember && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Badge Number">
                <strong>{selectedMember.badge_number}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="First Name">
                {selectedMember.first_name}
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                {selectedMember.last_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedMember.email}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Number">
                {selectedMember.contact_number}
              </Descriptions.Item>
              <Descriptions.Item label="Callsign">
                {selectedMember.callsign || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Position">
                {selectedMember.position || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Club">
                {selectedMember.club_name}
              </Descriptions.Item>
              <Descriptions.Item label="Zone">
                {selectedMember.zone || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Badge Generated">
                {selectedMember.badge_generated ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Badge Sent via Email">
                {selectedMember.badge_sent ? "Yes" : "No"}
              </Descriptions.Item>
              <Descriptions.Item label="Registered On">
                {new Date(selectedMember.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Event Attendance">
                {selectedMember.has_attended ? (
                  <span style={{ color: "#52c41a" }}>
                    <CheckCircleOutlined /> Checked In Today
                  </span>
                ) : (
                  <span style={{ color: "#999" }}>
                    <ClockCircleOutlined /> Not Yet Checked In
                  </span>
                )}
              </Descriptions.Item>
              {selectedMember.last_check_in && (
                <Descriptions.Item label="Last Check-in Time">
                  {new Date(selectedMember.last_check_in).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedMember.qr_code_url && (
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <h4>
                  <QrcodeOutlined /> QR Code Badge
                </h4>
                <img
                  src={`${import.meta.env.VITE_BASEURL}${
                    selectedMember.qr_code_url
                  }`}
                  alt="QR Code Badge"
                  style={{
                    maxWidth: "300px",
                    border: "1px solid #f0f0f0",
                    padding: "16px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDetailsModal(false);
                  handleDelete(selectedMember);
                }}
              >
                Delete Member
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
