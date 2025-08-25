import { DeleteOutlined, EditOutlined, ExportOutlined, EyeOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Input, Popconfirm, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { Bed } from "lucide-react";
import React, { useState } from 'react'
import { StatusBadge } from '../ReusableComponents/StatusBadge';
import { useStyledTable } from '../ReusableComponents/Hooks/useStyleTable';
import AddRoomType from './Components/AddRoomType';
const { Title, Text } = Typography;

const RoomTypes = () => {

  const [open, setOpen] = useState(null)

  const parseJsonField = (jsonString) => {
    try {
      return JSON.parse(jsonString || "[]");
    } catch {
      return [];
    }
  };

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
      // render: (branchId) => {
      //   const branch = branches.find((b) => b.branchId === branchId);
      //   return branch ? branch.branchName : "All Branches";
      // },
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
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView?.(record)}
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
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
      ),
    },
  ];

  const dataSource = [
    {
      "amenities": "[\"AC\",\"TV\",\"WiFi\"]",
      "bedConfiguration": "Queen Bed",
      "branchId": 1,
      "description": "Comfortable standard room with basic amenities",
      "features": "[\"Private Bathroom\",\"Mini Fridge\"]",
      "imageUrl": "/images/standard-room.jpg",
      "isActive": true,
      "maxOccupancy": 2,
      "roomSize": "25 sqm",
      "roomTypeCode": "STD",
      "roomTypeId": 1,
      "roomTypeName": "Standard Room"
    },
    {
      "amenities": "[\"AC\",\"TV\",\"WiFi\",\"Hot Shower\"]",
      "bedConfiguration": "Twin Beds",
      "branchId": 2,
      "description": "Spacious deluxe room with extra features",
      "features": "[\"Private Bathroom\",\"Mini Fridge\",\"Balcony\"]",
      "imageUrl": "/images/deluxe-room.jpg",
      "isActive": true,
      "maxOccupancy": 3,
      "roomSize": "35 sqm",
      "roomTypeCode": "DLX",
      "roomTypeId": 2,
      "roomTypeName": "Deluxe Room"
    },
    {
      "amenities": "[\"AC\",\"TV\",\"WiFi\",\"Coffee Maker\",\"Safe\"]",
      "bedConfiguration": "King Bed",
      "branchId": 3,
      "description": "Luxury suite with premium amenities",
      "features": "[\"Private Bathroom\",\"Mini Fridge\",\"Bathtub\",\"Living Area\"]",
      "imageUrl": "/images/suite-room.jpg",
      "isActive": false,
      "maxOccupancy": 4,
      "roomSize": "50 sqm",
      "roomTypeCode": "SUI",
      "roomTypeId": 3,
      "roomTypeName": "Suite Room"
    }
  ]

  const components = useStyledTable();

  return (
    <div className="space-y-4 m-4 p-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Room Type Mangement
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Room Type
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
        components={components}
        size='middle'
        columns={columns}
        dataSource={dataSource}
        rowKey="branchId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} branches`,
        }}
        className="overflow-x-auto"
      />

      <AddRoomType open={open} setOpen={setOpen} />
    </div>
  )
}

export default RoomTypes
