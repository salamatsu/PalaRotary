import {
  AppstoreOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EyeOutlined,
  SearchOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import {
  App,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { useMemo, useState } from "react";
import {
  useGetAdminMerchandiseByIdApi,
  useGetAdminMerchandiseByZoneApi,
  useGetAdminMerchandisesApi,
  useGetAdminMerchandisesStatsApi,
  useUpdateAdminMerchandiseStatusApi,
} from "../../services/requests/usePalarotary";
import { formatPHPCurrency } from "../../utils/formatCurrency";

const { TextArea } = Input;

// Constants

const SHIRT_ORDER_STATUS = {
  approved: "approved", // unuque - no conflict/duplicate
  approved_duplicate: "approved_duplicate",
};

const ORDER_STATUS = {
  ["All Order Status"]: "",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
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
  PENDING: "processing",
  pending: "processing",
  APPROVED: "success",
  approved: "success",
  REJECTED: "error",
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
  const [selectedNumberConflicts, setSelectedNumberConflicts] = useState(null);
  const [conflictAssignedNumbers, setConflictAssignedNumbers] = useState({});
  const [modals, setModals] = useState({
    details: false,
    reject: false,
    approve: false,
    conflicts: false,
  });
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [assignedNumber, setAssignedNumber] = useState(null);
  const [rejectForm] = Form.useForm();
  const [approveForm] = Form.useForm();

  const { data, isLoading, refetch } = useGetAdminMerchandisesApi(filters);
  const { data: statsData } = useGetAdminMerchandisesStatsApi();
  const updateMerchandise = useUpdateAdminMerchandiseStatusApi();

  const getAdminMerchandiseByIdApi = useGetAdminMerchandiseByIdApi(
    selectedOrder?.merchandiseId
  );

  // Fetch zone-specific merchandise for grid view
  const { data: zoneData, refetch: refetchZone } =
    useGetAdminMerchandiseByZoneApi(filters.zone);

  const stats = statsData?.data || {};

  // Handlers
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const toggleModal = (modalName, isOpen, order = null) => {
    setModals((prev) => ({ ...prev, [modalName]: isOpen }));
    if (order) {
      setSelectedOrder(order);
      // Pre-fill with current shirt number
      if (modalName === "approve") {
        setAssignedNumber(order.shirtNumber);
        approveForm.setFieldsValue({ assignedNumber: order.shirtNumber });
      }
    }
    if (!isOpen) {
      if (modalName === "reject") rejectForm.resetFields();
      if (modalName === "approve") {
        approveForm.resetFields();
        setAssignedNumber(null);
      }
    }
  };

  const handleApprove = async (values) => {
    await updateMerchandise.mutateAsync(
      {
        merchandiseId: selectedOrder.merchandiseId,
        status: SHIRT_ORDER_STATUS.approved,
        assignedNumber: values.assignedNumber,
        remarks: values.remarks || "",
      },
      {
        onSuccess: () => {
          message.success("Order approved successfully");
          refetch();
          if (filters.zone) refetchZone();
          toggleModal("approve", false);
          toggleModal("details", false);
          setModals((prev) => ({ ...prev, conflicts: false }));
          setSelectedNumberConflicts(null);
        },
        onError: (error) => {
          modal.warning({
            title: "Failed to approve order",
            content:
              error.response?.data?.data?.message || "Failed to approve order",
          });
        },
      }
    );
  };

  const handleReject = async (values) => {
    try {
      await updateMerchandise.mutateAsync({
        ...values,
        merchandiseId: selectedOrder.merchandiseId,
        status: SHIRT_ORDER_STATUS.approved_duplicate,
      });
      message.success("Order rejected successfully");
      refetch();
      if (filters.zone) refetchZone();
      toggleModal("reject", false);
      toggleModal("details", false);
      setModals((prev) => ({ ...prev, conflicts: false }));
      setSelectedNumberConflicts(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to reject order");
    }
  };

  const handleConflictApprove = async (request, assignedNumber) => {
    if (!assignedNumber && assignedNumber !== 0) {
      message.error("Please enter a shirt number");
      return;
    }

    const formattedNumber = String(assignedNumber).padStart(2, "0");
    const originalNumber = selectedNumberConflicts?.number;

    const remarks =
      originalNumber === formattedNumber
        ? `Approved with original requested shirt number #${formattedNumber}`
        : `Shirt number changed from #${originalNumber} to #${formattedNumber} due to conflict`;

    await updateMerchandise.mutateAsync(
      {
        merchandiseId: request.merchandiseId,
        status: SHIRT_ORDER_STATUS.approved,
        assignedNumber: formattedNumber,
        remarks: remarks,
      },
      {
        onSuccess: () => {
          message.success(`Order approved with shirt #${formattedNumber}`);
          refetch();
          if (filters.zone) refetchZone();
          // Clear the assigned number for this request
          setConflictAssignedNumbers((prev) => {
            const updated = { ...prev };
            delete updated[request.merchandiseId];
            return updated;
          });
        },
        onError: (error) => {
          modal.warning({
            title: "Failed to approve order",
            content:
              error.response?.data?.data?.message ||
              error.response?.data?.message ||
              "Failed to approve order",
          });
        },
      }
    );
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

  // Check if there's a conflict for the selected order
  const hasConflict = useMemo(() => {
    if (!selectedOrder?.merchandiseId || !zoneData?.pendingRequests) {
      return false;
    }

    const orderData = getAdminMerchandiseByIdApi.data;
    if (!orderData?.shirtNumber) return false;

    // Count how many pending requests exist for this shirt number
    const conflictingRequests = zoneData.pendingRequests.filter(
      (item) => item.shirtNumber === orderData.shirtNumber
    );

    return conflictingRequests.length > 1;
  }, [selectedOrder, zoneData, getAdminMerchandiseByIdApi.data]);

  // Generate grid numbers (00-99) with status
  const gridNumbers = useMemo(() => {
    const numbers = [];
    const takenNumbers = new Map();
    const pendingNumbers = new Map();

    // Parse approved unique numbers
    if (zoneData?.uniqueNumbers) {
      zoneData.uniqueNumbers.forEach((item) => {
        takenNumbers.set(item.shirtNumber, {
          name: item.name,
          email: item.email,
          orderStatus: item.orderStatus,
          paymentStatus: item.paymentStatus,
          status: "approved",
        });
      });
    }

    // Parse approved duplicate numbers (if any)
    if (zoneData?.duplicateNumbers) {
      zoneData.duplicateNumbers.forEach((item) => {
        if (!takenNumbers.has(item.shirtNumber)) {
          takenNumbers.set(item.shirtNumber, {
            name: item.name,
            email: item.email,
            orderStatus: item.orderStatus,
            paymentStatus: item.paymentStatus,
            status: "approved",
          });
        }
      });
    }

    // Parse pending requests
    if (zoneData?.pendingRequests) {
      zoneData.pendingRequests.forEach((item) => {
        // Only show as pending if not already approved
        if (!takenNumbers.has(item.shirtNumber)) {
          if (!pendingNumbers.has(item.shirtNumber)) {
            pendingNumbers.set(item.shirtNumber, []);
          }
          pendingNumbers.get(item.shirtNumber).push({
            merchandiseId: item.merchandiseId,
            name: item.name,
            email: item.email,
            mobileNumber: item.mobileNumber,
            size: item.size,
            desiredNumber: item.desiredNumber,
            paymentStatus: item.paymentStatus,
            transactionNumber: item.transactionNumber,
          });
        }
      });
    }

    for (let i = 0; i <= 99; i++) {
      const num = i.toString().padStart(2, "0");
      const isApproved = takenNumbers.has(num);
      const pendingList = pendingNumbers.get(num);
      const hasPending = !!pendingList && pendingList.length > 0;

      numbers.push({
        number: num,
        isTaken: isApproved,
        isPending: hasPending && !isApproved,
        pendingCount: pendingList ? pendingList.length : 0,
        info: takenNumbers.get(num) || null,
        pendingInfo: pendingList || [],
      });
    }
    return numbers;
  }, [zoneData]);

  // Grid View Component
  const GridView = () => {
    const getCardStyle = (item) => {
      if (item.isTaken) {
        return {
          backgroundColor: "#f6ffed",
          borderColor: "#b7eb8f",
          cursor: "default",
        };
      } else if (item.isPending) {
        return {
          backgroundColor: "#fffbe6",
          borderColor: "#ffe58f",
          cursor: "pointer",
        };
      } else {
        return {
          backgroundColor: "#ff333310",
          borderColor: "#ff333350",
          cursor: "default",
        };
      }
    };

    const getNumberColor = (item) => {
      if (item.isTaken) return "#52c41a";
      if (item.isPending) return "#faad14";
      return "#ff333350";
    };

    const getTooltipContent = (item) => {
      if (item.isTaken) {
        return `Approved - ${item.info.name} (${item.info.email})`;
      } else if (item.isPending) {
        const pendingCount = item.pendingCount;
        const firstPending = item.pendingInfo[0];
        return pendingCount > 1
          ? `${pendingCount} Pending Requests (Click to view)`
          : `Pending - ${firstPending.name} (${firstPending.size})`;
      }
      return "Available";
    };

    return (
      <div style={{ marginTop: 16 }}>
        {!filters.zone ? (
          <Card>
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
              }}
            >
              <AppstoreOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <h3>Please select a zone to view the grid</h3>
              <p>
                Choose a zone from the filter above to see shirt number
                availability
              </p>
            </div>
          </Card>
        ) : (
          <Card
            title={`Shirt Numbers Grid - ${filters.zone}`}
            extra={
              <Space>
                <Badge color="green" text="Available" />
                <Badge color="orange" text="Pending" />
                <Badge color="red" text="Taken" />
              </Space>
            }
          >
            {zoneData?.summary && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px",
                  background: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                <Space size="large">
                  <span>
                    <strong>Available:</strong>{" "}
                    {zoneData.summary.totalAvailable}
                  </span>
                  <span>
                    <strong>Pending:</strong> {zoneData.summary.totalPending}
                  </span>
                  <span>
                    <strong>Approved:</strong> {zoneData.summary.totalUnique}
                  </span>
                </Space>
              </div>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
                gap: "8px",
              }}
            >
              {gridNumbers.map((item) => (
                <Tooltip key={item.number} title={getTooltipContent(item)}>
                  <Card
                    size="small"
                    style={{
                      textAlign: "center",
                      ...getCardStyle(item),
                    }}
                    styles={{ body: { padding: "12px 8px" } }}
                    onClick={() => {
                      if (item.isPending && item.pendingInfo.length > 0) {
                        // Open conflicts modal to show all pending requests for this number
                        setSelectedNumberConflicts({
                          number: item.number,
                          pendingRequests: item.pendingInfo,
                          count: item.pendingCount,
                        });

                        // Initialize assigned numbers with the current requested number
                        const initialNumbers = {};
                        item.pendingInfo.forEach((request) => {
                          initialNumbers[request.merchandiseId] = parseInt(
                            item.number,
                            10
                          );
                        });
                        setConflictAssignedNumbers(initialNumbers);

                        setModals((prev) => ({ ...prev, conflicts: true }));
                      }
                    }}
                  >
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        color: getNumberColor(item),
                        position: "relative",
                      }}
                    >
                      {item.number}
                      {item.isPending && item.pendingCount > 1 && (
                        <Badge
                          count={item.pendingCount}
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            fontSize: "10px",
                          }}
                        />
                      )}
                    </div>
                    {item.isTaken && (
                      <div style={{ fontSize: "10px", color: "#999" }}>
                        {item.info.name}
                      </div>
                    )}
                    {item.isPending && (
                      <div style={{ fontSize: "10px", color: "#faad14" }}>
                        {item.pendingInfo[0].size}
                      </div>
                    )}
                  </Card>
                </Tooltip>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.overview?.totalOrders || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={stats.overview?.pendingOrders || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
            {/* <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
              {stats.overview?.pendingPaidOrders || 0} paid /{" "}
              {stats.overview?.pendingUnpaidOrders || 0} unpaid
            </div> */}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved Orders"
              value={stats.overview?.approvedOrders || 0}
              prefix={<CheckOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={parseFloat(stats.overview?.totalRevenue || 0)}
              prefix="₱"
              precision={2}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Merchandise Orders"
        extra={
          <Space>
            <Button
              type={viewMode === "list" ? "primary" : "default"}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <Button
              type={viewMode === "grid" ? "primary" : "default"}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
          </Space>
        }
      >
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

        {viewMode === "list" ? (
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
        ) : (
          <GridView />
        )}
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
                {getAdminMerchandiseByIdApi.data?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {getAdminMerchandiseByIdApi.data?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Zone">
                {getAdminMerchandiseByIdApi.data?.zone}
              </Descriptions.Item>
              <Descriptions.Item label="QR Code">
                {getAdminMerchandiseByIdApi.data?.qrCode}
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
                {getAdminMerchandiseByIdApi.data?.transactionNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Transaction ID">
                {getAdminMerchandiseByIdApi.data?.transactionId}
              </Descriptions.Item>
              <Descriptions.Item label="Details ID">
                {getAdminMerchandiseByIdApi.data?.transactionDetailsId}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {getAdminMerchandiseByIdApi.data?.size}
              </Descriptions.Item>
              <Descriptions.Item label="Shirt Number">
                {getAdminMerchandiseByIdApi.data?.shirtNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Desired Number">
                {getAdminMerchandiseByIdApi.data?.desiredNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Duplicate Count">
                {getAdminMerchandiseByIdApi.data?.duplicateCount}
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
                  color={
                    getAdminMerchandiseByIdApi.data?.isShirtNumberAvailable
                      ? "green"
                      : "red"
                  }
                >
                  {getAdminMerchandiseByIdApi.data?.isShirtNumberAvailable
                    ? "Available"
                    : "Taken"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Taken By">
                {getAdminMerchandiseByIdApi.data?.shirtNumberTakenBy?.name ||
                  "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Desired Number Available">
                {getAdminMerchandiseByIdApi.data?.isDesiredNumberAvailable !==
                null ? (
                  <Tag
                    color={
                      getAdminMerchandiseByIdApi.data?.isDesiredNumberAvailable
                        ? "green"
                        : "red"
                    }
                  >
                    {getAdminMerchandiseByIdApi.data?.isDesiredNumberAvailable
                      ? "Available"
                      : "Taken"}
                  </Tag>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Taken By">
                {getAdminMerchandiseByIdApi.data?.desiredNumberTakenBy?.name ||
                  "N/A"}
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
                    getAdminMerchandiseByIdApi.data?.paymentStatus === "PENDING"
                      ? "orange"
                      : "green"
                  }
                >
                  {getAdminMerchandiseByIdApi.data?.paymentStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order Status">
                <Tag
                  color={
                    getAdminMerchandiseByIdApi.data?.orderStatus === "pending"
                      ? "orange"
                      : "green"
                  }
                >
                  {getAdminMerchandiseByIdApi.data?.orderStatus.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                ₱{getAdminMerchandiseByIdApi.data?.totalAmount.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Paid Amount">
                {getAdminMerchandiseByIdApi.data?.paidAmount
                  ? formatPHPCurrency(
                      getAdminMerchandiseByIdApi.data?.paidAmount
                    )
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Reference Number" span={2}>
                {getAdminMerchandiseByIdApi.data?.referenceNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                {getAdminMerchandiseByIdApi.data?.paymentMethod || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Channel">
                {getAdminMerchandiseByIdApi.data?.paymentChannel || "N/A"}
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
                {getAdminMerchandiseByIdApi.data?.message}
              </Descriptions.Item>
              {getAdminMerchandiseByIdApi.data?.itemRemarks && (
                <Descriptions.Item label="Item Remarks">
                  {getAdminMerchandiseByIdApi.data?.itemRemarks}
                </Descriptions.Item>
              )}
              {getAdminMerchandiseByIdApi.data?.transactionRemarks && (
                <Descriptions.Item label="Transaction Remarks">
                  {getAdminMerchandiseByIdApi.data?.transactionRemarks}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            {/* Timestamps */}
            <Descriptions title="Timestamps" bordered column={2} size="small">
              <Descriptions.Item label="Created At">
                {new Date(
                  getAdminMerchandiseByIdApi.data?.createdAt
                ).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {new Date(
                  getAdminMerchandiseByIdApi.data?.updatedAt
                ).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {(getAdminMerchandiseByIdApi.data?.orderStatus === "PENDING" ||
              getAdminMerchandiseByIdApi.data?.orderStatus === "pending") && (
              <>
                {hasConflict &&
                getAdminMerchandiseByIdApi.data?.paymentStatus === "PAID" ? (
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
                      onClick={() =>
                        toggleModal("approve", true, selectedOrder)
                      }
                      style={{ background: "#52c41a", borderColor: "#52c41a" }}
                      disabled={getAdminMerchandiseByIdApi.isFetching}
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
                ) : (
                  <div
                    style={{
                      marginTop: 16,
                      padding: "12px",
                      background: "#fffbe6",
                      borderRadius: "4px",
                      border: "1px solid #ffe58f",
                    }}
                  >
                    {getAdminMerchandiseByIdApi.data?.paymentStatus !==
                    "PAID" ? (
                      <small style={{ color: "#d48806", fontWeight: 600 }}>
                        ⏳ Waiting for payment confirmation. Actions will be
                        available after payment is confirmed.
                      </small>
                    ) : (
                      <small style={{ color: "#389e0d", fontWeight: 600 }}>
                        ✓ Payment confirmed. No conflicts detected - order will
                        be auto-approved.
                      </small>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Approve Order"
        open={modals.approve}
        onCancel={() => toggleModal("approve", false)}
        footer={null}
      >
        <Form
          form={approveForm}
          layout="vertical"
          onFinish={handleApprove}
          initialValues={{ assignedNumber: selectedOrder?.shirtNumber }}
        >
          <div style={{ marginBottom: 16 }}>
            <p>
              Transaction: <strong>{selectedOrder?.transactionNumber}</strong>
            </p>
            <p>
              Customer: <strong>{selectedOrder?.name}</strong>
            </p>
            <p>
              Current Shirt Number:{" "}
              <strong>{selectedOrder?.shirtNumber}</strong> (
              {selectedOrder?.size})
            </p>
            {selectedOrder?.desiredNumber && (
              <p>
                Desired Number: <strong>{selectedOrder?.desiredNumber}</strong>
              </p>
            )}
          </div>

          <Form.Item
            label="Assigned Shirt Number"
            name="assignedNumber"
            rules={[
              { required: true, message: "Please enter a shirt number" },
              {
                pattern: /^[0-9]{1,2}$/,
                message: "Please enter a valid number (0-99)",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={99}
              style={{ width: "100%" }}
              placeholder="Enter shirt number (0-99)"
              formatter={(value) =>
                value ? String(value).padStart(2, "0") : ""
              }
              parser={(value) => (value ? parseInt(value, 10) : "")}
              onChange={(val) => setAssignedNumber(val)}
            />
          </Form.Item>

          <Form.Item label="Remarks (Optional)" name="remarks">
            <TextArea
              rows={3}
              placeholder="Add any notes about this approval..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => toggleModal("approve", false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateMerchandise.isPending}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                icon={<CheckOutlined />}
              >
                Approve Order
              </Button>
            </Space>
          </Form.Item>
        </Form>
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

      {/* Conflicts Modal - Shows all pending requests for a shirt number */}
      <Modal
        title={
          <span>
            Pending Requests for Shirt #{selectedNumberConflicts?.number}
            <Tag color="orange" style={{ marginLeft: 8 }}>
              {selectedNumberConflicts?.count} Request
              {selectedNumberConflicts?.count > 1 ? "s" : ""}
            </Tag>
          </span>
        }
        open={modals.conflicts}
        onCancel={() => {
          setModals((prev) => ({ ...prev, conflicts: false }));
          setSelectedNumberConflicts(null);
          setConflictAssignedNumbers({});
        }}
        footer={null}
        width={1000}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <p style={{ marginBottom: 12, color: "#666" }}>
            Multiple users have requested shirt number #
            {selectedNumberConflicts?.number}. You can only assign and approve
            orders with confirmed payment (PAID status).
          </p>

          {selectedNumberConflicts?.pendingRequests && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px",
                background: "#f6ffed",
                borderRadius: "4px",
                border: "1px solid #b7eb8f",
              }}
            >
              <Space size="large">
                <span style={{ color: "#389e0d", fontWeight: 600 }}>
                  ✓{" "}
                  {
                    selectedNumberConflicts.pendingRequests.filter(
                      (r) => r.paymentStatus === "PAID"
                    ).length
                  }{" "}
                  Paid
                </span>
                <span style={{ color: "#d48806", fontWeight: 600 }}>
                  ⏳{" "}
                  {
                    selectedNumberConflicts.pendingRequests.filter(
                      (r) => r.paymentStatus !== "PAID"
                    ).length
                  }{" "}
                  Pending Payment
                </span>
              </Space>
            </div>
          )}

          {zoneData?.availableNumbers &&
            zoneData.availableNumbers.length > 0 && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px",
                  background: "#f0f9ff",
                  borderRadius: "4px",
                  border: "1px solid #bae0ff",
                }}
              >
                <div
                  style={{ marginBottom: 6, fontWeight: 500, color: "#0958d9" }}
                >
                  💡 Available Numbers in {filters.zone}:
                </div>
                <div style={{ fontSize: "12px", color: "#1677ff" }}>
                  {zoneData.availableNumbers.slice(0, 20).join(", ")}
                  {zoneData.availableNumbers.length > 20 &&
                    ` and ${zoneData.availableNumbers.length - 20} more...`}
                </div>
              </div>
            )}

          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {selectedNumberConflicts?.pendingRequests.map((request, index) => (
              <Card
                key={request.merchandiseId}
                size="small"
                style={{
                  borderLeft: `4px solid ${
                    request.paymentStatus === "PAID" ? "#52c41a" : "#faad14"
                  }`,
                }}
              >
                <Row gutter={[16, 8]} align="middle">
                  <Col span={12}>
                    <div style={{ marginBottom: 8 }}>
                      <strong style={{ fontSize: "16px" }}>
                        #{index + 1} - {request.name}
                      </strong>
                      <Tag
                        color={
                          request.paymentStatus === "PAID" ? "green" : "orange"
                        }
                        style={{ marginLeft: 8 }}
                      >
                        {request.paymentStatus}
                      </Tag>
                    </div>
                    <Space direction="vertical" size={4}>
                      <div>
                        <span style={{ color: "#666" }}>Email:</span>{" "}
                        {request.email}
                      </div>
                      {request.mobileNumber && (
                        <div>
                          <span style={{ color: "#666" }}>Mobile:</span>{" "}
                          {request.mobileNumber}
                        </div>
                      )}
                      <div>
                        <span style={{ color: "#666" }}>Size:</span>{" "}
                        <Tag>{request.size}</Tag>
                      </div>
                      <div>
                        <span style={{ color: "#666" }}>Transaction:</span>{" "}
                        {request.transactionNumber}
                      </div>
                      {request.desiredNumber && (
                        <div>
                          <span style={{ color: "#666" }}>Desired Number:</span>{" "}
                          <Tag color="blue">{request.desiredNumber}</Tag>
                        </div>
                      )}
                    </Space>
                  </Col>
                  <Col span={6}>
                    <div style={{ marginBottom: 8 }}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 500,
                          marginBottom: 4,
                        }}
                      >
                        Assign Shirt #
                      </label>
                      <InputNumber
                        min={0}
                        max={99}
                        style={{ width: "100%" }}
                        placeholder="Enter number"
                        value={
                          conflictAssignedNumbers[request.merchandiseId] ??
                          parseInt(selectedNumberConflicts?.number, 10)
                        }
                        formatter={(value) =>
                          value !== undefined && value !== null
                            ? String(value).padStart(2, "0")
                            : ""
                        }
                        parser={(value) =>
                          value ? parseInt(value, 10) : undefined
                        }
                        onChange={(val) => {
                          setConflictAssignedNumbers((prev) => ({
                            ...prev,
                            [request.merchandiseId]: val,
                          }));
                        }}
                        disabled={request.paymentStatus !== "PAID"}
                      />
                    </div>
                  </Col>
                  <Col span={6} style={{ textAlign: "right" }}>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      block
                      style={{
                        background: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                      onClick={() => {
                        const assignedNum =
                          conflictAssignedNumbers[request.merchandiseId] ??
                          parseInt(selectedNumberConflicts?.number, 10);
                        handleConflictApprove(request, assignedNum);
                      }}
                      disabled={request.paymentStatus !== "PAID"}
                      loading={updateMerchandise.isPending}
                    >
                      Approve
                    </Button>
                    {request.paymentStatus !== "PAID" && (
                      <small
                        style={{
                          display: "block",
                          color: "#cf1322",
                          fontWeight: 600,
                          marginTop: 8,
                          fontSize: "11px",
                        }}
                      >
                        Payment required
                      </small>
                    )}
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMerchandise;
