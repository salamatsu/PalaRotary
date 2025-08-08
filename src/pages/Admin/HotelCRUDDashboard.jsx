import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
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
  Tabs,
  Tag,
  Tooltip,
  Typography
} from 'antd';
import { useMemo, useState } from 'react';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Mock React Query hooks - replace with actual imports
const useGetBranches = () => ({ data: [], isLoading: false, refetch: () => { } });
const useGetRoomTypes = () => ({ data: [], isLoading: false, refetch: () => { } });
const useGetRates = () => ({ data: [], isLoading: false, refetch: () => { } });
const useGetRooms = () => ({ data: [], isLoading: false, refetch: () => { } });
const useGetCustomers = () => ({ data: [], isLoading: false, refetch: () => { } });
const useGetPromotions = () => ({ data: [], isLoading: false, refetch: () => { } });
const useGetInventoryItems = () => ({ data: [], isLoading: false, refetch: () => { } });
const useGetUsers = () => ({ data: [], isLoading: false, refetch: () => { } });

const useAddBranch = () => ({ mutate: () => { }, isLoading: false });
const useUpdateBranch = () => ({ mutate: () => { }, isLoading: false });
const useDeleteBranch = () => ({ mutate: () => { }, isLoading: false });

// Sample data to demonstrate the interface
const sampleData = {
  branches: [
    {
      branchId: 1,
      branchCode: "SOGO-EDSA-CUB",
      branchName: "Hotel Sogo EDSA Cubao",
      address: "1234 EDSA, Cubao, Quezon City",
      city: "Quezon City",
      region: "Metro Manila",
      contactNumber: "+63-2-8123-4567",
      email: "cubao@hotelsogo.com",
      operatingHours: "24/7",
      isActive: true
    }
  ],
  roomTypes: [
    {
      roomTypeId: 1,
      roomTypeCode: "PREM",
      roomTypeName: "Premium Room",
      description: "Perfect for solo travelers and couples",
      bedConfiguration: "1 Twin Bed",
      maxOccupancy: 2,
      roomSize: "15 sqm",
      isActive: true
    },
    {
      roomTypeId: 2,
      roomTypeCode: "DLX",
      roomTypeName: "Deluxe Room",
      description: "Offers more floor space than Premium Room",
      bedConfiguration: "1 Twin Bed",
      maxOccupancy: 2,
      roomSize: "20 sqm",
      isActive: true
    }
  ],
  rooms: [
    {
      roomId: 1,
      branchId: 1,
      roomNumber: "101",
      floor: "1",
      roomTypeId: 1,
      roomStatus: "available",
      maintenanceStatus: "none",
      isActive: true
    },
    {
      roomId: 2,
      branchId: 1,
      roomNumber: "102",
      floor: "1",
      roomTypeId: 2,
      roomStatus: "occupied",
      maintenanceStatus: "none",
      isActive: true
    }
  ],
  users: [
    {
      userId: 1,
      username: "admin",
      role: "admin",
      branchId: 1,
      isActive: true
    },
    {
      userId: 2,
      username: "receptionist",
      role: "receptionist",
      branchId: 1,
      isActive: true
    }
  ]
};

