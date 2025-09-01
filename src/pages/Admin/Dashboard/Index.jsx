import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  Input,
  List,
  Menu,
  Modal,
  Progress,
  Radio,
  Rate,
  Row,
  Segmented,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tabs,
  Timeline,
  Tooltip,
  Typography,
} from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsHeatmap from "highcharts/modules/heatmap";
import HighchartsSolidGauge from "highcharts/modules/solid-gauge";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  BellRing,
  Bookmark,
  Building,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Moon,
  MoreHorizontal,
  RefreshCw,
  Settings,
  Star,
  Sun,
  Target,
  TrendingUp,
  Users,
  Wifi,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Initialize Highcharts modules
// HighchartsMore(Highcharts);
// HighchartsHeatmap(Highcharts);
// HighchartsSolidGauge(Highcharts);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Search: AntSearch } = Input;

// Enhanced Mock Data Generator with Real Hotel Metrics
const generateAdvancedMockData = () => {
  const branches = [
    { id: 1, name: "Manila Central", city: "Manila", rooms: 150 },
    { id: 2, name: "Cebu Paradise", city: "Cebu", rooms: 120 },
    { id: 3, name: "Boracay Resort", city: "Boracay", rooms: 200 },
    { id: 4, name: "Palawan Premium", city: "Palawan", rooms: 80 },
  ];

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const roomTypes = ["Standard", "Deluxe", "Suite", "Presidential"];

  // Advanced Revenue Metrics
  const revenueData = months.map((month, index) => ({
    month,
    revenue: Math.floor(Math.random() * 300000) + 1200000,
    occupancy: Math.floor(Math.random() * 25) + 70,
    adr: Math.floor(Math.random() * 3000) + 4000, // Average Daily Rate
    revpar: Math.floor(Math.random() * 2500) + 3000, // Revenue Per Available Room
    forecast: Math.floor(Math.random() * 350000) + 1300000,
  }));

  // Branch Performance with Advanced Metrics
  const branchPerformance = branches.map((branch, index) => ({
    ...branch,
    revenue: Math.floor(Math.random() * 8000000) + 3000000,
    occupancy: Math.floor(Math.random() * 20) + 75,
    bookings: Math.floor(Math.random() * 3000) + 8000,
    rating: (Math.random() * 1.2 + 3.8).toFixed(1),
    growth: Math.floor(Math.random() * 50) - 25,
    adr: Math.floor(Math.random() * 2000) + 4500,
    revpar: Math.floor(Math.random() * 1800) + 3200,
    customerSatisfaction: Math.floor(Math.random() * 15) + 85,
    staffEfficiency: Math.floor(Math.random() * 12) + 88,
    profitMargin: Math.floor(Math.random() * 8) + 22,
  }));

  // Customer Analytics
  const customerSegments = [
    {
      segment: "Business Travelers",
      value: 35,
      revenue: 4500000,
      satisfaction: 4.2,
      growth: 12,
    },
    {
      segment: "Leisure Tourists",
      value: 40,
      revenue: 3800000,
      satisfaction: 4.5,
      growth: 18,
    },
    {
      segment: "Group Bookings",
      value: 18,
      revenue: 2100000,
      satisfaction: 4.1,
      growth: -5,
    },
    {
      segment: "Online Bookings",
      value: 7,
      revenue: 800000,
      satisfaction: 3.9,
      growth: 25,
    },
  ];

  // Room Type Performance
  const roomTypeAnalysis = roomTypes.map((type) => ({
    type,
    bookings: Math.floor(Math.random() * 1500) + 800,
    revenue: Math.floor(Math.random() * 4000000) + 2000000,
    avgRate: Math.floor(Math.random() * 8000) + 3000,
    occupancy: Math.floor(Math.random() * 20) + 70,
    profitability: Math.floor(Math.random() * 15) + 20,
  }));

  // Staff Performance Metrics
  const staffPerformance = [
    {
      id: 1,
      name: "Maria Santos",
      role: "General Manager",
      performance: 95,
      revenue: 2400000,
      efficiency: 92,
      satisfaction: 4.8,
    },
    {
      id: 2,
      name: "John Rivera",
      role: "Operations Manager",
      performance: 88,
      bookings: 1250,
      efficiency: 85,
      satisfaction: 4.5,
    },
    {
      id: 3,
      name: "Sarah Cruz",
      role: "Guest Services",
      performance: 91,
      satisfaction: 4.7,
      efficiency: 89,
      complaints: 12,
    },
    {
      id: 4,
      name: "Michael Tan",
      role: "Housekeeping Head",
      performance: 87,
      rooms: 2800,
      efficiency: 84,
      satisfaction: 4.3,
    },
  ];

  // Real-time Alerts and Notifications
  const alerts = [
    {
      id: 1,
      type: "warning",
      message: "Occupancy rate dropping in Manila Central",
      priority: "high",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "success",
      message: "Revenue target exceeded in Boracay Resort",
      priority: "medium",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "error",
      message: "System maintenance required in Cebu Paradise",
      priority: "critical",
      time: "6 hours ago",
    },
    {
      id: 4,
      type: "info",
      message: "New customer segment identified",
      priority: "low",
      time: "1 day ago",
    },
  ];

  // Booking Trends
  const bookingTrends = {
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      bookings: Math.floor(Math.random() * 50) + 100,
      revenue: Math.floor(Math.random() * 200000) + 300000,
    })),
    hourly: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      bookings: Math.floor(Math.random() * 20) + 5,
    })),
  };

  return {
    revenueData,
    branchPerformance,
    customerSegments,
    roomTypeAnalysis,
    staffPerformance,
    branches,
    months,
    roomTypes,
    alerts,
    bookingTrends,
  };
};

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("12months");
  const [selectedBranches, setSelectedBranches] = useState(["all"]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [bookmarkedReports, setBookmarkedReports] = useState([
    "revenue-trends",
  ]);
  const [alertsVisible, setAlertsVisible] = useState(false);
  const [realTimeUpdate, setRealTimeUpdate] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});

  const mockData = generateAdvancedMockData();
  const {
    revenueData,
    branchPerformance,
    customerSegments,
    roomTypeAnalysis,
    staffPerformance,
    alerts,
    bookingTrends,
  } = mockData;

  // Advanced KPI Calculations
  const totalRevenue = branchPerformance.reduce(
    (sum, branch) => sum + branch.revenue,
    0
  );
  const avgOccupancy = Math.round(
    branchPerformance.reduce((sum, branch) => sum + branch.occupancy, 0) /
      branchPerformance.length
  );
  const totalBookings = branchPerformance.reduce(
    (sum, branch) => sum + branch.bookings,
    0
  );
  const avgRating = (
    branchPerformance.reduce(
      (sum, branch) => sum + parseFloat(branch.rating),
      0
    ) / branchPerformance.length
  ).toFixed(1);
  const revenueTrend = 15.7;
  const profitMargin = 26.3;
  const totalRooms = branchPerformance.reduce(
    (sum, branch) => sum + branch.rooms,
    0
  );
  const avgADR = Math.round(
    branchPerformance.reduce((sum, branch) => sum + branch.adr, 0) /
      branchPerformance.length
  );
  const avgRevPAR = Math.round(
    branchPerformance.reduce((sum, branch) => sum + branch.revpar, 0) /
      branchPerformance.length
  );

  // Real-time updates simulation
  useEffect(() => {
    if (realTimeUpdate) {
      const interval = setInterval(() => {
        setRefreshKey((prev) => prev + 1);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeUpdate]);

  // Advanced Chart Configurations with Enhanced Styling
  const revenueGrowthConfig = {
    chart: {
      type: "areaspline",
      height: 400,
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      style: { fontFamily: "Inter, sans-serif" },
    },
    title: {
      text: "Revenue Growth & Forecast Analysis",
      style: {
        color: darkMode ? "#ffffff" : "#000000",
        fontSize: "18px",
        fontWeight: "600",
      },
    },
    subtitle: {
      text: "Historical performance with predictive trends",
      style: { color: darkMode ? "#9ca3af" : "#6b7280" },
    },
    xAxis: {
      categories: revenueData.map((d) => d.month),
      labels: { style: { color: darkMode ? "#d1d5db" : "#374151" } },
      gridLineWidth: 1,
      gridLineColor: darkMode ? "#374151" : "#e5e7eb",
    },
    yAxis: [
      {
        title: {
          text: "Revenue (₱)",
          style: { color: darkMode ? "#ffffff" : "#000000" },
        },
        labels: {
          style: { color: darkMode ? "#d1d5db" : "#374151" },
          formatter: function () {
            return "₱" + (this.value / 1000000).toFixed(1) + "M";
          },
        },
        gridLineColor: darkMode ? "#374151" : "#e5e7eb",
      },
      {
        title: {
          text: "Occupancy (%)",
          style: { color: darkMode ? "#ffffff" : "#000000" },
        },
        labels: { style: { color: darkMode ? "#d1d5db" : "#374151" } },
        opposite: true,
      },
    ],
    series: [
      {
        name: "Actual Revenue",
        data: revenueData.map((d) => d.revenue),
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, "rgba(59, 130, 246, 0.8)"],
            [1, "rgba(59, 130, 246, 0.1)"],
          ],
        },
        color: "#3b82f6",
        lineWidth: 3,
      },
      {
        name: "Forecast",
        data: revenueData.map((d) => d.forecast),
        color: "#10b981",
        dashStyle: "ShortDot",
        lineWidth: 2,
      },
      {
        name: "Occupancy Rate",
        data: revenueData.map((d) => d.occupancy),
        type: "line",
        yAxis: 1,
        color: "#f59e0b",
        marker: { enabled: true, radius: 4 },
      },
    ],
    legend: {
      enabled: true,
      itemStyle: { color: darkMode ? "#ffffff" : "#000000" },
    },
    credits: { enabled: false },
    plotOptions: {
      areaspline: {
        marker: { enabled: true, radius: 5 },
        fillOpacity: 0.3,
      },
    },
    tooltip: {
      backgroundColor: darkMode ? "#374151" : "#ffffff",
      borderColor: darkMode ? "#6b7280" : "#d1d5db",
      style: { color: darkMode ? "#ffffff" : "#000000" },
    },
  };

  const occupancyHeatmapConfig = {
    chart: {
      type: "heatmap",
      height: 350,
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
      marginTop: 60,
      marginBottom: 80,
    },
    title: {
      text: "Occupancy Rate Heatmap - Branch vs Month Analysis",
      style: {
        color: darkMode ? "#ffffff" : "#000000",
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    xAxis: {
      categories: mockData.months,
      labels: { style: { color: darkMode ? "#d1d5db" : "#374151" } },
    },
    yAxis: {
      categories: mockData.branches.map((b) => b.name),
      labels: { style: { color: darkMode ? "#d1d5db" : "#374151" } },
      title: null,
    },
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, "#ef4444"],
        [0.3, "#f59e0b"],
        [0.6, "#10b981"],
        [1, "#059669"],
      ],
    },
    series: [
      {
        name: "Occupancy Rate",
        borderWidth: 1,
        data: mockData.branches.flatMap((branch, branchIndex) =>
          mockData.months.map((month, monthIndex) => {
            const occupancy = Math.floor(Math.random() * 35) + 65;
            return [monthIndex, branchIndex, occupancy];
          })
        ),
        dataLabels: {
          enabled: true,
          color: "#ffffff",
          format: "{point.value}%",
          style: {
            fontSize: "11px",
            fontWeight: "bold",
            textOutline: "1px contrast",
          },
        },
      },
    ],
    credits: { enabled: false },
    tooltip: {
      formatter: function () {
        return `<b>${this.series.yAxis.categories[this.point.y]}</b><br/>
                ${this.series.xAxis.categories[this.point.x]}: <b>${
          this.point.value
        }%</b> occupancy`;
      },
      backgroundColor: darkMode ? "#374151" : "#ffffff",
      borderColor: darkMode ? "#6b7280" : "#d1d5db",
      style: { color: darkMode ? "#ffffff" : "#000000" },
    },
  };

  const profitabilityWaterfallConfig = {
    chart: {
      type: "waterfall",
      height: 350,
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
    },
    title: {
      text: "Revenue Breakdown & Profitability Analysis",
      style: {
        color: darkMode ? "#ffffff" : "#000000",
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    xAxis: {
      categories: [
        "Gross Revenue",
        "Room Revenue",
        "F&B Revenue",
        "Services",
        "Discounts",
        "Taxes",
        "Net Profit",
      ],
      labels: { style: { color: darkMode ? "#d1d5db" : "#374151" } },
    },
    yAxis: {
      title: {
        text: "Amount (₱)",
        style: { color: darkMode ? "#ffffff" : "#000000" },
      },
      labels: {
        style: { color: darkMode ? "#d1d5db" : "#374151" },
        formatter: function () {
          return "₱" + (this.value / 1000000).toFixed(1) + "M";
        },
      },
    },
    series: [
      {
        upColor: "#10b981",
        color: "#ef4444",
        data: [
          { y: 12500000, color: "#10b981" },
          { y: 8500000, color: "#3b82f6" },
          { y: 2200000, color: "#6366f1" },
          { y: 1800000, color: "#8b5cf6" },
          { y: -800000, color: "#ef4444" },
          { y: -1200000, color: "#f59e0b" },
          { isSum: true, color: "#059669" },
        ],
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: darkMode ? "#374151" : "#ffffff",
      borderColor: darkMode ? "#6b7280" : "#d1d5db",
      style: { color: darkMode ? "#ffffff" : "#000000" },
    },
  };

  const customerSegmentConfig = {
    chart: {
      type: "pie",
      height: 350,
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
    },
    title: {
      text: "Customer Segment Distribution & Revenue Impact",
      style: {
        color: darkMode ? "#ffffff" : "#000000",
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    plotOptions: {
      pie: {
        innerSize: "50%",
        depth: 45,
        dataLabels: {
          enabled: true,
          format:
            "<b>{point.name}</b><br/>{point.percentage:.1f}%<br/>₱{point.revenue}",
          style: {
            color: darkMode ? "#ffffff" : "#000000",
            fontSize: "11px",
          },
          distance: 20,
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: "Customer Segments",
        data: customerSegments.map((segment, index) => ({
          name: segment.segment,
          y: segment.value,
          revenue: (segment.revenue / 1000000).toFixed(1) + "M",
          color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][index],
        })),
      },
    ],
    legend: {
      itemStyle: { color: darkMode ? "#ffffff" : "#000000" },
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
    },
    credits: { enabled: false },
    tooltip: {
      backgroundColor: darkMode ? "#374151" : "#ffffff",
      borderColor: darkMode ? "#6b7280" : "#d1d5db",
      style: { color: darkMode ? "#ffffff" : "#000000" },
    },
  };

  const roomTypePerformanceConfig = {
    chart: {
      type: "column",
      height: 350,
      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
    },
    title: {
      text: "Room Type Performance & Profitability Matrix",
      style: {
        color: darkMode ? "#ffffff" : "#000000",
        fontSize: "16px",
        fontWeight: "600",
      },
    },
    xAxis: {
      categories: roomTypeAnalysis.map((room) => room.type),
      labels: { style: { color: darkMode ? "#d1d5db" : "#374151" } },
    },
    yAxis: [
      {
        title: {
          text: "Revenue (₱M)",
          style: { color: darkMode ? "#ffffff" : "#000000" },
        },
        labels: {
          style: { color: darkMode ? "#d1d5db" : "#374151" },
          formatter: function () {
            return "₱" + (this.value / 1000000).toFixed(1) + "M";
          },
        },
      },
      {
        title: {
          text: "Occupancy (%)",
          style: { color: darkMode ? "#ffffff" : "#000000" },
        },
        labels: { style: { color: darkMode ? "#d1d5db" : "#374151" } },
        opposite: true,
        max: 100,
      },
    ],
    series: [
      {
        name: "Revenue",
        type: "column",
        data: roomTypeAnalysis.map((room) => room.revenue),
        color: "#3b82f6",
      },
      {
        name: "Occupancy Rate",
        type: "line",
        yAxis: 1,
        data: roomTypeAnalysis.map((room) => room.occupancy),
        color: "#ef4444",
        marker: { enabled: true, radius: 6 },
        lineWidth: 3,
      },
      {
        name: "Profitability",
        type: "column",
        data: roomTypeAnalysis.map((room) => room.profitability * 100000),
        color: "#10b981",
      },
    ],
    credits: { enabled: false },
    legend: {
      itemStyle: { color: darkMode ? "#ffffff" : "#000000" },
    },
    tooltip: {
      backgroundColor: darkMode ? "#374151" : "#ffffff",
      borderColor: darkMode ? "#6b7280" : "#d1d5db",
      style: { color: darkMode ? "#ffffff" : "#000000" },
    },
  };

  const performanceGaugeConfig = (value, title, max = 100) => ({
    chart: {
      type: "solidgauge",
      height: 200,
      backgroundColor: "transparent",
    },
    title: null,
    pane: {
      center: ["50%", "75%"],
      size: "100%",
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: darkMode ? "#374151" : "#f3f4f6",
        innerRadius: "60%",
        outerRadius: "100%",
        shape: "arc",
      },
    },
    yAxis: {
      min: 0,
      max: max,
      stops: [
        [0.1, "#ef4444"],
        [0.5, "#f59e0b"],
        [0.9, "#10b981"],
      ],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      labels: { y: 16 },
    },
    series: [
      {
        data: [value],
        dataLabels: {
          format: `<div style="text-align:center"><span style="font-size:25px;color:${
            darkMode ? "#ffffff" : "#000000"
          }">{y}${
            max === 100 ? "%" : ""
          }</span><br/><span style="font-size:12px;color:${
            darkMode ? "#9ca3af" : "#6b7280"
          }">${title}</span></div>`,
          y: 10,
          borderWidth: 0,
        },
      },
    ],
    credits: { enabled: false },
  });

  // Enhanced Table Columns
  const branchColumns = [
    {
      title: "Branch Details",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            style={{ backgroundColor: "#3b82f6" }}
            icon={<Building size={16} />}
          />
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {text}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {record.city} • {record.rooms} rooms
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Financial Performance",
      children: [
        {
          title: "Revenue",
          dataIndex: "revenue",
          key: "revenue",
          render: (value, record) => (
            <div>
              <div className="font-semibold text-lg">
                ₱{(value / 1000000).toFixed(2)}M
              </div>
              <div
                className={`text-sm flex items-center ${
                  record.growth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {record.growth >= 0 ? (
                  <ArrowUp size={12} />
                ) : (
                  <ArrowDown size={12} />
                )}
                {Math.abs(record.growth)}%
              </div>
            </div>
          ),
          sorter: (a, b) => a.revenue - b.revenue,
        },
        {
          title: "ADR / RevPAR",
          key: "rates",
          render: (_, record) => (
            <div>
              <div className="font-medium">₱{record.adr.toLocaleString()}</div>
              <div className="text-sm text-gray-500">
                ₱{record.revpar.toLocaleString()}
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "Operational Metrics",
      children: [
        {
          title: "Occupancy",
          dataIndex: "occupancy",
          key: "occupancy",
          render: (value) => (
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{value}%</span>
                <Badge
                  status={
                    value >= 80 ? "success" : value >= 60 ? "warning" : "error"
                  }
                  text={
                    value >= 80 ? "Excellent" : value >= 60 ? "Good" : "Low"
                  }
                />
              </div>
              <Progress
                percent={value}
                size="small"
                showInfo={false}
                strokeColor={
                  value >= 80 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444"
                }
              />
            </div>
          ),
          sorter: (a, b) => a.occupancy - b.occupancy,
        },
        {
          title: "Rating",
          dataIndex: "rating",
          key: "rating",
          render: (value) => (
            <div className="flex items-center space-x-2">
              <Rate disabled defaultValue={parseFloat(value)} allowHalf />
              <span className="font-medium">{value}</span>
            </div>
          ),
        },
      ],
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<Eye size={14} />}>
                View Details
              </Menu.Item>
              <Menu.Item key="report" icon={<FileText size={14} />}>
                Generate Report
              </Menu.Item>
              <Menu.Item key="alert" icon={<Bell size={14} />}>
                Set Alert
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="text" icon={<MoreHorizontal size={16} />} />
        </Dropdown>
      ),
    },
  ];

  const staffColumns = [
    {
      title: "Staff Member",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar size={40} style={{ backgroundColor: "#3b82f6" }}>
            {record.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div className="font-semibold">{record.name}</div>
            <div className="text-sm text-gray-500">{record.role}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Performance Score",
      dataIndex: "performance",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Progress
            type="circle"
            percent={value}
            size={50}
            strokeColor={
              value >= 90 ? "#10b981" : value >= 80 ? "#f59e0b" : "#ef4444"
            }
          />
          <span className="font-medium">{value}%</span>
        </div>
      ),
    },
    {
      title: "Key Metrics",
      render: (_, record) => (
        <div className="space-y-1">
          {record.revenue && (
            <div className="text-sm">
              Revenue: ₱{(record.revenue / 1000).toFixed(0)}K
            </div>
          )}
          {record.bookings && (
            <div className="text-sm">Bookings: {record.bookings}</div>
          )}
          {record.satisfaction && (
            <div className="text-sm">
              Satisfaction: {record.satisfaction}/5.0
            </div>
          )}
          {record.efficiency && (
            <div className="text-sm">Efficiency: {record.efficiency}%</div>
          )}
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const toggleBookmark = (reportId) => {
    setBookmarkedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const exportMenu = (
    <Menu>
      <Menu.Item key="pdf" icon={<Download size={14} />}>
        Export as PDF
      </Menu.Item>
      <Menu.Item key="excel" icon={<Download size={14} />}>
        Export to Excel
      </Menu.Item>
      <Menu.Item key="csv" icon={<Download size={14} />}>
        Export as CSV
      </Menu.Item>
      <Menu.Item key="image" icon={<Download size={14} />}>
        Export Charts as Images
      </Menu.Item>
    </Menu>
  );

  const alertsMenu = (
    <Menu>
      {alerts.slice(0, 5).map((alert) => (
        <Menu.Item key={alert.id} className="p-3 border-b">
          <div className="flex items-start space-x-2">
            <Badge
              status={
                alert.type === "error"
                  ? "error"
                  : alert.type === "warning"
                  ? "warning"
                  : alert.type === "success"
                  ? "success"
                  : "processing"
              }
            />
            <div>
              <div className="text-sm font-medium">{alert.message}</div>
              <div className="text-xs text-gray-500">{alert.time}</div>
            </div>
          </div>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item key="view-all">
        <Button type="link" size="small" onClick={() => setAlertsVisible(true)}>
          View All Notifications
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-8xl mx-auto p-6">
        {/* Enhanced Header with Real-time Indicators */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <Title
                level={1}
                className={`mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                SuperAdmin Command Center
              </Title>
              <Text
                className={`text-lg ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Advanced analytics and insights across all operations
              </Text>
            </div>
            {realTimeUpdate && (
              <Badge status="processing" text="Live Updates" className="ml-4" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AntSearch
              placeholder="Search reports, metrics..."
              style={{ width: 200 }}
              allowClear
            />

            <Tooltip title="Real-time Updates">
              <Switch
                checked={realTimeUpdate}
                onChange={setRealTimeUpdate}
                checkedChildren={<Wifi size={12} />}
                unCheckedChildren={<Wifi size={12} />}
              />
            </Tooltip>

            <Dropdown overlay={alertsMenu} trigger={["click"]}>
              <Badge
                count={
                  alerts.filter(
                    (a) => a.priority === "high" || a.priority === "critical"
                  ).length
                }
              >
                <Button type="text" icon={<Bell size={16} />} />
              </Badge>
            </Dropdown>

            <Tooltip title="Toggle Dark Mode">
              <Button
                type="text"
                icon={darkMode ? <Sun size={16} /> : <Moon size={16} />}
                onClick={() => setDarkMode(!darkMode)}
              />
            </Tooltip>

            <Select
              mode="multiple"
              placeholder="Select Branches"
              value={selectedBranches}
              onChange={setSelectedBranches}
              className="w-48"
              allowClear
            >
              <Option value="all">All Branches</Option>
              {mockData.branches.map((branch) => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Option>
              ))}
            </Select>

            <Segmented
              options={[
                { label: "7D", value: "7days" },
                { label: "1M", value: "1month" },
                { label: "3M", value: "3months" },
                { label: "12M", value: "12months" },
              ]}
              value={selectedTimeRange}
              onChange={setSelectedTimeRange}
            />

            <Button
              icon={<Filter size={16} />}
              onClick={() => setFilterModalVisible(true)}
            >
              Filters
            </Button>

            <Dropdown overlay={exportMenu} trigger={["click"]}>
              <Button icon={<Download size={16} />}>Export</Button>
            </Dropdown>

            <Button
              icon={<RefreshCw size={16} />}
              onClick={handleRefresh}
              type="primary"
              loading={refreshKey % 10 === 0}
            >
              Refresh
            </Button>

            <Button
              icon={<Settings size={16} />}
              onClick={() => setDrawerVisible(true)}
              type="text"
            />
          </div>
        </div>

        {/* Executive KPI Dashboard with Advanced Metrics */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`hover:shadow-xl transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
              <div className="flex justify-between items-start">
                <div>
                  <div
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } mb-1`}
                  >
                    Total Revenue
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ₱{(totalRevenue / 1000000).toFixed(1)}M
                  </div>
                  <div className="flex items-center text-sm">
                    <TrendingUp size={14} className="text-green-600 mr-1" />
                    <span className="text-green-600 font-medium">
                      +{revenueTrend}%
                    </span>
                    <span
                      className={`ml-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      vs last period
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign size={24} className="text-green-600" />
                </div>
              </div>
              <Progress
                percent={78}
                showInfo={false}
                strokeColor="#10b981"
                size="small"
                className="mt-4"
              />
              <div
                className={`text-xs mt-2 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                78% of annual target achieved
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`hover:shadow-xl transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } mb-1`}
                  >
                    Occupancy Rate
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {avgOccupancy}%
                  </div>
                  <div className="flex items-center text-sm">
                    <Activity size={14} className="text-blue-600 mr-1" />
                    <span
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Optimal range
                    </span>
                  </div>
                </div>
                <div style={{ width: 80, height: 80 }}>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={performanceGaugeConfig(avgOccupancy, "Occupancy")}
                    key={`gauge-occupancy-${refreshKey}`}
                  />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`hover:shadow-xl transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
              <div className="flex justify-between items-start">
                <div>
                  <div
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } mb-1`}
                  >
                    Total Bookings
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {(totalBookings / 1000).toFixed(1)}K
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar size={14} className="text-purple-600 mr-1" />
                    <span className="text-purple-600 font-medium">+18%</span>
                    <span
                      className={`ml-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      this month
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Calendar size={24} className="text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex justify-between text-xs">
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  ADR: ₱{avgADR.toLocaleString()}
                </span>
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  RevPAR: ₱{avgRevPAR.toLocaleString()}
                </span>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`hover:shadow-xl transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } relative overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
              <div className="flex justify-between items-start">
                <div>
                  <div
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } mb-1`}
                  >
                    Customer Satisfaction
                  </div>
                  <div className="flex items-center mb-1">
                    <div className="text-3xl font-bold text-yellow-600">
                      {avgRating}
                    </div>
                    <div className="text-lg text-gray-500 ml-1">/5.0</div>
                  </div>
                  <div className="flex items-center">
                    <Star
                      size={14}
                      className="text-yellow-500 fill-current mr-1"
                    />
                    <Rate
                      disabled
                      defaultValue={parseFloat(avgRating)}
                      allowHalf
                      size="small"
                    />
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star size={24} className="text-yellow-600" />
                </div>
              </div>
              <Badge
                count="Excellent"
                style={{
                  backgroundColor: "#10b981",
                  fontSize: "11px",
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Advanced Analytics Tabs */}
        <Card
          className={`${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } mb-6`}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="advanced-tabs"
            tabBarExtraContent={
              <Space>
                <Tooltip title="Bookmark Current View">
                  <Button
                    type="text"
                    icon={<Bookmark size={16} />}
                    onClick={() => toggleBookmark(activeTab)}
                    className={
                      bookmarkedReports.includes(activeTab)
                        ? "text-blue-500"
                        : ""
                    }
                  />
                </Tooltip>
                <Badge count={bookmarkedReports.length} size="small">
                  <Eye
                    size={16}
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  />
                </Badge>
              </Space>
            }
          >
            <TabPane
              tab={
                <span className="flex items-center space-x-2">
                  <BarChart3 size={16} />
                  <span>Revenue Analytics</span>
                </span>
              }
              key="overview"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card
                    title="Revenue Growth Trend Analysis"
                    className={`shadow-sm ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                    extra={
                      <Space>
                        <Button size="small" icon={<TrendingUp size={14} />}>
                          Forecast
                        </Button>
                        <Button size="small" icon={<Download size={14} />}>
                          Export
                        </Button>
                      </Space>
                    }
                  >
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={revenueGrowthConfig}
                      key={`revenue-growth-${refreshKey}`}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Card
                    title="Revenue Breakdown"
                    className={`shadow-sm h-full ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={profitabilityWaterfallConfig}
                      key={`waterfall-${refreshKey}`}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[24, 24]} className="mt-6">
                <Col xs={24} lg={12}>
                  <Card
                    title="Customer Segments Analysis"
                    className={`shadow-sm ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                    extra={<Button size="small">Details</Button>}
                  >
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={customerSegmentConfig}
                      key={`segments-${refreshKey}`}
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card
                    title="Room Type Performance Matrix"
                    className={`shadow-sm ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={roomTypePerformanceConfig}
                      key={`room-performance-${refreshKey}`}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span className="flex items-center space-x-2">
                  <Activity size={16} />
                  <span>Operations</span>
                </span>
              }
              key="operations"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24}>
                  <Card
                    title="Occupancy Heatmap Analysis"
                    className={`shadow-sm ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                    extra={
                      <Space>
                        <Segmented
                          options={["Monthly", "Weekly", "Daily"]}
                          defaultValue="Monthly"
                          size="small"
                        />
                        <Button size="small" icon={<Download size={14} />}>
                          Export
                        </Button>
                      </Space>
                    }
                  >
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={occupancyHeatmapConfig}
                      key={`heatmap-${refreshKey}`}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[24, 24]} className="mt-6">
                <Col xs={24}>
                  <Card
                    title="Branch Performance Comparison"
                    className={`shadow-sm ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                    extra={
                      <Space>
                        <Button size="small" icon={<Filter size={14} />}>
                          Filter
                        </Button>
                        <Button size="small" icon={<Download size={14} />}>
                          Export
                        </Button>
                      </Space>
                    }
                  >
                    <Table
                      columns={branchColumns}
                      dataSource={branchPerformance}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} branches`,
                      }}
                      className="advanced-table"
                      scroll={{ x: 1200 }}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>Staff Performance</span>
                </span>
              }
              key="performance"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card
                    title="Staff Performance Overview"
                    className={`shadow-sm ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Table
                      columns={staffColumns}
                      dataSource={staffPerformance}
                      rowKey="id"
                      pagination={false}
                      className="advanced-table"
                    />
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Space direction="vertical" size="large" className="w-full">
                    <Card
                      title="Team Efficiency"
                      className={`shadow-sm ${
                        darkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div style={{ width: "100%", height: 200 }}>
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={performanceGaugeConfig(
                            89,
                            "Team Efficiency"
                          )}
                          key={`team-efficiency-${refreshKey}`}
                        />
                      </div>
                    </Card>

                    <Card
                      title="Customer Satisfaction"
                      className={`shadow-sm ${
                        darkMode
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div style={{ width: "100%", height: 200 }}>
                        <HighchartsReact
                          highcharts={Highcharts}
                          options={performanceGaugeConfig(
                            4.6,
                            "Satisfaction Score",
                            5
                          )}
                          key={`satisfaction-${refreshKey}`}
                        />
                      </div>
                    </Card>
                  </Space>
                </Col>
              </Row>
            </TabPane>

            <TabPane
              tab={
                <span className="flex items-center space-x-2">
                  <Target size={16} />
                  <span>Forecasts & Insights</span>
                </span>
              }
              key="forecasts"
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card
                    title="Revenue Forecast"
                    className={`shadow-sm ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="space-y-4">
                      <Alert
                        message="Forecast Analysis"
                        description="Based on historical data and current trends, revenue is expected to grow by 15-20% next quarter."
                        type="info"
                        showIcon
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            ₱15.2M
                          </div>
                          <div className="text-sm text-gray-500">
                            Next Quarter
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            ₱58.8M
                          </div>
                          <div className="text-sm text-gray-500">Next Year</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card
                    title="AI Insights & Recommendations"
                    className={`shadow-sm ${
                      darkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <List
                      dataSource={[
                        {
                          title: "Optimize Pricing Strategy",
                          description:
                            "Consider dynamic pricing for weekends in Manila Central",
                          priority: "high",
                          impact: "+12% revenue",
                        },
                        {
                          title: "Staff Training Program",
                          description:
                            "Guest services team needs additional training",
                          priority: "medium",
                          impact: "+0.3 rating",
                        },
                        {
                          title: "Marketing Campaign",
                          description: "Target business travelers in Q4",
                          priority: "high",
                          impact: "+25% bookings",
                        },
                      ]}
                      renderItem={(item, index) => (
                        <List.Item>
                          <div className="w-full">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {item.description}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge
                                  status={
                                    item.priority === "high"
                                      ? "error"
                                      : "warning"
                                  }
                                  text={item.priority}
                                />
                                <div className="text-sm font-medium text-green-600 mt-1">
                                  {item.impact}
                                </div>
                              </div>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>

        {/* Quick Actions & Alerts Panel */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title="Recent Alerts & Notifications"
              className={`shadow-sm ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
              extra={
                <Button size="small" onClick={() => setAlertsVisible(true)}>
                  View All
                </Button>
              }
            >
              <Timeline>
                {alerts.slice(0, 4).map((alert) => (
                  <Timeline.Item
                    key={alert.id}
                    color={
                      alert.type === "error"
                        ? "red"
                        : alert.type === "warning"
                        ? "orange"
                        : alert.type === "success"
                        ? "green"
                        : "blue"
                    }
                    dot={
                      alert.priority === "critical" ? (
                        <AlertTriangle size={14} />
                      ) : alert.type === "success" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <BellRing size={14} />
                      )
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-gray-500">
                          {alert.time}
                        </div>
                      </div>
                      <Badge
                        status={
                          alert.priority === "critical"
                            ? "error"
                            : alert.priority === "high"
                            ? "warning"
                            : "default"
                        }
                        text={alert.priority}
                      />
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Quick Actions"
              className={`shadow-sm ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <Space direction="vertical" size="middle" className="w-full">
                <Button type="primary" block icon={<FileText size={16} />}>
                  Generate Monthly Report
                </Button>
                <Button block icon={<Bell size={16} />}>
                  Set Performance Alerts
                </Button>
                <Button block icon={<Users size={16} />}>
                  Staff Performance Review
                </Button>
                <Button block icon={<Target size={16} />}>
                  Update Targets & KPIs
                </Button>
                <Button block icon={<Download size={16} />}>
                  Export Data Package
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Settings Drawer */}
        <Drawer
          title="Dashboard Settings"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
          width={400}
        >
          <div className="space-y-6">
            <div>
              <Title level={5}>Display Preferences</Title>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Dark Mode</span>
                  <Switch checked={darkMode} onChange={setDarkMode} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Real-time Updates</span>
                  <Switch
                    checked={realTimeUpdate}
                    onChange={setRealTimeUpdate}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Show Animations</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div>
              <Title level={5}>Notification Settings</Title>
              <div className="space-y-3">
                <Checkbox defaultChecked>High Priority Alerts</Checkbox>
                <Checkbox defaultChecked>Revenue Threshold Alerts</Checkbox>
                <Checkbox>Daily Performance Summary</Checkbox>
                <Checkbox>Weekly Reports</Checkbox>
              </div>
            </div>

            <div>
              <Title level={5}>Chart Preferences</Title>
              <div className="space-y-3">
                <div>
                  <div className="mb-2">Chart Animation Speed</div>
                  <Slider defaultValue={50} />
                </div>
                <Checkbox defaultChecked>Show Data Labels</Checkbox>
                <Checkbox defaultChecked>Enable Drill-down</Checkbox>
              </div>
            </div>

            <div>
              <Title level={5}>Export Settings</Title>
              <Radio.Group defaultValue="high" className="w-full">
                <Space direction="vertical">
                  <Radio value="high">High Quality</Radio>
                  <Radio value="medium">Medium Quality</Radio>
                  <Radio value="low">Low Quality (Fast)</Radio>
                </Space>
              </Radio.Group>
            </div>
          </div>
        </Drawer>

        {/* Filter Modal */}
        <Modal
          title="Advanced Filters"
          visible={filterModalVisible}
          onCancel={() => setFilterModalVisible(false)}
          footer={[
            <Button key="reset">Reset</Button>,
            <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="apply" type="primary">
              Apply Filters
            </Button>,
          ]}
          width={600}
        >
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Date Range">
                  <RangePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Branches">
                  <Select
                    mode="multiple"
                    placeholder="Select branches"
                    style={{ width: "100%" }}
                  >
                    {mockData.branches.map((branch) => (
                      <Option key={branch.branchId}>{branch.branchName}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </div>
  );
};
export default Dashboard;
