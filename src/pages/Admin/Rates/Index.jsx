import { DeleteOutlined, EditOutlined, ExportOutlined, EyeOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Badge, Button, Input, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { useStyledTable } from '../ReusableComponents/Hooks/useStyleTable';
import dayjs from 'dayjs';
import { useState } from 'react';
import { StatusBadge } from '../ReusableComponents/StatusBadge';
import AddRates from './Components/AddRates';

const { Title } = Typography;

const RatesAndPricing = () => {
  const [open, setOpen] = useState(false);

  // Mock branches data
  const branches = [
    { branchId: 1, branchName: "Makati", branchCode: "MKT" },
    { branchId: 2, branchName: "Cebu", branchCode: "CEB" },
  ];

  // Mock handlers
  const onView = (record) => console.log("View:", record);
  const onEdit = (record) => console.log("Edit:", record);
  const onDelete = (record) => console.log("Delete:", record);

  const formatCurrency = (amount, currency = "PHP") => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: currency === "PHP" ? "PHP" : "USD",
    }).format(amount);
  };

  const dataSource = [
    {
      key: "1",
      roomType: { roomTypeName: "Standard Room" },
      rateType: { rateTypeName: "Regular", duration: 3, durationType: "Hours", dayType: "Weekday", description: "Short stay" },
      baseRate: 1500,
      currency: "PHP",
      branchId: 1,
      branch: { branchName: "Makati", branchCode: "MKT" },
      effectiveFrom: "2025-08-01",
      effectiveTo: "2025-12-31",
      isActive: true,
    },
    {
      key: "2",
      roomType: { roomTypeName: "Deluxe Room" },
      rateType: { rateTypeName: "Overnight", duration: 12, durationType: "Hours", dayType: "Weekend", description: "Overnight stay" },
      baseRate: 3500,
      currency: "PHP",
      branchId: 2,
      branch: { branchName: "Cebu", branchCode: "CEB" },
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-06-30",
      isActive: false,
    },
  ];

  const columns = [
    {
      title: "Rate Configuration",
      key: "configuration",
      render: (_, record) => (
        <div>
          <div className="font-medium text-blue-600">{record.roomType?.roomTypeName || "Unknown Room Type"}</div>
          <div className="text-sm text-gray-600">{record.rateType?.rateTypeName || "Unknown Rate Type"}</div>
          <div className="text-xs text-gray-500">
            {record.rateType?.duration} {record.rateType?.durationType} • {record.rateType?.dayType}
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
          <div className="font-medium">{record.branch?.branchName || "Unknown Branch"}</div>
          <div className="text-xs text-gray-500">{record.branch?.branchCode}</div>
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
          <div className="text-lg font-bold text-green-600">{formatCurrency(record.baseRate, record.currency)}</div>
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
        let color = "success";

        if (now < effectiveFrom) {
          status = "Future";
          color = "processing";
        } else if (now > effectiveTo) {
          status = "Expired";
          color = "error";
        }

        return (
          <div>
            <div className="text-sm"><strong>From:</strong> {dayjs(record.effectiveFrom).format("MMM DD, YYYY")}</div>
            <div className="text-sm"><strong>To:</strong> {dayjs(record.effectiveTo).format("MMM DD, YYYY")}</div>
            <Tag color={color} className="mt-1">{status}</Tag>
          </div>
        );
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
        <Space>
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => onView(record)} className="text-blue-500 hover:text-blue-700" />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} className="text-green-500 hover:text-green-700" />
          </Tooltip>
          <Popconfirm title="Are you sure you want to delete this record?" onConfirm={() => onDelete(record)} okText="Yes" cancelText="No">
            <Tooltip title="Delete">
              <Button type="text" icon={<DeleteOutlined />} className="text-red-500 hover:text-red-700" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const components = useStyledTable();

  return (
    <div className="space-y-4 m-4 p-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">Rates & Pricing Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          Add Rate
        </Button>
      </div>

      <div className="flex flex-row justify-between">
        <Input.Search placeholder="Search..." allowClear className="max-w-md" />
        <div className="flex flex-row gap-2">
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button icon={<ReloadOutlined />}>Refresh</Button>
        </div>
      </div>

      <Table
        components={components}
        size="middle"
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} records`,
        }}
        className="overflow-x-auto"
      />
      <AddRates isModalVisible={open} setIsModalVisible={setOpen} />
    </div>
  );
};

export default RatesAndPricing;
