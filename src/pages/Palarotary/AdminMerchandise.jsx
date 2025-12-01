import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { useMemo, useState } from "react";
import {
  useGetAdminMerchandiseByIdApi,
  useGetAdminMerchandisesApi,
  useUpdateAdminMerchandiseApi,
} from "../../services/requests/usePalarotary";
import { formatPHPCurrency } from "../../utils/formatCurrency";

const { TextArea } = Input;

// Constants
const ORDER_STATUS = {
  ["All Order Status"]: "",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const PAYMENT_STATUS = {
  ALL: "ALL",
  PENDING: "PENDING",
  PAID: "PAID",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
  VOIDED: "VOIDED",
};

const ZONES = Array.from({ length: 10 }, (_, i) => `ZONE ${i + 1}`);

const ORDER_STATUS_COLORS = {
  pending: "processing",
  approved: "success",
  rejected: "error",
};

const PAYMENT_STATUS_COLORS = {
  PENDING: "warning",
  PAID: "success",
  EXPIRED: "default",
  FAILED: "error",
  VOIDED: "default",
};

// Utility Components
const StatusTag = ({ status, colorMap }) => (
  <Tag color={colorMap[status]}>{status}</Tag>
);

const AdminMerchandise = () => {
  const { modal, message } = App.useApp();
  const [filters, setFilters] = useState({
    status: ORDER_STATUS["All Order Status"],
    zone: "",
    paymentStatus: PAYMENT_STATUS.ALL,
    page: 1,
    limit: 20,
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modals, setModals] = useState({
    details: false,
    reject: false,
  });
  const [rejectForm] = Form.useForm();
  console.log(filters);
  const { data, isLoading, refetch } = useGetAdminMerchandisesApi(filters);
  const updateMerchandise = useUpdateAdminMerchandiseApi();

  const getAdminMerchandiseByIdApi = useGetAdminMerchandiseByIdApi(
    selectedOrder?.merchandiseId
  );

  // Handlers
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleModal = (modalName, isOpen, order = null) => {
    setModals((prev) => ({ ...prev, [modalName]: isOpen }));
    if (order) setSelectedOrder(order);
    if (!isOpen && modalName === "reject") rejectForm.resetFields();
  };

  const handleApprove = (merchandiseId) => {
    modal.confirm({
      title: "Approve Order",
      content: "Are you sure you want to approve this merchandise order?",
      okText: "Approve",
      okType: "primary",
      onOk: async () => {
        try {
          await updateMerchandise.mutateAsync({
            merchandiseId,
            status: ORDER_STATUS.APPROVED,
          });
          message.success("Order approved successfully");
          refetch();
          toggleModal("details", false);
        } catch (error) {
          message.error(
            error.response?.data?.message || "Failed to approve order"
          );
        }
      },
    });
  };

  const handleReject = async (values) => {
    try {
      await updateMerchandise.mutateAsync({
        ...values,
        merchandiseId: selectedOrder.merchandiseId,
        status: ORDER_STATUS.REJECTED,
      });
      message.success("Order rejected successfully");
      refetch();
      toggleModal("reject", false);
      toggleModal("details", false);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to reject order");
    }
  };

  // Table Columns
  const columns = useMemo(
    () => [
      {
        title: "Actions",
        key: "actions",
        width: 100,
        fixed: "left",
        render: (_, record) => (
          <Button
            icon={<EyeOutlined />}
            onClick={() => toggleModal("details", true, record)}
          >
            View
          </Button>
        ),
      },
      {
        title: "Transaction #",
        dataIndex: "transactionNumber",
        key: "transactionNumber",
      },
      {
        title: "QR Code",
        dataIndex: "qrCode",
        key: "qrCode",
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "Zone",
        dataIndex: "zone",
        key: "zone",
        render: (zone) => <Tag color="blue">{zone}</Tag>,
      },
      {
        title: "Size",
        dataIndex: "size",
        key: "size",
        width: 80,
      },
      {
        title: "Shirt #",
        dataIndex: "shirtNumber",
        key: "shirtNumber",
        width: 80,
        render: (num) => <Tag>{num}</Tag>,
      },
      {
        title: "Amount",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 100,
        render: (amount) => `₱${parseFloat(amount).toFixed(2)}`,
      },
      {
        title: "Payment",
        dataIndex: "paymentStatus",
        key: "paymentStatus",
        width: 100,
        render: (status) => (
          <StatusTag status={status} colorMap={PAYMENT_STATUS_COLORS} />
        ),
      },
      {
        title: "Order Status",
        dataIndex: "orderStatus",
        key: "orderStatus",
        width: 120,
        render: (status) => (
          <StatusTag status={status} colorMap={ORDER_STATUS_COLORS} />
        ),
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 100,
        render: (date) => new Date(date).toLocaleDateString(),
      },
    ],
    []
  );

  const merchandises = data?.data?.merchandises || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div style={{ padding: 24 }}>
      <Card title="Merchandise Orders">
        <Space wrap style={{ marginBottom: 16, display: "flex", gap: 12 }}>
          <Input
            placeholder="Search by transaction #, name, email, or QR code"
            prefix={<SearchOutlined />}
            onChange={(e) => updateFilter("search", e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />
          <Select
            value={filters.status}
            onChange={(val) => updateFilter("status", val)}
            style={{ width: 180 }}
            options={Object.entries(ORDER_STATUS).map(([key, value]) => ({
              label: key,
              value: value,
            }))}
          />
          <Select
            value={filters.zone}
            onChange={(val) => updateFilter("zone", val)}
            style={{ width: 130 }}
            options={[
              {
                value: "",
                label: "All Zones",
              },
              ...ZONES.map((zone) => ({
                value: zone,
                label: zone,
              })),
            ]}
          />
          <Select
            value={filters.paymentStatus}
            onChange={(val) => updateFilter("paymentStatus", val)}
            style={{ width: 180 }}
            options={[
              {
                value: "",
                label: "All Payment Status",
              },
              ...Object.entries(PAYMENT_STATUS)
                .filter(([key]) => key !== "ALL")
                .map(([key, value]) => ({
                  value,
                  label: key,
                })),
            ]}
          />
        </Space>

        <Table
          dataSource={merchandises}
          columns={columns}
          loading={isLoading}
          rowKey="merchandiseId"
          scroll={{ x: 1400 }}
          pagination={{
            current: parseInt(pagination.currentPage) || 1,
            pageSize: parseInt(pagination.limit) || 20,
            total: pagination.totalRecords || 0,
            onChange: (page) => updateFilter("page", page),
            showSizeChanger: false,
          }}
        />
      </Card>
      <Modal
        title="Order Details"
        open={getAdminMerchandiseByIdApi.data && modals.details}
        onCancel={() => setModals((prev) => ({ ...prev, details: false }))}
        footer={null}
        width={800}
        destroyOnHidden={true}
      >
        {getAdminMerchandiseByIdApi.data && (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Customer Information */}
            <Descriptions
              title="Customer Information"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="Name">
                {getAdminMerchandiseByIdApi.data.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {getAdminMerchandiseByIdApi.data.email}
              </Descriptions.Item>
              <Descriptions.Item label="Zone">
                {getAdminMerchandiseByIdApi.data.zone}
              </Descriptions.Item>
              <Descriptions.Item label="QR Code">
                {getAdminMerchandiseByIdApi.data.qrCode}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Order Information */}
            <Descriptions
              title="Order Information"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="Transaction Number" span={2}>
                {getAdminMerchandiseByIdApi.data.transactionNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction ID">
                {getAdminMerchandiseByIdApi.data.transactionId}
              </Descriptions.Item>
              <Descriptions.Item label="Details ID">
                {getAdminMerchandiseByIdApi.data.transactionDetailsId}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {getAdminMerchandiseByIdApi.data.size}
              </Descriptions.Item>
              <Descriptions.Item label="Shirt Number">
                {getAdminMerchandiseByIdApi.data.shirtNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Desired Number">
                {getAdminMerchandiseByIdApi.data.desiredNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Duplicate Count">
                {getAdminMerchandiseByIdApi.data.duplicateCount}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Availability Status */}
            <Descriptions
              title="Availability Status"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="Shirt Number Available">
                <Tag
                  color={getAdminMerchandiseByIdApi.data.isShirtNumberAvailable ? "green" : "red"}
                >
                  {getAdminMerchandiseByIdApi.data.isShirtNumberAvailable ? "Available" : "Taken"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Taken By">
                {getAdminMerchandiseByIdApi.data.shirtNumberTakenBy || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Desired Number Available">
                {getAdminMerchandiseByIdApi.data.isDesiredNumberAvailable !== null ? (
                  <Tag
                    color={
                      getAdminMerchandiseByIdApi.data.isDesiredNumberAvailable ? "green" : "red"
                    }
                  >
                    {getAdminMerchandiseByIdApi.data.isDesiredNumberAvailable
                      ? "Available"
                      : "Taken"}
                  </Tag>
                ) : (
                  "N/A"
                )}
                {getAdminMerchandiseByIdApi.data.desiredNumberTakenBy?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Taken By">
                {getAdminMerchandiseByIdApi.data.desiredNumberTakenBy?.name || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Payment Information */}
            <Descriptions
              title="Payment Information"
              bordered
              column={2}
              size="small"
            >
              <Descriptions.Item label="Payment Status">
                <Tag
                  color={
                    getAdminMerchandiseByIdApi.data.paymentStatus === "PENDING"
                      ? "orange"
                      : "green"
                  }
                >
                  {getAdminMerchandiseByIdApi.data.paymentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order Status">
                <Tag
                  color={
                    getAdminMerchandiseByIdApi.data.orderStatus === "pending" ? "orange" : "green"
                  }
                >
                  {getAdminMerchandiseByIdApi.data.orderStatus.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                ₱{getAdminMerchandiseByIdApi.data.totalAmount.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Paid Amount">
                {getAdminMerchandiseByIdApi.data?.paidAmount
                  ? formatPHPCurrency(getAdminMerchandiseByIdApi.data.paidAmount)
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Reference Number" span={2}>
                {getAdminMerchandiseByIdApi.data.referenceNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {getAdminMerchandiseByIdApi.data.paymentMethod || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Channel">
                {getAdminMerchandiseByIdApi.data.paymentChannel || "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Message & Remarks */}
            <Descriptions
              title="Additional Information"
              bordered
              column={1}
              size="small"
            >
              <Descriptions.Item label="Message">
                {getAdminMerchandiseByIdApi.data.message}
              </Descriptions.Item>
              {getAdminMerchandiseByIdApi.data.itemRemarks && (
                <Descriptions.Item label="Item Remarks">
                  {getAdminMerchandiseByIdApi.data.itemRemarks}
                </Descriptions.Item>
              )}
              {getAdminMerchandiseByIdApi.data.transactionRemarks && (
                <Descriptions.Item label="Transaction Remarks">
                  {getAdminMerchandiseByIdApi.data.transactionRemarks}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            {/* Timestamps */}
            <Descriptions title="Timestamps" bordered column={2} size="small">
              <Descriptions.Item label="Created At">
                {new Date(getAdminMerchandiseByIdApi.data.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {new Date(getAdminMerchandiseByIdApi.data.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {getAdminMerchandiseByIdApi.data.orderStatus === ORDER_STATUS.PENDING && (
              <Space
                style={{
                  marginTop: 16,
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(selectedOrder.merchandiseId)}
                  loading={updateMerchandise.isPending}
                  style={{ background: "#52c41a", borderColor: "#52c41a" }}
                >
                  Approve Order
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => toggleModal("reject", true, selectedOrder)}
                >
                  Reject Order
                </Button>
              </Space>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Reject Order"
        open={modals.reject}
        onCancel={() => toggleModal("reject", false)}
        footer={null}
      >
        <div>
          <p>
            Transaction: <strong>{selectedOrder?.transactionNumber}</strong>
          </p>
          <p>
            Customer: <strong>{selectedOrder?.name}</strong>
          </p>
          <p>
            Shirt Number: <strong>{selectedOrder?.shirtNumber}</strong> (
            {selectedOrder?.size})
          </p>
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>
                Rejection Reason <span style={{ color: "red" }}>*</span>
              </label>
            </div>
            <TextArea
              rows={4}
              placeholder="Explain why this order is being rejected..."
              value={rejectForm.getFieldValue("remarks")}
              onChange={(e) =>
                rejectForm.setFieldValue("remarks", e.target.value)
              }
            />
          </div>
          <Space
            style={{
              marginTop: 16,
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={() => toggleModal("reject", false)}>Cancel</Button>
            <Button
              type="primary"
              danger
              loading={updateMerchandise.isPending}
              onClick={() => {
                const remarks = rejectForm.getFieldValue("remarks");
                if (!remarks) {
                  message.error("Please provide a reason for rejection");
                  return;
                }
                handleReject({ remarks });
              }}
            >
              Reject Order
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMerchandise;
