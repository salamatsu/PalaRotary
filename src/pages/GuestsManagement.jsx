import {
  PlusOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Typography
} from 'antd';
import dayjs from 'dayjs';
import { apiService } from '../services/api/api';

const { Title } = Typography;

const GuestsManagement = () => {
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: apiService.getGuests,
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Last Visit',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
      sorter: (a, b) => dayjs(a.lastVisit).unix() - dayjs(b.lastVisit).unix(),
    },
    {
      title: 'Total Bookings',
      dataIndex: 'totalBookings',
      key: 'totalBookings',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.totalBookings - b.totalBookings,
      render: (count) => (
        <Tag color={count >= 5 ? 'gold' : count >= 3 ? 'blue' : 'default'}>
          {count} {count === 1 ? 'booking' : 'bookings'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: () => (
        <Space>
          <Button type="link" size="small">View</Button>
          <Button type="link" size="small">Contact</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Guests Management</Title>
        <Button type="primary" icon={<PlusOutlined />} className="bg-blue-600">
          Add Guest
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={guests}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  );
};

export default GuestsManagement;  