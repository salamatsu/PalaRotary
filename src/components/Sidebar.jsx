import {
  CalendarOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import { useHotelStore } from "../store/hotelStore";

const { Sider } = Layout;
const { Text } = Typography;
const Sidebar = () => {
  const { selectedMenuItem, setSelectedMenuItem } = useHotelStore();

  const menuItems = [
    { key: "dashboard", icon: <HomeOutlined />, label: "Dashboard" },
    { key: "bookings", icon: <CalendarOutlined />, label: "Bookings" },
    { key: "rooms", icon: <HomeOutlined />, label: "Rooms" },
    { key: "guests", icon: <UserOutlined />, label: "Guests" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
  ];

  return (
    <Sider width={250} className="bg-white shadow-sm">
      <div className="p-4 border-b">
        <Text strong className="text-gray-600">
          SOGO HOTEL SYSTEM
        </Text>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedMenuItem]}
        className="border-none"
        items={menuItems}
        onClick={({ key }) => setSelectedMenuItem(key)}
      />
    </Sider>
  );
};

export default Sidebar;
