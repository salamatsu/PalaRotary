import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Descriptions,
  Form,
  Image,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { useState } from "react";
import {
  useAdminClubDetails,
  useAdminClubs,
  useApproveClub,
  useRejectClub,
} from "../../services/requests/usePalarotary";

const { TextArea } = Input;

export default function AdminClubs() {
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 20,
  });
  const [selectedClub, setSelectedClub] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectForm] = Form.useForm();

  const { data, isLoading, refetch } = useAdminClubs(filters);
  const approveClub = useApproveClub();
  const rejectClub = useRejectClub();
  const { data: clubDetails, refetch: refetchDetails } = useAdminClubDetails(
    selectedClub?.id,
    detailsModal
  );

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value, page: 1 });
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleApprove = async (clubId) => {
    try {
      await approveClub.mutateAsync(clubId);
      message.success("Club approved successfully!");
      refetch();
      if (detailsModal) {
        refetchDetails();
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to approve club");
    }
  };

  const handleReject = async (values) => {
    try {
      await rejectClub.mutateAsync({
        clubId: selectedClub.id,
        rejectionReason: values.rejection_reason,
      });
      message.success("Club registration rejected");
      setRejectModal(false);
      rejectForm.resetFields();
      refetch();
      if (detailsModal) {
        setDetailsModal(false);
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to reject club");
    }
  };

  const showDetails = (club) => {
    setSelectedClub(club);
    setDetailsModal(true);
  };

  const showRejectModal = (club) => {
    setSelectedClub(club);
    setRejectModal(true);
  };

  const columns = [
    {
      title: "Club Name",
      dataIndex: "club_name",
      key: "club_name",
      fixed: "left",
    },
    {
      title: "Zone",
      dataIndex: "zone",
      key: "zone",
      render: (zone) => zone || "-",
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (method) => method || "-",
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
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetails(record)}
          >
            View
          </Button>
          {record.payment_status === "paid" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={approveClub.isPending}
                size="small"
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => showRejectModal(record)}
                size="small"
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const clubData = data?.data?.clubs || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Club Registrations">
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Input
            placeholder="Search by club name, contact person, or number"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ maxWidth: "400px" }}
            allowClear
          />
          <Select
            placeholder="Filter by status"
            onChange={handleStatusFilter}
            style={{ width: "200px" }}
            allowClear
          >
            <Select.Option value="">All Status</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="paid">Paid (Awaiting Approval)</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </div>

        <Table
          dataSource={clubData}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page) => setFilters({ ...filters, page }),
          }}
        />
      </Card>

      {/* Club Details Modal */}
      <Modal
        title="Club Details"
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={null}
        width={700}
      >
        {clubDetails?.club && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Club Name">
                {clubDetails.club.club_name}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Person">
                {clubDetails.club.contact_person}
              </Descriptions.Item>
              <Descriptions.Item label="Contact Number">
                {clubDetails.club.contact_number}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {clubDetails.club.email}
              </Descriptions.Item>
              <Descriptions.Item label="Zone">
                {clubDetails.club.zone || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {clubDetails.club.payment_method || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Fee">
                ₱{clubDetails.club.registration_fee?.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    clubDetails.club.payment_status === "approved"
                      ? "success"
                      : clubDetails.club.payment_status === "paid"
                      ? "processing"
                      : clubDetails.club.payment_status === "rejected"
                      ? "error"
                      : "default"
                  }
                >
                  {clubDetails.club.payment_status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Registered Members">
                {clubDetails.member_count || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Registered On">
                {new Date(clubDetails.club.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {clubDetails.club.proof_of_payment_url && (
              <div style={{ marginTop: "16px" }}>
                <h4>Proof of Payment</h4>
                <Image
                  src={`${import.meta.env.VITE_BASEURL}${
                    clubDetails.club.proof_of_payment_url
                  }`}
                  alt="Proof of Payment"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            )}

            {clubDetails.club.rejection_reason && (
              <div style={{ marginTop: "16px" }}>
                <h4>Rejection Reason</h4>
                <p
                  style={{
                    padding: "12px",
                    background: "#fff1f0",
                    border: "1px solid #ffccc7",
                    borderRadius: "4px",
                  }}
                >
                  {clubDetails.club.rejection_reason}
                </p>
              </div>
            )}

            {clubDetails.club.payment_status === "paid" && (
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(clubDetails.club.id)}
                  loading={approveClub.isPending}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                  Approve Club
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setDetailsModal(false);
                    showRejectModal(clubDetails.club);
                  }}
                >
                  Reject Club
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Club Registration"
        open={rejectModal}
        onCancel={() => {
          setRejectModal(false);
          rejectForm.resetFields();
        }}
        footer={null}
      >
        <Form form={rejectForm} onFinish={handleReject} layout="vertical">
          <p>
            Club: <strong>{selectedClub?.club_name}</strong>
          </p>
          <Form.Item
            label="Rejection Reason"
            name="rejection_reason"
            rules={[
              {
                required: true,
                message: "Please provide a reason for rejection",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why this club registration is being rejected..."
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setRejectModal(false);
                  rejectForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={rejectClub.isPending}
              >
                Reject Club
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