// Generic CRUD Component
const CRUDComponent = ({
  title,
  data = [],
  columns,
  formFields,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
  icon,
  primaryKey = 'id'
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText]);

  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  const handleDelete = async (record) => {
    try {
      await onDelete(record[primaryKey]);
      message.success(`${title} deleted successfully`);
    } catch (error) {
      message.error('Failed to delete');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await onUpdate({ id: editingRecord[primaryKey], data: values });
        message.success(`${title} updated successfully`);
      } else {
        await onAdd(values);
        message.success(`${title} created successfully`);
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const actionColumn = {
    title: 'Actions',
    key: 'actions',
    width: 150,
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Edit">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure?"
          onConfirm={() => handleDelete(record)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  };

  const tableColumns = [...columns, actionColumn];

  return (
    <Card className="shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <Title level={4} className="!mb-0">{title}</Title>
        </div>
        <Space>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add {title}
          </Button>
        </Space>
      </div>

      <Table
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        rowKey={primaryKey}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="shadow-sm"
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={`${editingRecord ? 'Edit' : 'Add'} ${title}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        className="top-8"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-6"
        >
          <Row gutter={16}>
            {formFields.map((field, index) => (
              <Col span={field.span || 12} key={index}>
                <Form.Item
                  name={field.name}
                  label={field.label}
                  rules={field.rules}
                >
                  {field.component}
                </Form.Item>
              </Col>
            ))}
          </Row>
          <Divider />
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingRecord ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

// Status badge component
const StatusBadge = ({ status, type = 'default' }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'available':
      case 'confirmed': return 'green';
      case 'inactive':
      case 'maintenance': return 'red';
      case 'occupied':
      case 'pending': return 'orange';
      case 'cleaning': return 'blue';
      default: return 'default';
    }
  };

  return (
    <Tag color={getStatusColor(status)}>
      {status?.toUpperCase()}
    </Tag>
  );
};

// Main Dashboard Component
const HotelCRUDDashboard = () => {
  const [activeTab, setActiveTab] = useState('branches');

  // Column definitions for different entities
  const branchColumns = [
    {
      title: 'Branch Code',
      dataIndex: 'branchCode',
      key: 'branchCode',
      width: 150,
      sorter: (a, b) => a.branchCode.localeCompare(b.branchCode),
    },
    {
      title: 'Branch Name',
      dataIndex: 'branchName',
      key: 'branchName',
      sorter: (a, b) => a.branchName.localeCompare(b.branchName),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      width: 150,
    },
    {
      title: 'Contact',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
      ),
    },
  ];

  const roomTypeColumns = [
    {
      title: 'Code',
      dataIndex: 'roomTypeCode',
      key: 'roomTypeCode',
      width: 100,
    },
    {
      title: 'Room Type',
      dataIndex: 'roomTypeName',
      key: 'roomTypeName',
    },
    {
      title: 'Bed Configuration',
      dataIndex: 'bedConfiguration',
      key: 'bedConfiguration',
      width: 150,
    },
    {
      title: 'Max Occupancy',
      dataIndex: 'maxOccupancy',
      key: 'maxOccupancy',
      width: 120,
      render: (count) => (
        <Badge count={count} showZero color="blue" />
      ),
    },
    {
      title: 'Room Size',
      dataIndex: 'roomSize',
      key: 'roomSize',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
      ),
    },
  ];

  const roomColumns = [
    {
      title: 'Room #',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      width: 100,
      sorter: (a, b) => a.roomNumber.localeCompare(b.roomNumber),
    },
    {
      title: 'Floor',
      dataIndex: 'floor',
      key: 'floor',
      width: 80,
    },
    {
      title: 'Room Type',
      dataIndex: 'roomTypeId',
      key: 'roomTypeId',
      width: 120,
      render: (typeId) => {
        const roomType = sampleData.roomTypes.find(rt => rt.roomTypeId === typeId);
        return roomType?.roomTypeName || 'Unknown';
      },
    },
    {
      title: 'Room Status',
      dataIndex: 'roomStatus',
      key: 'roomStatus',
      width: 120,
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Maintenance',
      dataIndex: 'maintenanceStatus',
      key: 'maintenanceStatus',
      width: 120,
      render: (status) => (
        <StatusBadge status={status === 'none' ? 'Good' : status} />
      ),
    },
  ];

  const userColumns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'superAdmin' ? 'purple' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Branch',
      dataIndex: 'branchId',
      key: 'branchId',
      width: 200,
      render: (branchId) => {
        if (!branchId) return <Text type="secondary">All Branches</Text>;
        const branch = sampleData.branches.find(b => b.branchId === branchId);
        return branch?.branchName || 'Unknown';
      },
    },
  ];

  // Form field definitions
  const branchFormFields = [
    {
      name: 'branchCode',
      label: 'Branch Code',
      rules: [{ required: true, message: 'Branch code is required' }],
      component: <Input placeholder="e.g., SOGO-EDSA-CUB" />,
      span: 12,
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      rules: [{ required: true, message: 'Branch name is required' }],
      component: <Input placeholder="e.g., Hotel Sogo EDSA Cubao" />,
      span: 12,
    },
    {
      name: 'address',
      label: 'Address',
      rules: [{ required: true, message: 'Address is required' }],
      component: <Input.TextArea rows={2} placeholder="Full address" />,
      span: 24,
    },
    {
      name: 'city',
      label: 'City',
      rules: [{ required: true, message: 'City is required' }],
      component: <Input placeholder="City" />,
      span: 12,
    },
    {
      name: 'region',
      label: 'Region',
      rules: [{ required: true, message: 'Region is required' }],
      component: <Input placeholder="Region" />,
      span: 12,
    },
    {
      name: 'contactNumber',
      label: 'Contact Number',
      rules: [{ required: true, message: 'Contact number is required' }],
      component: <Input placeholder="+63-2-8123-4567" />,
      span: 12,
    },
    {
      name: 'email',
      label: 'Email',
      rules: [
        { required: true, message: 'Email is required' },
        { type: 'email', message: 'Invalid email format' }
      ],
      component: <Input placeholder="branch@hotel.com" />,
      span: 12,
    },
    {
      name: 'operatingHours',
      label: 'Operating Hours',
      component: <Input placeholder="e.g., 24/7" />,
      span: 12,
    },
    {
      name: 'isActive',
      label: 'Active Status',
      component: <Switch checkedChildren="Active" unCheckedChildren="Inactive" />,
      span: 12,
    },
  ];

  const roomTypeFormFields = [
    {
      name: 'roomTypeCode',
      label: 'Room Type Code',
      rules: [{ required: true, message: 'Room type code is required' }],
      component: <Input placeholder="e.g., PREM" />,
      span: 12,
    },
    {
      name: 'roomTypeName',
      label: 'Room Type Name',
      rules: [{ required: true, message: 'Room type name is required' }],
      component: <Input placeholder="e.g., Premium Room" />,
      span: 12,
    },
    {
      name: 'description',
      label: 'Description',
      component: <Input.TextArea rows={3} placeholder="Room description" />,
      span: 24,
    },
    {
      name: 'bedConfiguration',
      label: 'Bed Configuration',
      rules: [{ required: true, message: 'Bed configuration is required' }],
      component: <Input placeholder="e.g., 1 Twin Bed" />,
      span: 12,
    },
    {
      name: 'maxOccupancy',
      label: 'Max Occupancy',
      rules: [{ required: true, message: 'Max occupancy is required' }],
      component: <InputNumber min={1} max={10} placeholder="2" />,
      span: 12,
    },
    {
      name: 'roomSize',
      label: 'Room Size',
      component: <Input placeholder="e.g., 15 sqm" />,
      span: 12,
    },
    {
      name: 'isActive',
      label: 'Active Status',
      component: <Switch checkedChildren="Active" unCheckedChildren="Inactive" />,
      span: 12,
    },
  ];

  const roomFormFields = [
    {
      name: 'roomNumber',
      label: 'Room Number',
      rules: [{ required: true, message: 'Room number is required' }],
      component: <Input placeholder="101" />,
      span: 12,
    },
    {
      name: 'floor',
      label: 'Floor',
      rules: [{ required: true, message: 'Floor is required' }],
      component: <Input placeholder="1" />,
      span: 12,
    },
    {
      name: 'roomTypeId',
      label: 'Room Type',
      rules: [{ required: true, message: 'Room type is required' }],
      component: (
        <Select placeholder="Select room type">
          {sampleData.roomTypes.map(rt => (
            <Option key={rt.roomTypeId} value={rt.roomTypeId}>
              {rt.roomTypeName}
            </Option>
          ))}
        </Select>
      ),
      span: 12,
    },
    {
      name: 'roomStatus',
      label: 'Room Status',
      rules: [{ required: true, message: 'Room status is required' }],
      component: (
        <Select placeholder="Select status">
          <Option value="available">Available</Option>
          <Option value="occupied">Occupied</Option>
          <Option value="cleaning">Cleaning</Option>
          <Option value="maintenance">Maintenance</Option>
        </Select>
      ),
      span: 12,
    },
    {
      name: 'maintenanceStatus',
      label: 'Maintenance Status',
      component: (
        <Select placeholder="Select maintenance status">
          <Option value="none">None</Option>
          <Option value="scheduled">Scheduled</Option>
          <Option value="in_progress">In Progress</Option>
          <Option value="completed">Completed</Option>
        </Select>
      ),
      span: 12,
    },
    {
      name: 'isActive',
      label: 'Active Status',
      component: <Switch checkedChildren="Active" unCheckedChildren="Inactive" />,
      span: 12,
    },
  ];

  const userFormFields = [
    {
      name: 'username',
      label: 'Username',
      rules: [{ required: true, message: 'Username is required' }],
      component: <Input placeholder="Enter username" />,
      span: 12,
    },
    {
      name: 'password',
      label: 'Password',
      rules: [{ required: true, message: 'Password is required' }],
      component: <Input.Password placeholder="Enter password" />,
      span: 12,
    },
    {
      name: 'role',
      label: 'Role',
      rules: [{ required: true, message: 'Role is required' }],
      component: (
        <Select placeholder="Select role">
          <Option value="superAdmin">Super Admin</Option>
          <Option value="admin">Admin</Option>
          <Option value="receptionist">Receptionist</Option>
          <Option value="housekeeper">Housekeeper</Option>
        </Select>
      ),
      span: 12,
    },
    {
      name: 'branchId',
      label: 'Branch',
      component: (
        <Select placeholder="Select branch (optional for super admin)">
          {sampleData.branches.map(branch => (
            <Option key={branch.branchId} value={branch.branchId}>
              {branch.branchName}
            </Option>
          ))}
        </Select>
      ),
      span: 12,
    },
  ];

  // Mock handlers
  const handleAdd = (data) => {
    console.log('Adding:', data);
    return Promise.resolve();
  };

  const handleUpdate = ({ id, data }) => {
    console.log('Updating:', id, data);
    return Promise.resolve();
  };

  const handleDelete = (id) => {
    console.log('Deleting:', id);
    return Promise.resolve();
  };

  const tabItems = [
    {
      key: 'branches',
      label: (
        <span className="flex items-center gap-2">
          <HomeOutlined />
          Branches
        </span>
      ),
      children: (
        <CRUDComponent
          title="Branch"
          data={sampleData.branches}
          columns={branchColumns}
          formFields={branchFormFields}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          primaryKey="branchId"
          icon={<HomeOutlined className="text-blue-600 text-xl" />}
        />
      ),
    },
    {
      key: 'roomTypes',
      label: (
        <span className="flex items-center gap-2">
          <HomeOutlined />
          Room Types
        </span>
      ),
      children: (
        <CRUDComponent
          title="Room Type"
          data={sampleData.roomTypes}
          columns={roomTypeColumns}
          formFields={roomTypeFormFields}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          primaryKey="roomTypeId"
          icon={<HomeOutlined className="text-green-600 text-xl" />}
        />
      ),
    },
    {
      key: 'rooms',
      label: (
        <span className="flex items-center gap-2">
          <HomeOutlined />
          Rooms
        </span>
      ),
      children: (
        <CRUDComponent
          title="Room"
          data={sampleData.rooms}
          columns={roomColumns}
          formFields={roomFormFields}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          primaryKey="roomId"
          icon={<HomeOutlined className="text-purple-600 text-xl" />}
        />
      ),
    },
    {
      key: 'users',
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          Users
        </span>
      ),
      children: (
        <CRUDComponent
          title="User"
          data={sampleData.users}
          columns={userColumns}
          formFields={userFormFields}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          primaryKey="userId"
          icon={<UserOutlined className="text-orange-600 text-xl" />}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">


        <Card className="shadow-lg border-0">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            className="custom-tabs"
            items={tabItems}
          />
        </Card>
      </div>

      <style jsx>{`
        .custom-tabs .ant-tabs-tab {
          border-radius: 8px 8px 0 0;
          border: none;
          background: #f8f9fa;
          margin-right: 4px;
        }
        .custom-tabs .ant-tabs-tab-active {
          background: white;
          box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
        }
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
        }
        .ant-modal-header {
          border-radius: 8px 8px 0 0;
        }
      `}</style>
    </div>
  );
};

export default HotelCRUDDashboard;