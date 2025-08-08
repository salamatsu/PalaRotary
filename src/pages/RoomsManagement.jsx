import { PlusOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Space, Table, Tag, Typography } from "antd";
import { apiService } from "../services/api/api";

const { Title } = Typography;
const RoomsManagement = () => {
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: apiService.getRooms,
  });

  const columns = [
    {
      title: "Room Number",
      dataIndex: "number",
      key: "number",
      sorter: (a, b) => a.number - b.number,
      width: 120,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Standard", value: "standard" },
        { text: "Deluxe", value: "deluxe" },
        { text: "Suite", value: "suite" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type) => <span className="capitalize">{type}</span>,
    },
    {
      title: "Price per Night",
      dataIndex: "price",
      key: "price",
      render: (price) => `₱${price.toLocaleString()}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "available"
              ? "green"
              : status === "occupied"
                ? "red"
                : status === "maintenance"
                  ? "orange"
                  : "default"
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Available", value: "available" },
        { text: "Occupied", value: "occupied" },
        { text: "Maintenance", value: "maintenance" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Floor",
      dataIndex: "floor",
      key: "floor",
      sorter: (a, b) => a.floor - b.floor,
      width: 80,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small">
            Edit
          </Button>
          <Button type="link" size="small">
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Rooms Management</Title>
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-600">
          Add Room
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={rooms}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </div>
  );
};

export default RoomsManagement;
