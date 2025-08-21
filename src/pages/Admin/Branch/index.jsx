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
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  message,
  Modal,
  Popconfirm,
  Popover,
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
import AddBranch from "./Components/AddBranch";
import { useStyledTable } from "../ReusableComponents/Hooks/useStyleTable";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

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

const ActionButtons = ({ record, onEdit, onDelete, onView, showView = false, }) => (
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


const Branch = () => {
  const [branches, setBranches] = useState(initialData.branches);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [form] = Form.useForm();

  const filteredBranches = useTableData(branches, searchTerm, filters);
  const formatDateTime = (dateString) => {
    return dayjs(dateString).format("MMM DD, YYYY HH:mm");
  };

  const columns = [
    {
      title: "Branch Code",
      dataIndex: "branchCode",
      key: "branchCode",
      width: 140,
      sorter: (a, b) => a.branchCode.localeCompare(b.branchCode),
    },
    {
      title: "Branch Name",
      dataIndex: "branchName",
      key: "branchName",
      sorter: (a, b) => a.branchName.localeCompare(b.branchName),
      width: 180,
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
      // render: (_, record) => (
      //   <ActionButtons
      //     record={record}
      //     onEdit={showModal}
      //     onDelete={handleDelete}
      //     showView
      //   />
      // ),
    },
  ];

  const handleSubmit = (values) => {
    // if (editingRecord) {
    //   setBranches((prev) =>
    //     prev.map((b) =>
    //       b.branchId === editingRecord.branchId ? { ...b, ...values } : b
    //     )
    //   );
    //   message.success("Branch updated successfully");
    // } else {
    const newBranch = {
      ...values,
      branchId: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setBranches((prev) => [...prev, newBranch]);
    message.success("Branch created successfully");
    // }
    hideModal();
    form.resetFields();
  };

  const handleDelete = (record) => {
    setBranches((prev) => prev.filter((b) => b.branchId !== record.branchId));
    message.success("Branch deleted successfully");
  };

  useEffect(() => {
    // if (editingRecord) {
    //   form.setFieldsValue({
    //     ...editingRecord,
    //     amenities: parseJsonField(editingRecord.amenities),
    //   });
    // } else {
    form.resetFields();
    // }
  }, [form]);

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

  const components = useStyledTable();



  return (
    <div className="space-y-4 m-4 p-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Branch Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Branch
        </Button>
      </div>

      <div className="flex flex-row justify-between">
        <Input.Search
          placeholder="Search..."
          allowClear
          // onSearch={onSearch}
          // onChange={(e) => onSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex flex-row gap-2">
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button icon={<ReloadOutlined />}>Refresh</Button>
        </div>
      </div>

      <Table
        size="small"
        components={components}
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

      <AddBranch isModalVisible={isVisible} setIsModalVisible={setIsVisible} />
    </div>
  );
}

export default Branch
