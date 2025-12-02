import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  HistoryOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App,
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
  Timeline,
} from "antd";
import { useState } from "react";
import {
  useGetAdminTransactionsApi,
  useUpdateAdminTransactionsApi,
} from "../../services/requests/usePalarotary";

const { TextArea } = Input;

const AdminTransactions = () => {
  const { modal } = App.useApp();
  const [filters, setFilters] = useState({
    status: "ALL",
    page: 1,
    limit: 20,
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [rejectForm] = Form.useForm();

  const { data, isLoading, refetch } = useGetAdminTransactionsApi(filters);
  const updateAdminTransactionsApi = useUpdateAdminTransactionsApi();

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value, page: 1 });
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
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
              message.success("Transaction approved");
              refetch();
              if (detailsModal) {
                setDetailsModal(false);
              }
            },
            onError: (error) => {
              message.error(
                error.response?.data?.message || "Failed to approve transaction"
              );
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
          message.success("Transaction rejected");
          refetch();
          if (detailsModal) {
            setDetailsModal(false);
          }
        },
        onError: (error) => {
          message.error(
            error.response?.data?.message || "Failed to approve transaction"
          );
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
      width: 120,
      fixed: "left",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showDetails(record)}>
            View
          </Button>
        </Space>
      ),
    },
    {
      title: "Transaction #",
      dataIndex: "transactionNumber",
      key: "transactionNumber",
    },
    {
      title: "Club Name",
      dataIndex: "clubName",
      key: "clubName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Payment Channel",
      dataIndex: "paymentChannel",
      key: "paymentChannel",
      render: (channel) => channel || "-",
    },
    {
      title: "Amount",
      dataIndex: "amountToPay",
      key: "amountToPay",
      render: (amount) => `₱${parseFloat(amount).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          PENDING: "processing",
          APPROVED: "success",
          REJECTED: "error",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Proof Uploads",
      dataIndex: "totalUploads",
      key: "totalUploads",
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
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || {};

  return (
    <div className=" p-4 pb-0">
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <Input
          placeholder="Search by transaction #, club name, or email"
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
          <Select.Option value="ALL">All Status</Select.Option>
          <Select.Option value="PENDING">Pending</Select.Option>
          <Select.Option value="APPROVED">Approved</Select.Option>
          <Select.Option value="REJECTED">Rejected</Select.Option>
        </Select>
      </div>

      <Table
        dataSource={transactions}
        columns={columns}
        loading={isLoading}
        rowKey="transactionNumber"
        scroll={{ x: 1400 }}
        pagination={{
          current: parseInt(pagination.currentPage),
          pageSize: parseInt(pagination.limit),
          total: pagination.totalRecords,
          onChange: (page) => setFilters({ ...filters, page }),
        }}
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
              <Descriptions.Item label="Transaction Number">
                {selectedTransaction.transactionNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Club ID">
                {selectedTransaction.clubId}
              </Descriptions.Item>
              <Descriptions.Item label="Club Name">
                {selectedTransaction.clubName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedTransaction.email}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Channel">
                {selectedTransaction.paymentChannel || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Amount to Pay">
                ₱{parseFloat(selectedTransaction.amountToPay).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedTransaction.status === "APPROVED"
                      ? "success"
                      : selectedTransaction.status === "PENDING"
                      ? "processing"
                      : "error"
                  }
                >
                  {selectedTransaction.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Proof Uploads">
                {selectedTransaction.totalUploads || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Created On">
                {new Date(selectedTransaction.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {new Date(selectedTransaction.updatedAt).toLocaleString()}
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
                  loading={false}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                  Approve Transaction
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    // setDetailsModal(false);
                    showRejectModal(selectedTransaction);
                  }}
                >
                  Reject Transaction
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
                        proof.status === "PENDING" ? "processing" : "default"
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
              <Button type="primary" danger htmlType="submit" loading={false}>
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
