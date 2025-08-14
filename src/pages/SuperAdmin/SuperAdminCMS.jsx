import {
  BranchesOutlined,
  DashboardOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  FilterOutlined,
  GiftOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import {
  Bed,
  Building2,
  DollarSign,
  Gift,
  Mail,
  Phone,
  ServerIcon,
  Shield,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// Mock Data - In a real app, this would come from your API
const initialData = {
  branches: [
    {
      branchId: 1,
      branchCode: "BR001",
      branchName: "Metro Manila Branch",
      address: "123 EDSA, Quezon City",
      city: "Quezon City",
      region: "NCR",
      contactNumber: "+63 2 1234 5678",
      email: "metro@hotel.com",
      operatingHours: "24/7",
      amenities: JSON.stringify(["WiFi", "Parking", "Restaurant"]),
      isActive: true,
      createdAt: "2024-01-15T08:00:00Z",
    },
  ],
  roomTypes: [
    {
      roomTypeId: 1,
      roomTypeCode: "STD",
      roomTypeName: "Standard Room",
      description: "Comfortable standard room with basic amenities",
      bedConfiguration: "Queen Bed",
      maxOccupancy: 2,
      roomSize: "25 sqm",
      amenities: JSON.stringify(["AC", "TV", "WiFi"]),
      features: JSON.stringify(["Private Bathroom", "Mini Fridge"]),
      imageUrl: "/images/standard-room.jpg",
      isActive: true,
      branchId: 1,
    },
  ],
  rateTypes: [
    {
      rateTypeId: 1,
      rateTypeCode: "HR3",
      rateTypeName: "3-Hour Rate",
      duration: 3,
      durationType: "hours",
      dayType: "weekday",
      description: "Standard 3-hour rate for weekdays",
    },
  ],
  rates: [
    {
      rateId: 1,
      roomTypeId: 1,
      rateTypeId: 1,
      branchId: 1,
      baseRate: 1500.0,
      currency: "PHP",
      effectiveFrom: "2024-01-01",
      effectiveTo: "2024-12-31",
      isActive: true,
    },
  ],
  rooms: [
    {
      roomId: 1,
      branchId: 1,
      roomNumber: "101",
      floor: "1st Floor",
      roomTypeId: 1,
      roomStatus: "available",
      lastCleaned: "2024-01-15T10:00:00Z",
      maintenanceStatus: "none",
      notes: "",
      isActive: true,
    },
  ],
  users: [
    {
      userId: 1,
      username: "admin",
      role: "superAdmin",
      branchId: null,
      firstName: "John",
      lastName: "Doe",
      email: "admin@hotel.com",
      contactNumber: "+63 9123456789",
      isActive: true,
      lastLogin: "2024-01-15T08:30:00Z",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ],
  promotions: [
    {
      promoId: 1,
      promoCode: "WELCOME20",
      promoName: "Welcome Discount",
      promoType: "percentage",
      discountValue: 20,
      minimumStayHours: 3,
      applicableRoomTypes: JSON.stringify([1]),
      applicableBranches: JSON.stringify([1]),
      validFrom: "2024-01-01T00:00:00Z",
      validTo: "2024-12-31T23:59:59Z",
      usageLimit: 100,
      currentUsage: 15,
      dayTypeRestriction: null,
      requiresVerification: false,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ],
  additionalServices: [
    {
      serviceId: 1,
      serviceName: "Extra Guest",
      serviceType: "extra_guest",
      basePrice: 500.0,
      isPerItem: true,
      isActive: true,
    },
  ],
};

// Custom hooks
const useTableData = (dataSource, searchTerm, filters) => {
  return useMemo(() => {
    let filteredData = [...dataSource];

    if (searchTerm) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== "") {
        filteredData = filteredData.filter(
          (item) => item[key] === filters[key]
        );
      }
    });

    return filteredData;
  }, [dataSource, searchTerm, filters]);
};

const useModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const showModal = (record = null) => {
    setEditingRecord(record);
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
    setEditingRecord(null);
  };

  return {
    isVisible,
    editingRecord,
    showModal,
    hideModal,
  };
};

// Utility functions
const formatCurrency = (amount, currency = "PHP") => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: currency === "PHP" ? "PHP" : "USD",
  }).format(amount);
};

const formatDateTime = (dateString) => {
  return dayjs(dateString).format("MMM DD, YYYY HH:mm");
};

const parseJsonField = (jsonString) => {
  try {
    return JSON.parse(jsonString || "[]");
  } catch {
    return [];
  }
};

// Reusable Components
const StatusBadge = ({ status, type = "default" }) => {
  const getColor = () => {
    if (type === "room") {
      switch (status) {
        case "available":
          return "green";
        case "occupied":
          return "red";
        case "cleaning":
          return "orange";
        case "maintenance":
          return "purple";
        case "out_of_order":
          return "volcano";
        default:
          return "default";
      }
    }
    return status ? "green" : "red";
  };

  return <Badge status={getColor()} text={status} />;
};

const ActionButtons = ({
  record,
  onEdit,
  onDelete,
  onView,
  showView = false,
}) => (
  <Space>
    {showView && (
      <Tooltip title="View Details">
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => onView?.(record)}
          className="text-blue-500 hover:text-blue-700"
        />
      </Tooltip>
    )}
    <Tooltip title="Edit">
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={() => onEdit(record)}
        className="text-green-500 hover:text-green-700"
      />
    </Tooltip>
    <Popconfirm
      title="Are you sure you want to delete this record?"
      onConfirm={() => onDelete(record)}
      okText="Yes"
      cancelText="No"
    >
      <Tooltip title="Delete">
        <Button
          type="text"
          icon={<DeleteOutlined />}
          className="text-red-500 hover:text-red-700"
        />
      </Tooltip>
    </Popconfirm>
  </Space>
);

const FilterBar = ({ onSearch, onFilter, children }) => (
  <Card className="mb-4 shadow-sm">
    <Row gutter={[16, 16]} align="middle">
      <Col flex="auto">
        <Input.Search
          placeholder="Search..."
          allowClear
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-md"
        />
      </Col>
      <Col>
        <Space>
          {children}
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button icon={<ReloadOutlined />}>Refresh</Button>
        </Space>
      </Col>
    </Row>
  </Card>
);

