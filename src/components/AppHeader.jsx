import { Layout, Typography } from "antd";
import { useHotelStore } from "../store/hotelStore";
const { Header } = Layout;
const { Title, Text } = Typography;

const AppHeader = () => {
  const { user, hotelInfo } = useHotelStore();

  return (
    <Header className="bg-white shadow-sm border-b px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Title level={3} className="!mb-0 text-blue-600">
          {hotelInfo.name}
        </Title>
      </div>
      <div className="flex items-center space-x-4">
        <Text>Welcome, {user.name}</Text>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {user.name.charAt(0)}
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;