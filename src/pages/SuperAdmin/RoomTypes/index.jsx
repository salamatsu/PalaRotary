import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography
} from "antd";
import {
  Bed
} from "lucide-react";
import { useEffect, useState } from "react";
import { useModal } from "../../../hooks/useModal";
import { useTableData } from "../../../hooks/useTableData";
import { parseJsonField } from "../../../utils/parseJsonField";
import { StatusBadge } from "../../../components/ui/badges/StatusBadge";

const { Title, } = Typography;
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

const RoomTypes = () => {
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

export default RoomTypes;