// Branch Management Component
const BranchManagement = () => {
  const [branches, setBranches] = useState(initialData.branches);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { isVisible, editingRecord, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const filteredBranches = useTableData(branches, searchTerm, filters);

  const columns = [
    {
      title: "Branch Code",
      dataIndex: "branchCode",
      key: "branchCode",
      width: 120,
      sorter: (a, b) => a.branchCode.localeCompare(b.branchCode),
    },
    {
      title: "Branch Name",
      dataIndex: "branchName",
      key: "branchName",
      sorter: (a, b) => a.branchName.localeCompare(b.branchName),
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.city}</div>
          <div className="text-gray-500 text-sm">{record.region}</div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span className="text-sm">{record.contactNumber}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Mail className="w-3 h-3" />
            <span className="text-sm text-gray-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <StatusBadge status={isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => formatDateTime(date),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={showModal}
          onDelete={handleDelete}
          showView
        />
      ),
    },
  ];

  const handleSubmit = (values) => {
    if (editingRecord) {
      setBranches((prev) =>
        prev.map((b) =>
          b.branchId === editingRecord.branchId ? { ...b, ...values } : b
        )
      );
      message.success("Branch updated successfully");
    } else {
      const newBranch = {
        ...values,
        branchId: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setBranches((prev) => [...prev, newBranch]);
      message.success("Branch created successfully");
    }
    hideModal();
    form.resetFields();
  };

  const handleDelete = (record) => {
    setBranches((prev) => prev.filter((b) => b.branchId !== record.branchId));
    message.success("Branch deleted successfully");
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        amenities: parseJsonField(editingRecord.amenities),
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Branch Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Branch
        </Button>
      </div>

      <FilterBar onSearch={setSearchTerm}>
        <Select
          placeholder="Filter by Region"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, region: value }))
          }
          className="w-40"
        >
          <Option value="NCR">NCR</Option>
          <Option value="Region I">Region I</Option>
          <Option value="Region IV-A">Region IV-A</Option>
        </Select>
      </FilterBar>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredBranches}
          rowKey="branchId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} branches`,
          }}
          className="overflow-x-auto"
        />
      </Card>

      <Modal
        title={editingRecord ? "Edit Branch" : "Add New Branch"}
        open={isVisible}
        onCancel={hideModal}
        footer={null}
        width={800}
        className="top-4"
      >
        <div
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="branchCode"
                label="Branch Code"
                rules={[
                  { required: true, message: "Please input branch code!" },
                ]}
              >
                <Input placeholder="e.g., BR001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="branchName"
                label="Branch Name"
                rules={[
                  { required: true, message: "Please input branch name!" },
                ]}
              >
                <Input placeholder="e.g., Metro Manila Branch" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please input address!" }]}
          >
            <Input.TextArea rows={2} placeholder="Complete address" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: "Please input city!" }]}
              >
                <Input placeholder="City" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="region"
                label="Region"
                rules={[{ required: true, message: "Please select region!" }]}
              >
                <Select placeholder="Select region">
                  <Option value="NCR">NCR</Option>
                  <Option value="Region I">Region I</Option>
                  <Option value="Region IV-A">Region IV-A</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactNumber" label="Contact Number">
                <Input placeholder="+63 2 1234 5678" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input type="email" placeholder="branch@hotel.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="operatingHours" label="Operating Hours">
                <Input placeholder="24/7" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="amenities" label="Amenities">
            <Select
              mode="tags"
              placeholder="Add amenities"
              tokenSeparators={[","]}
            >
              <Option value="WiFi">WiFi</Option>
              <Option value="Parking">Parking</Option>
              <Option value="Restaurant">Restaurant</Option>
              <Option value="Pool">Pool</Option>
              <Option value="Gym">Gym</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={hideModal}>Cancel</Button>
              <Button
                type="primary"
                onClick={() => handleSubmit(form.getFieldsValue())}
                className="bg-blue-600"
              >
                {editingRecord ? "Update" : "Create"} Branch
              </Button>
            </Space>
          </Form.Item>
        </div>
      </Modal>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const stats = {
    totalBranches: initialData.branches.length,
    totalRooms: initialData.rooms.length,
    totalUsers: initialData.users.length,
    activePromotions: initialData.promotions.filter((p) => p.isActive).length,
  };

  return (
    <div className="space-y-6">
      <Title level={2}>Dashboard Overview</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <Statistic
              title="Total Branches"
              value={stats.totalBranches}
              prefix={<Building2 className="w-8 h-8 text-blue-600" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
            <Statistic
              title="Total Rooms"
              value={stats.totalRooms}
              prefix={<Bed className="w-8 h-8 text-green-600" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<Users className="w-8 h-8 text-purple-600" />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <Statistic
              title="Active Promotions"
              value={stats.activePromotions}
              prefix={<Gift className="w-8 h-8 text-orange-600" />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Activities" className="shadow-lg">
            <Timeline
              items={[
                {
                  children: 'New branch "Cebu Branch" was created',
                  color: "green",
                },
                {
                  children: "Room rates updated for Standard Room",
                  color: "blue",
                },
                {
                  children: 'User "john_doe" logged in',
                  color: "gray",
                },
                {
                  children: 'Promotion "WELCOME20" was activated',
                  color: "orange",
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="System Status" className="shadow-lg">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between">
                <Text>Database</Text>
                <Badge status="success" text="Online" />
              </div>
              <div className="flex justify-between">
                <Text>API Services</Text>
                <Badge status="success" text="Running" />
              </div>
              <div className="flex justify-between">
                <Text>Backup Status</Text>
                <Badge status="warning" text="Pending" />
              </div>
              <div className="flex justify-between">
                <Text>Last Sync</Text>
                <Text type="secondary">2 minutes ago</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// Room Types Management Component
const RoomTypeManagement = () => {
  const [roomTypes, setRoomTypes] = useState(initialData.roomTypes);
  const [branches] = useState(initialData.branches);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { isVisible, editingRecord, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const filteredRoomTypes = useTableData(roomTypes, searchTerm, filters);

  const columns = [
    {
      title: "Code",
      dataIndex: "roomTypeCode",
      key: "roomTypeCode",
      width: 100,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Room Type",
      dataIndex: "roomTypeName",
      key: "roomTypeName",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-gray-500 text-sm">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Configuration",
      key: "configuration",
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{record.bedConfiguration}</span>
          </div>
          <div className="text-gray-500 text-sm">
            Max {record.maxOccupancy} guests • {record.roomSize}
          </div>
        </div>
      ),
    },
    {
      title: "Amenities",
      dataIndex: "amenities",
      key: "amenities",
      render: (amenities) => (
        <div className="flex flex-wrap gap-1">
          {parseJsonField(amenities)
            .slice(0, 3)
            .map((amenity, idx) => (
              <Tag key={idx} size="small">
                {amenity}
              </Tag>
            ))}
          {parseJsonField(amenities).length > 3 && (
            <Tag size="small">+{parseJsonField(amenities).length - 3} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branchId",
      key: "branchId",
      render: (branchId) => {
        const branch = branches.find((b) => b.branchId === branchId);
        return branch ? branch.branchName : "All Branches";
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <StatusBadge status={isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={showModal}
          onDelete={handleDeleteRoomType}
          showView
        />
      ),
    },
  ];

  const handleSubmitRoomType = (values) => {
    if (editingRecord) {
      setRoomTypes((prev) =>
        prev.map((rt) =>
          rt.roomTypeId === editingRecord.roomTypeId ? { ...rt, ...values } : rt
        )
      );
      message.success("Room type updated successfully");
    } else {
      const newRoomType = {
        ...values,
        roomTypeId: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setRoomTypes((prev) => [...prev, newRoomType]);
      message.success("Room type created successfully");
    }
    hideModal();
    form.resetFields();
  };

  const handleDeleteRoomType = (record) => {
    setRoomTypes((prev) =>
      prev.filter((rt) => rt.roomTypeId !== record.roomTypeId)
    );
    message.success("Room type deleted successfully");
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        amenities: parseJsonField(editingRecord.amenities),
        features: parseJsonField(editingRecord.features),
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Room Type Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Room Type
        </Button>
      </div>

      <FilterBar onSearch={setSearchTerm}>
        <Select
          placeholder="Filter by Branch"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, branchId: value }))
          }
          className="w-48"
        >
          {branches.map((branch) => (
            <Option key={branch.branchId} value={branch.branchId}>
              {branch.branchName}
            </Option>
          ))}
        </Select>
      </FilterBar>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredRoomTypes}
          rowKey="roomTypeId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} room types`,
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? "Edit Room Type" : "Add New Room Type"}
        open={isVisible}
        onCancel={hideModal}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitRoomType}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roomTypeCode"
                label="Room Type Code"
                rules={[
                  { required: true, message: "Please input room type code!" },
                ]}
              >
                <Input placeholder="e.g., STD, DLX, STE" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roomTypeName"
                label="Room Type Name"
                rules={[
                  { required: true, message: "Please input room type name!" },
                ]}
              >
                <Input placeholder="e.g., Standard Room" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Room type description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bedConfiguration" label="Bed Configuration">
                <Select placeholder="Select bed configuration">
                  <Option value="Single Bed">Single Bed</Option>
                  <Option value="Queen Bed">Queen Bed</Option>
                  <Option value="King Bed">King Bed</Option>
                  <Option value="Twin Beds">Twin Beds</Option>
                  <Option value="Bunk Bed">Bunk Bed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="maxOccupancy" label="Max Occupancy">
                <InputNumber min={1} max={10} placeholder="2" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="roomSize" label="Room Size">
                <Input placeholder="25 sqm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="branchId" label="Branch">
                <Select placeholder="Select branch (optional for all branches)">
                  {branches.map((branch) => (
                    <Option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="amenities" label="Amenities">
            <Select
              mode="tags"
              placeholder="Add amenities"
              tokenSeparators={[","]}
            >
              <Option value="AC">Air Conditioning</Option>
              <Option value="TV">Television</Option>
              <Option value="WiFi">WiFi</Option>
              <Option value="Mini Fridge">Mini Fridge</Option>
              <Option value="Safe">Safe</Option>
              <Option value="Balcony">Balcony</Option>
            </Select>
          </Form.Item>

          <Form.Item name="features" label="Features">
            <Select
              mode="tags"
              placeholder="Add features"
              tokenSeparators={[","]}
            >
              <Option value="Private Bathroom">Private Bathroom</Option>
              <Option value="Jacuzzi">Jacuzzi</Option>
              <Option value="Kitchenette">Kitchenette</Option>
              <Option value="Work Desk">Work Desk</Option>
              <Option value="Sofa">Sofa</Option>
            </Select>
          </Form.Item>

          <Form.Item name="imageUrl" label="Image URL">
            <Input placeholder="https://example.com/room-image.jpg" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={hideModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingRecord ? "Update" : "Create"} Room Type
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState(initialData.users);
  const [branches] = useState(initialData.branches);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { isVisible, editingRecord, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const filteredUsers = useTableData(users, searchTerm, filters);

  const columns = [
    {
      title: "User Info",
      key: "userInfo",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.firstName} {record.lastName}
          </div>
          <div className="text-gray-500 text-sm">@{record.username}</div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const colors = {
          superAdmin: "red",
          admin: "orange",
          receptionist: "blue",
        };
        return <Tag color={colors[role]}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Branch",
      dataIndex: "branchId",
      key: "branchId",
      render: (branchId) => {
        if (!branchId) return <Tag>All Branches</Tag>;
        const branch = branches.find((b) => b.branchId === branchId);
        return branch ? branch.branchName : "Unknown";
      },
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            <span className="text-sm">{record.email}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Phone className="w-3 h-3" />
            <span className="text-sm text-gray-500">
              {record.contactNumber}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
      render: (date) => (date ? formatDateTime(date) : "Never"),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <StatusBadge status={isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={showModal}
          onDelete={handleDeleteUser}
          showView
        />
      ),
    },
  ];

  const handleSubmitUser = (values) => {
    if (editingRecord) {
      setUsers((prev) =>
        prev.map((u) =>
          u.userId === editingRecord.userId ? { ...u, ...values } : u
        )
      );
      message.success("User updated successfully");
    } else {
      const newUser = {
        ...values,
        userId: Date.now(),
        createdAt: new Date().toISOString(),
        password: "hashed_password", // In real app, hash the password
      };
      setUsers((prev) => [...prev, newUser]);
      message.success("User created successfully");
    }
    hideModal();
    form.resetFields();
  };

  const handleDeleteUser = (record) => {
    setUsers((prev) => prev.filter((u) => u.userId !== record.userId));
    message.success("User deleted successfully");
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue(editingRecord);
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          User Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add User
        </Button>
      </div>

      <FilterBar onSearch={setSearchTerm}>
        <Select
          placeholder="Filter by Role"
          allowClear
          onChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}
          className="w-40"
        >
          <Option value="superAdmin">Super Admin</Option>
          <Option value="admin">Admin</Option>
          <Option value="receptionist">Receptionist</Option>
        </Select>
        <Select
          placeholder="Filter by Branch"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, branchId: value }))
          }
          className="w-48"
        >
          {branches.map((branch) => (
            <Option key={branch.branchId} value={branch.branchId}>
              {branch.branchName}
            </Option>
          ))}
        </Select>
      </FilterBar>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="userId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? "Edit User" : "Add New User"}
        open={isVisible}
        onCancel={hideModal}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitUser}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Please input username!" }]}
              >
                <Input placeholder="john_doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: "Please select role!" }]}
              >
                <Select placeholder="Select role">
                  <Option value="superAdmin">Super Admin</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="receptionist">Receptionist</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please input first name!" },
                ]}
              >
                <Input placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: "Please input last name!" }]}
              >
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input email!" },
                  { type: "email", message: "Please enter valid email!" },
                ]}
              >
                <Input placeholder="john.doe@hotel.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactNumber" label="Contact Number">
                <Input placeholder="+63 9123456789" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="branchId" label="Assigned Branch">
                <Select placeholder="Select branch (optional for super admin)">
                  {branches.map((branch) => (
                    <Option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Status" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          {!editingRecord && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please input password!" }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={hideModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingRecord ? "Update" : "Create"} User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Promotions Management Component
const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState(initialData.promotions);
  const [branches] = useState(initialData.branches);
  const [roomTypes] = useState(initialData.roomTypes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { isVisible, editingRecord, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const filteredPromotions = useTableData(promotions, searchTerm, filters);

  const columns = [
    {
      title: "Promo Code",
      dataIndex: "promoCode",
      key: "promoCode",
      width: 120,
      render: (code) => (
        <Tag color="purple" className="font-mono">
          {code}
        </Tag>
      ),
    },
    {
      title: "Promotion Details",
      key: "promoDetails",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.promoName}</div>
          <div className="text-gray-500 text-sm">
            {record.promoType === "percentage"
              ? `${record.discountValue}% discount`
              : `${formatCurrency(record.discountValue)} off`}
          </div>
        </div>
      ),
    },
    {
      title: "Validity Period",
      key: "validity",
      render: (_, record) => (
        <div>
          <div className="text-sm">
            <strong>From:</strong> {formatDateTime(record.validFrom)}
          </div>
          <div className="text-sm">
            <strong>To:</strong> {formatDateTime(record.validTo)}
          </div>
        </div>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, record) => {
        const usagePercentage = record.usageLimit
          ? (record.currentUsage / record.usageLimit) * 100
          : 0;
        return (
          <div>
            <div className="text-sm font-medium">
              {record.currentUsage} / {record.usageLimit || "∞"} used
            </div>
            {record.usageLimit && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Restrictions",
      key: "restrictions",
      render: (_, record) => (
        <div className="space-y-1">
          {record.minimumStayHours && (
            <Tag size="small" color="blue">
              Min {record.minimumStayHours}h stay
            </Tag>
          )}
          {record.dayTypeRestriction && (
            <Tag size="small" color="green">
              {record.dayTypeRestriction}
            </Tag>
          )}
          {record.requiresVerification && (
            <Tag size="small" color="orange">
              Verification Required
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Applicable To",
      key: "applicable",
      render: (_, record) => {
        const applicableRoomTypes = parseJsonField(record.applicableRoomTypes);
        const applicableBranches = parseJsonField(record.applicableBranches);

        return (
          <div className="text-sm">
            <div>
              <strong>Room Types:</strong>{" "}
              {applicableRoomTypes.length === 0
                ? "All"
                : applicableRoomTypes.length === 1
                ? "1 type"
                : `${applicableRoomTypes.length} types`}
            </div>
            <div>
              <strong>Branches:</strong>{" "}
              {applicableBranches.length === 0
                ? "All"
                : applicableBranches.length === 1
                ? "1 branch"
                : `${applicableBranches.length} branches`}
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const now = new Date();
        const validFrom = new Date(record.validFrom);
        const validTo = new Date(record.validTo);

        let status = "Active";
        let color = "green";

        if (!record.isActive) {
          status = "Inactive";
          color = "red";
        } else if (now < validFrom) {
          status = "Scheduled";
          color = "blue";
        } else if (now > validTo) {
          status = "Expired";
          color = "volcano";
        } else if (
          record.usageLimit &&
          record.currentUsage >= record.usageLimit
        ) {
          status = "Limit Reached";
          color = "orange";
        }

        return <Badge status={color} text={status} />;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={showModal}
          onDelete={handleDeletePromotion}
          showView
        />
      ),
    },
  ];

  const handleSubmitPromotion = (values) => {
    // Convert date strings to ISO format
    const formattedValues = {
      ...values,
      validFrom: values.validPeriod[0].toISOString(),
      validTo: values.validPeriod[1].toISOString(),
      applicableRoomTypes: JSON.stringify(values.applicableRoomTypes || []),
      applicableBranches: JSON.stringify(values.applicableBranches || []),
    };

    // Remove the temporary validPeriod field
    delete formattedValues.validPeriod;

    if (editingRecord) {
      setPromotions((prev) =>
        prev.map((p) =>
          p.promoId === editingRecord.promoId ? { ...p, ...formattedValues } : p
        )
      );
      message.success("Promotion updated successfully");
    } else {
      const newPromotion = {
        ...formattedValues,
        promoId: Date.now(),
        currentUsage: 0,
        createdAt: new Date().toISOString(),
      };
      setPromotions((prev) => [...prev, newPromotion]);
      message.success("Promotion created successfully");
    }
    hideModal();
    form.resetFields();
  };

  const handleDeletePromotion = (record) => {
    setPromotions((prev) => prev.filter((p) => p.promoId !== record.promoId));
    message.success("Promotion deleted successfully");
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        validPeriod: [
          dayjs(editingRecord.validFrom),
          dayjs(editingRecord.validTo),
        ],
        applicableRoomTypes: parseJsonField(editingRecord.applicableRoomTypes),
        applicableBranches: parseJsonField(editingRecord.applicableBranches),
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Promotions Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Promotion
        </Button>
      </div>

      <FilterBar onSearch={setSearchTerm}>
        <Select
          placeholder="Filter by Type"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, promoType: value }))
          }
          className="w-40"
        >
          <Option value="percentage">Percentage</Option>
          <Option value="fixed_amount">Fixed Amount</Option>
        </Select>
        <Select
          placeholder="Filter by Status"
          allowClear
          onChange={(value) => {
            if (value === "active") {
              setFilters((prev) => ({ ...prev, isActive: true }));
            } else if (value === "inactive") {
              setFilters((prev) => ({ ...prev, isActive: false }));
            } else {
              setFilters((prev) => {
                const newFilters = { ...prev };
                delete newFilters.isActive;
                return newFilters;
              });
            }
          }}
          className="w-40"
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </FilterBar>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredPromotions}
          rowKey="promoId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} promotions`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingRecord ? "Edit Promotion" : "Add New Promotion"}
        open={isVisible}
        onCancel={hideModal}
        footer={null}
        width={900}
        className="top-4"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitPromotion}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="promoCode"
                label="Promo Code"
                rules={[
                  { required: true, message: "Please input promo code!" },
                  {
                    pattern: /^[A-Z0-9]+$/,
                    message: "Use only uppercase letters and numbers!",
                  },
                ]}
              >
                <Input
                  placeholder="WELCOME20"
                  style={{ fontFamily: "monospace" }}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="promoName"
                label="Promotion Name"
                rules={[
                  { required: true, message: "Please input promotion name!" },
                ]}
              >
                <Input placeholder="Welcome Discount" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="promoType"
                label="Discount Type"
                rules={[
                  { required: true, message: "Please select discount type!" },
                ]}
              >
                <Select placeholder="Select type">
                  <Option value="percentage">Percentage (%)</Option>
                  <Option value="fixed_amount">Fixed Amount (₱)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="discountValue"
                label="Discount Value"
                rules={[
                  { required: true, message: "Please input discount value!" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  placeholder="20"
                  className="w-full"
                  formatter={(value) =>
                    form.getFieldValue("promoType") === "percentage"
                      ? `${value}%`
                      : `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value.replace(/\₱\s?|(,*)/g, "").replace(/%/g, "")
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minimumStayHours" label="Minimum Stay (Hours)">
                <InputNumber min={1} placeholder="3" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="validPeriod"
            label="Validity Period"
            rules={[
              { required: true, message: "Please select validity period!" },
            ]}
          >
            <DatePicker.RangePicker
              showTime
              className="w-full"
              placeholder={["Start Date & Time", "End Date & Time"]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="usageLimit"
                label="Usage Limit"
                tooltip="Leave empty for unlimited usage"
              >
                <InputNumber min={1} placeholder="100" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dayTypeRestriction" label="Day Type Restriction">
                <Select placeholder="Select day restriction" allowClear>
                  <Option value="weekday">Weekdays Only</Option>
                  <Option value="weekend">Weekends Only</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicableRoomTypes"
                label="Applicable Room Types"
                tooltip="Leave empty to apply to all room types"
              >
                <Select
                  mode="multiple"
                  placeholder="Select room types"
                  allowClear
                >
                  {roomTypes.map((roomType) => (
                    <Option
                      key={roomType.roomTypeId}
                      value={roomType.roomTypeId}
                    >
                      {roomType.roomTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="applicableBranches"
                label="Applicable Branches"
                tooltip="Leave empty to apply to all branches"
              >
                <Select
                  mode="multiple"
                  placeholder="Select branches"
                  allowClear
                >
                  {branches.map((branch) => (
                    <Option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requiresVerification"
                label="Requires Verification"
                valuePropName="checked"
              >
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="verificationRequirement"
            label="Verification Requirement"
            dependencies={["requiresVerification"]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Describe verification requirement (e.g., Valid ID required)"
              disabled={!form.getFieldValue("requiresVerification")}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={hideModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingRecord ? "Update" : "Create"} Promotion
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Additional Services Management Component
const AdditionalServicesManagement = () => {
  const [services, setServices] = useState(initialData.additionalServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { isVisible, editingRecord, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const filteredServices = useTableData(services, searchTerm, filters);

  const serviceTypeOptions = [
    {
      value: "extra_guest",
      label: "Extra Guest",
      icon: <Users className="w-4 h-4" />,
    },
    {
      value: "room_service",
      label: "Room Service",
      icon: <ServerIcon className="w-4 h-4" />,
    },
    {
      value: "laundry",
      label: "Laundry Service",
      icon: <HomeOutlined className="text-sm" />,
    },
    {
      value: "transportation",
      label: "Transportation",
      icon: <BranchesOutlined className="text-sm" />,
    },
    {
      value: "food_beverage",
      label: "Food & Beverage",
      icon: <GiftOutlined className="text-sm" />,
    },
    {
      value: "spa_wellness",
      label: "Spa & Wellness",
      icon: <HomeOutlined className="text-sm" />,
    },
    {
      value: "entertainment",
      label: "Entertainment",
      icon: <GiftOutlined className="text-sm" />,
    },
    {
      value: "business",
      label: "Business Services",
      icon: <ServerIcon className="w-4 h-4" />,
    },
    {
      value: "cleaning",
      label: "Extra Cleaning",
      icon: <HomeOutlined className="text-sm" />,
    },
    {
      value: "parking",
      label: "Parking",
      icon: <BranchesOutlined className="text-sm" />,
    },
    {
      value: "other",
      label: "Other Services",
      icon: <SettingOutlined className="text-sm" />,
    },
  ];

  const getServiceTypeInfo = (serviceType) => {
    return (
      serviceTypeOptions.find((option) => option.value === serviceType) || {
        label: serviceType,
        icon: <SettingOutlined />,
      }
    );
  };

  const columns = [
    {
      title: "Service Name",
      key: "serviceName",
      render: (_, record) => {
        const typeInfo = getServiceTypeInfo(record.serviceType);
        return (
          <div>
            <div className="flex items-center gap-2">
              {typeInfo.icon}
              <span className="font-medium">{record.serviceName}</span>
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {record.description || "No description provided"}
            </div>
          </div>
        );
      },
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
      width: 140,
      render: (serviceType) => {
        const typeInfo = getServiceTypeInfo(serviceType);
        const colors = {
          extra_guest: "blue",
          room_service: "green",
          laundry: "purple",
          transportation: "orange",
          food_beverage: "red",
          spa_wellness: "pink",
          entertainment: "cyan",
          business: "geekblue",
          cleaning: "lime",
          parking: "gold",
          other: "default",
        };
        return (
          <Tag color={colors[serviceType] || "default"}>{typeInfo.label}</Tag>
        );
      },
      filters: serviceTypeOptions.map((option) => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value, record) => record.serviceType === value,
    },
    {
      title: "Pricing",
      key: "pricing",
      render: (_, record) => (
        <div>
          <div className="font-medium text-green-600">
            {formatCurrency(record.basePrice)}
          </div>
          <div className="text-gray-500 text-xs">
            {record.isPerItem ? "Per Item/Person" : "Flat Rate"}
          </div>
          {record.isPerHour && (
            <div className="text-blue-500 text-xs">Per Hour</div>
          )}
        </div>
      ),
    },
    {
      title: "Availability",
      key: "availability",
      render: (_, record) => (
        <div className="text-sm">
          {record.availabilitySchedule ? (
            <div>
              <div className="text-gray-600">{record.availabilitySchedule}</div>
              {record.advanceBookingRequired && (
                <Tag size="small" color="orange">
                  Advance Booking Required
                </Tag>
              )}
            </div>
          ) : (
            <Tag size="small" color="green">
              24/7 Available
            </Tag>
          )}
          {record.maxQuantityPerBooking && (
            <div className="text-gray-500 text-xs mt-1">
              Max: {record.maxQuantityPerBooking} per booking
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Features",
      key: "features",
      render: (_, record) => (
        <div className="space-y-1">
          {record.requiresStaffAssignment && (
            <Tag size="small" color="blue">
              Staff Required
            </Tag>
          )}
          {record.isOnDemand && (
            <Tag size="small" color="green">
              On Demand
            </Tag>
          )}
          {record.hasInventory && (
            <Tag size="small" color="purple">
              Inventory Tracked
            </Tag>
          )}
          {record.isPackageService && (
            <Tag size="small" color="cyan">
              Package Service
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <StatusBadge status={isActive ? "Active" : "Inactive"} />
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={showModal}
          onDelete={handleDeleteService}
          showView
        />
      ),
    },
  ];

  const handleSubmitService = (values) => {
    if (editingRecord) {
      setServices((prev) =>
        prev.map((s) =>
          s.serviceId === editingRecord.serviceId ? { ...s, ...values } : s
        )
      );
      message.success("Service updated successfully");
    } else {
      const newService = {
        ...values,
        serviceId: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setServices((prev) => [...prev, newService]);
      message.success("Service created successfully");
    }
    hideModal();
    form.resetFields();
  };

  const handleDeleteService = (record) => {
    setServices((prev) => prev.filter((s) => s.serviceId !== record.serviceId));
    message.success("Service deleted successfully");
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue(editingRecord);
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Additional Services Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Service
        </Button>
      </div>

      <FilterBar onSearch={setSearchTerm}>
        <Select
          placeholder="Filter by Type"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, serviceType: value }))
          }
          className="w-44"
        >
          {serviceTypeOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Filter by Status"
          allowClear
          onChange={(value) => {
            if (value === "active") {
              setFilters((prev) => ({ ...prev, isActive: true }));
            } else if (value === "inactive") {
              setFilters((prev) => ({ ...prev, isActive: false }));
            } else {
              setFilters((prev) => {
                const newFilters = { ...prev };
                delete newFilters.isActive;
                return newFilters;
              });
            }
          }}
          className="w-40"
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </FilterBar>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="serviceId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} services`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={
          editingRecord
            ? "Edit Additional Service"
            : "Add New Additional Service"
        }
        open={isVisible}
        onCancel={hideModal}
        footer={null}
        width={800}
        className="top-4"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitService}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="serviceName"
                label="Service Name"
                rules={[
                  { required: true, message: "Please input service name!" },
                ]}
              >
                <Input placeholder="Extra Guest" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serviceType"
                label="Service Type"
                rules={[
                  { required: true, message: "Please select service type!" },
                ]}
              >
                <Select placeholder="Select service type">
                  {serviceTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        {option.label}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={2}
              placeholder="Service description and details"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="basePrice"
                label="Base Price"
                rules={[
                  { required: true, message: "Please input base price!" },
                ]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="500.00"
                  className="w-full"
                  formatter={(value) =>
                    `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isPerItem"
                label="Pricing Type"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Per Item/Person"
                  unCheckedChildren="Flat Rate"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isPerHour"
                label="Hourly Rate"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Per Hour"
                  unCheckedChildren="One Time"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="availabilitySchedule"
                label="Availability Schedule"
                tooltip="Leave empty for 24/7 availability"
              >
                <Input placeholder="9:00 AM - 10:00 PM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxQuantityPerBooking"
                label="Max Quantity Per Booking"
                tooltip="Leave empty for no limit"
              >
                <InputNumber min={1} placeholder="5" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="requiresStaffAssignment"
                label="Requires Staff"
                valuePropName="checked"
              >
                <Switch size="small" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="isOnDemand"
                label="On Demand"
                valuePropName="checked"
              >
                <Switch size="small" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="hasInventory"
                label="Track Inventory"
                valuePropName="checked"
              >
                <Switch size="small" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="isPackageService"
                label="Package Service"
                valuePropName="checked"
              >
                <Switch size="small" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="advanceBookingRequired"
                label="Advance Booking Required"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Required"
                  unCheckedChildren="Not Required"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="terms"
            label="Terms and Conditions"
            tooltip="Special terms, conditions, or requirements for this service"
          >
            <Input.TextArea
              rows={2}
              placeholder="Any special terms, conditions, or requirements"
            />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Service Instructions"
            tooltip="Instructions for staff on how to provide this service"
          >
            <Input.TextArea
              rows={2}
              placeholder="Instructions for staff on service delivery"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={hideModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingRecord ? "Update" : "Create"} Service
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Rates & Pricing Management Component
const RatesPricingManagement = () => {
  const [rates, setRates] = useState(initialData.rates);
  const [rateTypes] = useState(initialData.rateTypes);
  const [roomTypes] = useState(initialData.roomTypes);
  const [branches] = useState(initialData.branches);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { isVisible, editingRecord, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const filteredRates = useTableData(rates, searchTerm, filters);

  // Extended rate data with related information
  const extendedRates = filteredRates.map((rate) => ({
    ...rate,
    roomType: roomTypes.find((rt) => rt.roomTypeId === rate.roomTypeId),
    rateType: rateTypes.find((rt) => rt.rateTypeId === rate.rateTypeId),
    branch: branches.find((b) => b.branchId === rate.branchId),
  }));

  const columns = [
    {
      title: "Rate Configuration",
      key: "configuration",
      render: (_, record) => (
        <div>
          <div className="font-medium text-blue-600">
            {record.roomType?.roomTypeName || "Unknown Room Type"}
          </div>
          <div className="text-sm text-gray-600">
            {record.rateType?.rateTypeName || "Unknown Rate Type"}
          </div>
          <div className="text-xs text-gray-500">
            {record.rateType?.duration} {record.rateType?.durationType} •{" "}
            {record.rateType?.dayType}
          </div>
        </div>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branchId",
      key: "branchId",
      render: (branchId, record) => (
        <div>
          <div className="font-medium">
            {record.branch?.branchName || "Unknown Branch"}
          </div>
          <div className="text-xs text-gray-500">
            {record.branch?.branchCode}
          </div>
        </div>
      ),
      filters: branches.map((branch) => ({
        text: branch.branchName,
        value: branch.branchId,
      })),
      onFilter: (value, record) => record.branchId === value,
    },
    {
      title: "Base Rate",
      key: "pricing",
      render: (_, record) => (
        <div>
          <div className="text-lg font-bold text-green-600">
            {formatCurrency(record.baseRate, record.currency)}
          </div>
          <div className="text-xs text-gray-500">
            per {record.rateType?.durationType?.slice(0, -1) || "period"}
          </div>
        </div>
      ),
      sorter: (a, b) => a.baseRate - b.baseRate,
    },
    {
      title: "Effective Period",
      key: "effectivePeriod",
      render: (_, record) => {
        const now = new Date();
        const effectiveFrom = new Date(record.effectiveFrom);
        const effectiveTo = new Date(record.effectiveTo);

        let status = "Active";
        let color = "green";

        if (now < effectiveFrom) {
          status = "Future";
          color = "blue";
        } else if (now > effectiveTo) {
          status = "Expired";
          color = "red";
        }

        return (
          <div>
            <div className="text-sm">
              <strong>From:</strong>{" "}
              {dayjs(record.effectiveFrom).format("MMM DD, YYYY")}
            </div>
            <div className="text-sm">
              <strong>To:</strong>{" "}
              {dayjs(record.effectiveTo).format("MMM DD, YYYY")}
            </div>
            <Tag size="small" color={color} className="mt-1">
              {status}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Rate Details",
      key: "rateDetails",
      render: (_, record) => (
        <div className="space-y-1">
          <Tag size="small" color="blue">
            {record.rateType?.duration}H {record.rateType?.dayType}
          </Tag>
          <div className="text-xs text-gray-600">
            {record.rateType?.description}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive, record) => {
        const now = new Date();
        const effectiveFrom = new Date(record.effectiveFrom);
        const effectiveTo = new Date(record.effectiveTo);

        let finalStatus = "Inactive";
        let color = "red";

        if (isActive && now >= effectiveFrom && now <= effectiveTo) {
          finalStatus = "Active";
          color = "green";
        } else if (isActive && now < effectiveFrom) {
          finalStatus = "Scheduled";
          color = "blue";
        } else if (isActive && now > effectiveTo) {
          finalStatus = "Expired";
          color = "volcano";
        }

        return <Badge status={color} text={finalStatus} />;
      },
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={showModal}
          onDelete={handleDeleteRate}
          showView
        />
      ),
    },
  ];

  const handleSubmitRate = (values) => {
    const formattedValues = {
      ...values,
      effectiveFrom: values.effectivePeriod[0].format("YYYY-MM-DD"),
      effectiveTo: values.effectivePeriod[1].format("YYYY-MM-DD"),
    };

    // Remove the temporary effectivePeriod field
    delete formattedValues.effectivePeriod;

    if (editingRecord) {
      setRates((prev) =>
        prev.map((r) =>
          r.rateId === editingRecord.rateId ? { ...r, ...formattedValues } : r
        )
      );
      message.success("Rate updated successfully");
    } else {
      const newRate = {
        ...formattedValues,
        rateId: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setRates((prev) => [...prev, newRate]);
      message.success("Rate created successfully");
    }
    hideModal();
    form.resetFields();
  };

  const handleDeleteRate = (record) => {
    setRates((prev) => prev.filter((r) => r.rateId !== record.rateId));
    message.success("Rate deleted successfully");
  };

  const handleBulkUpdate = () => {
    Modal.confirm({
      title: "Bulk Rate Update",
      content:
        "This feature allows you to update multiple rates at once. Would you like to proceed?",
      onOk() {
        message.info("Bulk update feature would be implemented here");
      },
    });
  };

  const handleRateComparison = () => {
    Modal.info({
      title: "Rate Comparison",
      content:
        "This feature would show a comparison table of rates across different branches and room types.",
    });
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        effectivePeriod: [
          dayjs(editingRecord.effectiveFrom),
          dayjs(editingRecord.effectiveTo),
        ],
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Rates & Pricing Management
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRateComparison}>
            Compare Rates
          </Button>
          <Button icon={<EditOutlined />} onClick={handleBulkUpdate}>
            Bulk Update
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Rate
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="text-center shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <Statistic
              title="Total Rates"
              value={rates.length}
              prefix={<DollarSign className="w-6 h-6 text-blue-600" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <Statistic
              title="Active Rates"
              value={rates.filter((r) => r.isActive).length}
              prefix={<DollarSign className="w-6 h-6 text-green-600" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="text-center shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <Statistic
              title="Avg. Rate"
              value={
                rates.length > 0
                  ? rates.reduce((sum, r) => sum + r.baseRate, 0) / rates.length
                  : 0
              }
              precision={0}
              prefix={<DollarSign className="w-6 h-6 text-orange-600" />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <FilterBar onSearch={setSearchTerm}>
        <Select
          placeholder="Filter by Room Type"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, roomTypeId: value }))
          }
          className="w-48"
        >
          {roomTypes.map((roomType) => (
            <Option key={roomType.roomTypeId} value={roomType.roomTypeId}>
              {roomType.roomTypeName}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Filter by Rate Type"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, rateTypeId: value }))
          }
          className="w-40"
        >
          {rateTypes.map((rateType) => (
            <Option key={rateType.rateTypeId} value={rateType.rateTypeId}>
              {rateType.rateTypeName}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Filter by Branch"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, branchId: value }))
          }
          className="w-48"
        >
          {branches.map((branch) => (
            <Option key={branch.branchId} value={branch.branchId}>
              {branch.branchName}
            </Option>
          ))}
        </Select>
      </FilterBar>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={extendedRates}
          rowKey="rateId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} rates`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingRecord ? "Edit Rate" : "Add New Rate"}
        open={isVisible}
        onCancel={hideModal}
        footer={null}
        width={800}
        className="top-4"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitRate}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roomTypeId"
                label="Room Type"
                rules={[
                  { required: true, message: "Please select room type!" },
                ]}
              >
                <Select placeholder="Select room type">
                  {roomTypes.map((roomType) => (
                    <Option
                      key={roomType.roomTypeId}
                      value={roomType.roomTypeId}
                    >
                      <div>
                        <div className="font-medium">
                          {roomType.roomTypeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {roomType.roomTypeCode}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rateTypeId"
                label="Rate Type"
                rules={[
                  { required: true, message: "Please select rate type!" },
                ]}
              >
                <Select placeholder="Select rate type">
                  {rateTypes.map((rateType) => (
                    <Option
                      key={rateType.rateTypeId}
                      value={rateType.rateTypeId}
                    >
                      <div>
                        <div className="font-medium">
                          {rateType.rateTypeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rateType.duration} {rateType.durationType} •{" "}
                          {rateType.dayType}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="branchId"
                label="Branch"
                rules={[{ required: true, message: "Please select branch!" }]}
              >
                <Select placeholder="Select branch">
                  {branches.map((branch) => (
                    <Option key={branch.branchId} value={branch.branchId}>
                      <div>
                        <div className="font-medium">{branch.branchName}</div>
                        <div className="text-xs text-gray-500">
                          {branch.branchCode}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="Currency"
                rules={[{ required: true, message: "Please select currency!" }]}
                initialValue="PHP"
              >
                <Select placeholder="Select currency">
                  <Option value="PHP">Philippine Peso (₱)</Option>
                  <Option value="USD">US Dollar ($)</Option>
                  <Option value="EUR">Euro (€)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="baseRate"
                label="Base Rate"
                rules={[
                  { required: true, message: "Please input base rate!" },
                  { type: "number", min: 0, message: "Rate must be positive!" },
                ]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  placeholder="1500.00"
                  className="w-full"
                  formatter={(value) =>
                    `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Status"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="effectivePeriod"
            label="Effective Period"
            rules={[
              { required: true, message: "Please select effective period!" },
            ]}
          >
            <DatePicker.RangePicker
              className="w-full"
              placeholder={["Start Date", "End Date"]}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
            tooltip="Additional notes or conditions for this rate"
          >
            <Input.TextArea
              rows={3}
              placeholder="Any special conditions, restrictions, or notes for this rate..."
            />
          </Form.Item>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <Title level={5} className="mb-2">
              Rate Preview
            </Title>
            <div className="flex justify-between items-center">
              <div>
                <Text strong>Selected Configuration:</Text>
                <div className="text-sm text-gray-600 mt-1">
                  Room Type:{" "}
                  {form.getFieldValue("roomTypeId")
                    ? roomTypes.find(
                        (rt) =>
                          rt.roomTypeId === form.getFieldValue("roomTypeId")
                      )?.roomTypeName
                    : "Not selected"}
                </div>
                <div className="text-sm text-gray-600">
                  Rate Type:{" "}
                  {form.getFieldValue("rateTypeId")
                    ? rateTypes.find(
                        (rt) =>
                          rt.rateTypeId === form.getFieldValue("rateTypeId")
                      )?.rateTypeName
                    : "Not selected"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {form.getFieldValue("baseRate")
                    ? formatCurrency(form.getFieldValue("baseRate"))
                    : "₱ 0.00"}
                </div>
                <div className="text-sm text-gray-500">
                  per{" "}
                  {form.getFieldValue("rateTypeId")
                    ? rateTypes
                        .find(
                          (rt) =>
                            rt.rateTypeId === form.getFieldValue("rateTypeId")
                        )
                        ?.durationType?.slice(0, -1)
                    : "period"}
                </div>
              </div>
            </div>
          </div>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={hideModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingRecord ? "Update" : "Create"} Rate
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Main App Component
const SuperAdminCMS = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("dashboard");

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "branches",
      icon: <BranchesOutlined />,
      label: "Branches",
    },
    {
      key: "roomTypes",
      icon: <HomeOutlined />,
      label: "Room Types",
    },
    {
      key: "rooms",
      icon: <HomeOutlined />,
      label: "Rooms",
    },
    {
      key: "rates",
      icon: <DollarSign className="w-4 h-4" />,
      label: "Rates & Pricing",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "User Management",
    },
    {
      key: "promotions",
      icon: <GiftOutlined />,
      label: "Promotions",
    },
    {
      key: "services",
      icon: <ServerIcon />,
      label: "Additional Services",
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return <Dashboard />;
      case "branches":
        return <BranchManagement />;
      case "roomTypes":
        return <RoomTypeManagement />;
      case "users":
        return <UserManagement />;
      case "promotions":
        return <PromotionsManagement />;
      case "services":
        return <AdditionalServicesManagement />;
      // case "rooms":
      //   return <RoomManagement />;
      case "rates":
        return <RatesPricingManagement />;
      default:
        return (
          <div className="text-center py-16">
            <Title level={3} className="text-gray-400">
              {menuItems.find((item) => item.key === selectedKey)?.label}{" "}
              Management
            </Title>
            <Text className="text-gray-500">
              This section is under development. The component structure is
              ready for implementation.
            </Text>
          </div>
        );
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="shadow-lg"
        theme="dark"
      >
        <div className="flex items-center justify-center h-16 bg-blue-800">
          <Shield className="w-8 h-8 text-white" />
          {!collapsed && (
            <span className="ml-2 text-white font-bold">Admin CMS</span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>

      <Layout className=" h-screen">
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-gray-800"
          />

          <div className="flex items-center space-x-4">
            <Text className="text-gray-600">Welcome, Super Admin</Text>
            <Button icon={<SettingOutlined />} type="text" />
          </div>
        </Header>

        <Content className="m-6 p-6 bg-gray-50 rounded-lg">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminCMS;
