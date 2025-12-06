import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  HistoryOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  PercentageOutlined,
  BarChartOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  Timeline,
  Progress,
} from "antd";
import { useMemo, useState } from "react";
import { Table } from "ant-table-extensions";

import {
  useGetAdminTransactionsApi,
  useToggleClubVerificationAdminTransactionsApi,
  useUpdateAdminTransactionsApi,
} from "../../services/requests/usePalarotary";
import { BarChart3 } from "lucide-react";

const { TextArea } = Input;

const AdminTransactions = () => {
  const { modal, message } = App.useApp();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [clubFilter, setClubFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [rejectForm] = Form.useForm();

  const { data, isLoading, refetch } = useGetAdminTransactionsApi({
    status: "ALL",
  });

  const updateAdminTransactionsApi = useUpdateAdminTransactionsApi();
  const toggleClubVerificationAdminTransactionsApi =
    useToggleClubVerificationAdminTransactionsApi();

  // Memoized filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    const transactions = data?.transactions || [];

    // Filter by status
    let filtered = transactions;
    if (statusFilter !== "ALL") {
      filtered = transactions.filter((t) => t.status === statusFilter);
    }

    // Filter by zone
    if (zoneFilter !== "ALL") {
      filtered = filtered.filter((t) => t.zone === zoneFilter);
    }

    // Filter by club
    if (clubFilter !== "ALL") {
      filtered = filtered.filter((t) => t.clubName === clubFilter);
    }

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.clubName?.toLowerCase().includes(search) ||
          t.zone?.toLowerCase().includes(search) ||
          t.transactionNumber?.toLowerCase().includes(search) ||
          t.area?.toLowerCase().includes(search)
      );
    }

    // Sort by zone then club name
    return filtered.sort((a, b) => {
      const zoneA = a.zone || "";
      const zoneB = b.zone || "";
      const clubA = a.clubName || "";
      const clubB = b.clubName || "";

      if (zoneA === zoneB) {
        return clubA.localeCompare(clubB);
      }
      return zoneA.localeCompare(zoneB);
    });
  }, [data?.transactions, statusFilter, zoneFilter, clubFilter, searchText]);

  // Get unique zones and clubs for filters
  const { zones, clubs } = useMemo(() => {
    const transactions = data?.transactions || [];
    const uniqueZones = [
      ...new Set(transactions.map((t) => t.zone).filter(Boolean)),
    ].sort();
    const uniqueClubs = [
      ...new Set(transactions.map((t) => t.clubName).filter(Boolean)),
    ].sort();

    return {
      zones: uniqueZones,
      clubs: uniqueClubs,
    };
  }, [data?.transactions]);

  // Status counts for quick filters
  const statusCounts = useMemo(() => {
    const transactions = data?.transactions || [];
    return {
      ALL: transactions.length,
      PENDING: transactions.filter((t) => t.status === "PENDING").length,
      APPROVED: transactions.filter((t) => t.status === "APPROVED").length,
      REJECTED: transactions.filter((t) => t.status === "REJECTED").length,
      NO_TRANSACTION: transactions.filter((t) => !t.status).length,
    };
  }, [data?.transactions]);

  // Statistics
  const statistics = useMemo(() => {
    const transactions = data?.transactions || [];

    // Overall stats
    const totalClubs = transactions.length;
    const approved = transactions.filter((t) => t.status === "APPROVED").length;
    const rejected = transactions.filter((t) => t.status === "REJECTED").length;
    const noTransaction = transactions.filter((t) => !t.status).length;

    // Zone-based analytics
    const zoneStats = {};
    transactions.forEach((t) => {
      const zone = t.zone || "Unknown";
      if (!zoneStats[zone]) {
        zoneStats[zone] = {
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          noTransaction: 0,
        };
      }
      zoneStats[zone].total++;
      if (t.status === "APPROVED") zoneStats[zone].approved++;
      else if (t.status === "REJECTED") zoneStats[zone].rejected++;
      else if (t.status === "PENDING") zoneStats[zone].pending++;
      else zoneStats[zone].noTransaction++;
    });

    // Calculate percentages for each zone
    const zonePercentages = Object.entries(zoneStats)
      .map(([zone, stats]) => ({
        zone,
        ...stats,
        percentage: ((stats.total / totalClubs) * 100).toFixed(1),
        approvalRate:
          stats.total > 0
            ? ((stats.approved / stats.total) * 100).toFixed(1)
            : 0,
      }))
      .sort((a, b) => a.zone.localeCompare(b.zone));

    return {
      totalClubs,
      approved,
      rejected,
      noTransaction,
      approvalRate:
        totalClubs > 0 ? ((approved / totalClubs) * 100).toFixed(1) : 0,
      zoneStats: zonePercentages,
    };
  }, [data?.transactions]);

  // Export to CSV function
  const handleExportCSV = () => {
    try {
      // Define CSV headers
      const headers = [
        "Zone",
        "Club Name",
        "Area",
        "Status",
        "Transaction Number",
        "Payment Channel",
        "Amount to Pay",
        "Total Uploads",
        "Visible",
        "Remarks",
      ];

      // Create CSV rows
      const csvRows = [
        headers.join(","),
        ...filteredTransactions.map((t) =>
          [
            `"${t.zone || ""}"`,
            `"${t.clubName || ""}"`,
            `"${t.area || ""}"`,
            `"${t.status || "No Transaction"}"`,
            `"${t.transactionNumber || ""}"`,
            `"${t.paymentChannel || ""}"`,
            `"${t.amountToPay || 0}"`,
            `"${t.totalUploads || 0}"`,
            `"${t.isVerified === 1 ? "Yes" : "No"}"`,
            `"${(t.remarks || "").replace(/"/g, '""')}"`, // Escape quotes in remarks
          ].join(",")
        ),
      ];

      // Create blob and download
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success(`Exported ${filteredTransactions.length} transactions`);
    } catch (error) {
      message.error("Failed to export data");
      console.error("Export error:", error);
    }
  };

  const handleToggleVerification = async (clubId) => {
    toggleClubVerificationAdminTransactionsApi.mutate(
      { clubId },
      {
        onSuccess: () => {
          message.success("Club visibility toggled successfully");
          refetch();
        },
        onError: (error) => {
          message.error(error?.message || "Failed to toggle visibility");
        },
      }
    );
  };

  const handleApprove = async (transactionNumber) => {
    modal.confirm({
      title: "Approve Transaction",
      content: "Are you sure you want to approve this transaction?",
      okText: "Approve",
      okType: "primary",
      onOk: () => {
        updateAdminTransactionsApi.mutate(
          {
            transactionNumber,
            status: "APPROVED",
          },
          {
            onSuccess: () => {
              message.success("Transaction approved successfully");
              refetch();
              if (detailsModal) {
                setDetailsModal(false);
              }
            },
            onError: (error) => {
              message.error(error?.message || "Failed to approve transaction");
            },
          }
        );
      },
    });
  };

  const handleReject = (values) => {
    setRejectModal(false);
    updateAdminTransactionsApi.mutate(
      {
        ...values,
        transactionNumber: selectedTransaction.transactionNumber,
        status: "REJECTED",
      },
      {
        onSuccess: () => {
          message.success("Transaction rejected successfully");
          refetch();
          rejectForm.resetFields();
          if (detailsModal) {
            setDetailsModal(false);
          }
        },
        onError: (error) => {
          message.error(error?.message || "Failed to reject transaction");
        },
      }
    );
  };

  const showDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsModal(true);
  };

  const showRejectModal = (transaction) => {
    setSelectedTransaction(transaction);
    setRejectModal(true);
  };

  const showHistoryModal = (transaction) => {
    setSelectedTransaction(transaction);
    setHistoryModal(true);
  };

  const columns = [
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "left",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => showDetails(record)}
          size="small"
        >
          View
        </Button>
      ),
    },
    {
      title: "Zone",
      dataIndex: "zone",
      key: "zone",
      width: 120,
      sorter: (a, b) => (a.zone || "").localeCompare(b.zone || ""),
    },
    {
      title: "Club Name",
      dataIndex: "clubName",
      key: "clubName",
      width: 250,
      sorter: (a, b) => (a.clubName || "").localeCompare(b.clubName || ""),
    },
    {
      title: "Area",
      dataIndex: "area",
      key: "area",
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        if (!status) return <Tag color="default">No Transaction</Tag>;
        const colorMap = {
          PENDING: "processing",
          APPROVED: "success",
          REJECTED: "error",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Transaction #",
      dataIndex: "transactionNumber",
      key: "transactionNumber",
      width: 180,
      render: (num) => num || "-",
    },
    {
      title: "Payment Channel",
      dataIndex: "paymentChannel",
      key: "paymentChannel",
      width: 150,
      render: (channel) => channel || "-",
    },
    {
      title: "Proof Uploads",
      dataIndex: "totalUploads",
      key: "totalUploads",
      width: 150,
      render: (total, record) => (
        <Space>
          <span>{total}</span>
          {total > 0 && (
            <Button
              type="link"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => showHistoryModal(record)}
            >
              History
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: "Visible",
      dataIndex: "isVerified",
      key: "isVerified",
      width: 100,
      render: (isVerified, { clubId }) => (
        <Switch
          checkedChildren="Yes"
          unCheckedChildren="No"
          checked={isVerified === 1}
          onChange={() => handleToggleVerification(clubId)}
          loading={toggleClubVerificationAdminTransactionsApi.isLoading}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      {/* Statistics Section */}
      <Row gutter={16} className="mb-4">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Total Clubs"
              value={statistics.totalClubs}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Approved"
              value={statistics.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Rejected"
              value={statistics.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Overall Approval Rate"
              value={statistics.approvalRate}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Zone Analytics */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Zone Analytics
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statistics.zoneStats.map((zone) => (
              <div
                key={zone.zone}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 hover:shadow-md transition-all duration-200 border border-blue-100"
              >
                {/* Zone Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {zone.zone}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {zone.total} clubs • {zone.percentage}% of total
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-center text-gray-600 mb-1">
                        ✓ Approved
                      </p>
                      <p className="text-2xl text-center font-bold text-green-600">
                        {zone.approved}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-center text-gray-600 mb-1">
                        ○ No upload
                      </p>
                      <p className="text-2xl text-center font-bold text-gray-400">
                        {zone.noTransaction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      Approval Rate
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {zone.approvalRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${zone.approvalRate}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <Card className="mb-4">
        <Space direction="vertical" size="middle" className="w-full">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setClubFilter("ALL");
                }}
                style={{ width: "100%" }}
                placeholder="Filter by Status"
                options={[
                  { label: `All (${statusCounts.ALL})`, value: "ALL" },
                  {
                    label: `Pending (${statusCounts.PENDING})`,
                    value: "PENDING",
                  },
                  {
                    label: `Approved (${statusCounts.APPROVED})`,
                    value: "APPROVED",
                  },
                  {
                    label: `Rejected (${statusCounts.REJECTED})`,
                    value: "REJECTED",
                  },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                value={zoneFilter}
                onChange={(value) => {
                  setZoneFilter(value);
                  setClubFilter("ALL");
                }}
                style={{ width: "100%" }}
                placeholder="Filter by Zone"
                showSearch
                allowClear
                onClear={() => setZoneFilter("ALL")}
                options={[
                  { label: "All Zones", value: "ALL" },
                  ...zones.map((zone) => ({ label: zone, value: zone })),
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                value={clubFilter}
                onChange={setClubFilter}
                style={{ width: "100%" }}
                placeholder="Filter by Club"
                showSearch
                allowClear
                onClear={() => setClubFilter("ALL")}
                options={[
                  { label: "All Clubs", value: "ALL" },
                  ...clubs.map((club) => ({ label: club, value: club })),
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search by keyword..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
          </Row>
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{ color: "#8c8c8c", fontSize: "12px" }}>
                Showing {filteredTransactions.length} of {statusCounts.ALL}{" "}
                clubs
              </div>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
                disabled={filteredTransactions.length === 0}
              >
                Export to CSV
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Table */}
      <Table
        rowKey="clubId"
        dataSource={filteredTransactions}
        columns={columns}
        loading={isLoading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} clubs`,
        }}
        scroll={{ x: 1200 }}
        size="small"
      />

      {/* Transaction Details Modal */}
      <Modal
        title="Transaction Details"
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        footer={null}
        width={700}
      >
        {selectedTransaction && (
          <>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Club Name">
                {selectedTransaction.clubName}
              </Descriptions.Item>
              <Descriptions.Item label="Zone">
                {selectedTransaction.zone}
              </Descriptions.Item>
              <Descriptions.Item label="Area">
                {selectedTransaction.area}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction Number">
                {selectedTransaction.transactionNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Channel">
                {selectedTransaction.paymentChannel || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Amount to Pay">
                ₱
                {parseFloat(
                  selectedTransaction.amountToPay || 0
                ).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedTransaction.status === "APPROVED"
                      ? "success"
                      : selectedTransaction.status === "PENDING"
                      ? "processing"
                      : selectedTransaction.status === "REJECTED"
                      ? "error"
                      : "default"
                  }
                >
                  {selectedTransaction.status || "No Transaction"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Proof Uploads">
                {selectedTransaction.totalUploads || 0}
              </Descriptions.Item>
            </Descriptions>

            {selectedTransaction.imgSrc && (
              <div style={{ marginTop: "16px" }}>
                <h4>Current Proof of Payment</h4>
                <Image
                  src={`${import.meta.env.VITE_BASEURL}/${
                    selectedTransaction.imgSrc
                  }`}
                  alt="Proof of Payment"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            )}

            {selectedTransaction.remarks && (
              <div style={{ marginTop: "16px" }}>
                <h4>Remarks</h4>
                <p
                  style={{
                    padding: "12px",
                    background: "#fff1f0",
                    border: "1px solid #ffccc7",
                    borderRadius: "4px",
                  }}
                >
                  {selectedTransaction.remarks}
                </p>
              </div>
            )}

            {selectedTransaction.status === "PENDING" && (
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
                  onClick={() =>
                    handleApprove(selectedTransaction.transactionNumber)
                  }
                  loading={updateAdminTransactionsApi.isLoading}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => showRejectModal(selectedTransaction)}
                  loading={updateAdminTransactionsApi.isLoading}
                >
                  Reject
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* Payment Proof History Modal */}
      <Modal
        title="Payment Proof History"
        open={historyModal}
        onCancel={() => setHistoryModal(false)}
        footer={null}
        width={600}
      >
        {selectedTransaction?.paymentProofHistory && (
          <Timeline
            items={selectedTransaction.paymentProofHistory.map((proof) => ({
              children: (
                <div>
                  <div style={{ marginBottom: "8px" }}>
                    <Tag
                      color={
                        proof.status === "PENDING"
                          ? "processing"
                          : proof.status === "APPROVED"
                          ? "success"
                          : "error"
                      }
                    >
                      {proof.status}
                    </Tag>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      {new Date(proof.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                  <Image
                    src={`${import.meta.env.VITE_BASEURL}/${proof.filePath}`}
                    alt={`Proof ${proof.proofId}`}
                    style={{ maxWidth: "300px" }}
                  />
                </div>
              ),
            }))}
          />
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Transaction"
        open={rejectModal}
        onCancel={() => {
          setRejectModal(false);
          rejectForm.resetFields();
        }}
        footer={null}
      >
        <Form form={rejectForm} onFinish={handleReject} layout="vertical">
          <p>
            Transaction:{" "}
            <strong>{selectedTransaction?.transactionNumber}</strong>
          </p>
          <p>
            Club: <strong>{selectedTransaction?.clubName}</strong>
          </p>
          <Form.Item
            label="Rejection Reason"
            name="remarks"
            rules={[
              {
                required: true,
                message: "Please provide a reason for rejection",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why this transaction is being rejected..."
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
                loading={updateAdminTransactionsApi.isLoading}
              >
                Reject Transaction
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTransactions;
