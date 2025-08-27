import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  Timeline,
  Tooltip,
  Typography
} from "antd";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Droplets,
  Eye,
  EyeOff,
  Filter,
  Gauge,
  GitMerge,
  Info,
  MapPin,
  Minus,
  Settings,
  Share2,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
  XCircle,
  Zap
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const { Option } = Select;
const { Text, Title } = Typography;
const { Panel } = Collapse;

// Water sensor configurations with real brands and models
const waterSensorTypes = {
  water_level: {
    icon: Gauge,
    unit: "m",
    name: "Water Level",
    brands: {
      "Hach FLOCDAR": { model: "FLOCDAR-2100", range: "0-15m", accuracy: "±2mm" },
      "Campbell Scientific": { model: "CS451-L", range: "0-9m", accuracy: "±3mm" },
      "OTT HydroMet": { model: "OTT PLS-C", range: "0-35m", accuracy: "±3mm" },
      Vega: { model: "VEGAPULS 64", range: "0-75m", accuracy: "±2mm" },
    },
  },
  water_flow: {
    icon: Activity,
    unit: "m³/s",
    name: "Flow Rate",
    brands: {
      Hach: { model: "FL900", range: "0-30 m³/s", accuracy: "±2%" },
      "Endress+Hauser": { model: "Proline Prosonic Flow 93P", range: "0-25 m³/s", accuracy: "±1%" },
      KROHNE: { model: "OPTISONIC 6300", range: "0-40 m³/s", accuracy: "±0.5%" },
      Siemens: { model: "SITRANS FUS1020", range: "0-20 m³/s", accuracy: "±1.5%" },
    },
  },
  water_pressure: {
    icon: Gauge,
    unit: "bar",
    name: "Water Pressure",
    brands: {
      Honeywell: { model: "MLH100PGB06A", range: "0-100 bar", accuracy: "±0.25%" },
      Keller: { model: "Series 33 X", range: "0-200 bar", accuracy: "±0.1%" },
      WIKA: { model: "S-20", range: "0-400 bar", accuracy: "±0.25%" },
      Druck: { model: "PTX 5072", range: "0-70 bar", accuracy: "±0.05%" },
    },
  },
  water_quality_ph: {
    icon: Droplets,
    unit: "pH",
    name: "pH Level",
    brands: {
      Hach: { model: "INTELLICAL PHC101", range: "0-14 pH", accuracy: "±0.1 pH" },
      YSI: { model: "EXO2 pH", range: "0-14 pH", accuracy: "±0.2 pH" },
      "Endress+Hauser": { model: "CPS11D", range: "0-14 pH", accuracy: "±0.05 pH" },
      "Mettler Toledo": { model: "InPro 4260 i", range: "0-14 pH", accuracy: "±0.1 pH" },
    },
  },
  water_temperature: {
    icon: Thermometer,
    unit: "°C",
    name: "Water Temperature",
    brands: {
      "Onset HOBO": { model: "U22-001", range: "-40 to +70°C", accuracy: "±0.2°C" },
      "Campbell Scientific": { model: "CS547A-L", range: "-50 to +70°C", accuracy: "±0.1°C" },
      Hach: { model: "LDO101", range: "-5 to +50°C", accuracy: "±0.15°C" },
      YSI: { model: "EXO2 Temp", range: "-5 to +50°C", accuracy: "±0.01°C" },
    },
  },
  turbidity: {
    icon: Eye,
    unit: "NTU",
    name: "Turbidity",
    brands: {
      Hach: { model: "SOLITAX HS-line sc", range: "0-4000 NTU", accuracy: "±2%" },
      YSI: { model: "EXO2 Turbidity", range: "0-4000 NTU", accuracy: "±5%" },
      "Endress+Hauser": { model: "Turbimax CUS52D", range: "0-4000 NTU", accuracy: "±2%" },
      KROHNE: { model: "OPTISYS TUR 1050", range: "0-4000 NTU", accuracy: "±1%" },
    },
  },
};

// Generate realistic water sensor data
const generateWaterSensorData = (sensorType, points = 24) => {
  const now = new Date();
  const data = [];

  const configs = {
    water_level: { min: 2.5, max: 8.2, baseVariation: 0.1 },
    water_flow: { min: 0.5, max: 15.8, baseVariation: 0.5 },
    water_pressure: { min: 1.2, max: 4.8, baseVariation: 0.1 },
    water_quality_ph: { min: 6.5, max: 8.5, baseVariation: 0.05 },
    water_temperature: { min: 8, max: 24, baseVariation: 0.2 },
    turbidity: { min: 0.5, max: 12.0, baseVariation: 0.3 },
  };

  const config = configs[sensorType] || configs.water_level;

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseValue = config.min + (config.max - config.min) * (0.3 + Math.sin(i * 0.2) * 0.3);
    const variation = config.baseVariation * (Math.random() - 0.5);
    const value = Math.max(config.min, Math.min(config.max, baseValue + variation));

    data.push({
      timestamp: timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: Math.round(value * 100) / 100,
      fullTimestamp: timestamp,
      hour: timestamp.getHours(),
    });
  }

  return { data, config };
};

// Enhanced Time Series Component with Ant Design
const MergedChartDrawer = ({ visible, onClose, sensors, allSensorsData }) => {
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [chartType, setChartType] = useState("line");
  const [normalizeData, setNormalizeData] = useState(false);
  const [timeRange, setTimeRange] = useState("24h");

  const availableColors = [
    "#1890ff", "#52c41a", "#722ed1", "#fa8c16", "#f5222d",
    "#13c2c2", "#a0d911", "#fa541c", "#eb2f96", "#597ef7"
  ];

  const getMergedData = useCallback(() => {
    if (selectedSensors.length === 0) return [];

    const timestamps = allSensorsData[selectedSensors[0]]?.map(d => d.timestamp) || [];

    return timestamps.map(timestamp => {
      const dataPoint = { timestamp };

      selectedSensors.forEach((sensorId, index) => {
        const sensorData = allSensorsData[sensorId];
        const sensor = sensors.find(s => s.sensorId === sensorId);
        const value = sensorData?.find(d => d.timestamp === timestamp)?.value || 0;

        if (normalizeData) {
          const max = sensor?.sensorType === "water_level" ? 10 :
            sensor?.sensorType === "water_flow" ? 20 :
              sensor?.sensorType === "water_pressure" ? 5 :
                sensor?.sensorType === "water_quality_ph" ? 14 :
                  sensor?.sensorType === "water_temperature" ? 30 : 100;
          const normalizedValue = (value / max) * 100;
          dataPoint[sensorId] = Math.max(0, Math.min(100, normalizedValue));
        } else {
          dataPoint[sensorId] = value;
        }
      });

      return dataPoint;
    });
  }, [selectedSensors, allSensorsData, normalizeData, sensors]);

  const renderChart = () => {
    const mergedData = getMergedData();
    const ChartComponent = chartType === "area" ? AreaChart :
      chartType === "bar" ? BarChart : LineChart;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={mergedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis label={{ value: normalizeData ? "Normalized (%)" : "Mixed Units", angle: -90, position: "insideLeft" }} />
          <RechartsTooltip
            formatter={(value, name) => {
              const sensor = sensors.find(s => s.sensorId === name);
              const unit = normalizeData ? "%" : waterSensorTypes[sensor?.sensorType]?.unit || "";
              return [`${value} ${unit}`, sensor?.sensorName || name];
            }}
          />
          <Legend formatter={(value) => sensors.find(s => s.sensorId === value)?.sensorName || value} />

          {selectedSensors.map((sensorId, index) => {
            const color = availableColors[index % availableColors.length];

            if (chartType === "area") {
              return (
                <Area
                  key={sensorId}
                  type="monotone"
                  dataKey={sensorId}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                />
              );
            } else if (chartType === "bar") {
              return <Bar key={sensorId} dataKey={sensorId} fill={color} />;
            } else {
              return (
                <Line
                  key={sensorId}
                  type="monotone"
                  dataKey={sensorId}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 2, r: 4 }}
                />
              );
            }
          })}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const sensorOptions = sensors.map(sensor => ({
    label: sensor.sensorName,
    value: sensor.sensorId,
    disabled: !allSensorsData[sensor.sensorId]?.length
  }));

  return (
    <Drawer
      title={
        <Space>
          <GitMerge className="w-5 h-5" />
          <span>Time Series Analysis</span>
        </Space>
      }
      width={1000}
      open={visible}
      onClose={onClose}
      extra={
        <Space>
          <Button icon={<Download />} size="small">Export</Button>
          <Button icon={<Share2 />} size="small">Share</Button>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Control Panel */}
        <Card size="small" title="Chart Configuration">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Sensors to Compare:</Text>
              <Checkbox.Group
                options={sensorOptions}
                value={selectedSensors}
                onChange={setSelectedSensors}
                style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}
              />
            </Col>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Chart Type:</Text>
                  <Select
                    value={chartType}
                    onChange={setChartType}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    <Option value="line">Line Chart</Option>
                    <Option value="area">Area Chart</Option>
                    <Option value="bar">Bar Chart</Option>
                  </Select>
                </div>
                <div>
                  <Text strong>Time Range:</Text>
                  <Select
                    value={timeRange}
                    onChange={setTimeRange}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    <Option value="1h">Last Hour</Option>
                    <Option value="6h">Last 6 Hours</Option>
                    <Option value="24h">Last 24 Hours</Option>
                    <Option value="7d">Last 7 Days</Option>
                  </Select>
                </div>
                <div>
                  <Switch
                    checked={normalizeData}
                    onChange={setNormalizeData}
                  />
                  <Text style={{ marginLeft: 8 }}>Normalize Data (0-100%)</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Chart Display */}
        <Card title={`Comparison Chart (${selectedSensors.length} sensors selected)`}>
          {selectedSensors.length > 0 ? (
            <div style={{ height: 400 }}>
              {renderChart()}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <BarChart3 style={{ width: 48, height: 48, margin: '0 auto 16px' }} />
              <div>Select sensors above to view comparison chart</div>
            </div>
          )}
        </Card>

        {/* Selected Sensors Summary */}
        {selectedSensors.length > 0 && (
          <Card size="small" title="Selected Sensors">
            <Row gutter={[8, 8]}>
              {selectedSensors.map((sensorId, index) => {
                const sensor = sensors.find(s => s.sensorId === sensorId);
                const color = availableColors[index % availableColors.length];
                return (
                  <Col key={sensorId} span={8}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: color,
                          marginRight: 8,
                          borderRadius: 2
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 12 }}>
                          {sensor?.sensorName}
                        </div>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {waterSensorTypes[sensor?.sensorType]?.unit}
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        )}
      </Space>
    </Drawer>
  );
};

// Enhanced Sensor Component with Ant Design
const WaterSensorCard = ({
  sensorId,
  sensorName,
  sensorType,
  location,
  brand,
  model,
  customColor,
  thresholds,
  status = "online",
  batteryLevel,
  signalStrength,
  onDataUpdate,
  allSensors
}) => {
  const [sensorData, setSensorData] = useState([]);
  const [currentValue, setCurrentValue] = useState(0);
  const [trend, setTrend] = useState("stable");
  const [showDetails, setShowDetails] = useState(false);
  const [chartVisible, setChartVisible] = useState(true);
  const [chartType, setChartType] = useState("line");

  const sensorConfig = waterSensorTypes[sensorType] || waterSensorTypes.water_level;
  const brandInfo = sensorConfig.brands[brand] || Object.values(sensorConfig.brands)[0];
  const IconComponent = sensorConfig.icon;

  useEffect(() => {
    const { data } = generateWaterSensorData(sensorType);
    setSensorData(data);
    setCurrentValue(data[data.length - 1]?.value || 0);

    if (onDataUpdate) {
      onDataUpdate(sensorId, data);
    }
  }, [sensorType, sensorId, onDataUpdate]);

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const { data } = generateWaterSensorData(sensorType);
      setSensorData(prevData => {
        const newValue = data[data.length - 1]?.value || 0;
        const oldValue = prevData[prevData.length - 1]?.value || 0;

        const threshold = sensorType === "water_quality_ph" ? 0.1 :
          sensorType === "water_temperature" ? 0.5 : 0.2;

        if (newValue > oldValue + threshold) setTrend("up");
        else if (newValue < oldValue - threshold) setTrend("down");
        else setTrend("stable");

        setCurrentValue(newValue);
        return data;
      });

      if (onDataUpdate) {
        onDataUpdate(sensorId, data);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [sensorType, sensorId, onDataUpdate]);

  const getStatusConfig = () => {
    switch (status) {
      case "online": return { color: "success", text: "Online", icon: CheckCircle };
      case "offline": return { color: "error", text: "Offline", icon: XCircle };
      case "maintenance": return { color: "warning", text: "Maintenance", icon: Settings };
      case "warning": return { color: "warning", text: "Warning", icon: AlertTriangle };
      default: return { color: "default", text: "Unknown", icon: Clock };
    }
  };

  const getValueStatus = () => {
    if (!thresholds) return "normal";

    if (thresholds.critical &&
      (currentValue > thresholds.critical.max || currentValue < thresholds.critical.min)) {
      return "error";
    }

    if (thresholds.warning &&
      (currentValue > thresholds.warning.max || currentValue < thresholds.warning.min)) {
      return "warning";
    }

    return "success";
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4" style={{ color: '#52c41a' }} />;
      case "down": return <TrendingDown className="w-4 h-4" style={{ color: '#f5222d' }} />;
      default: return <Minus className="w-4 h-4" style={{ color: '#999' }} />;
    }
  };

  const getBatteryStatus = () => {
    if (batteryLevel > 60) return "success";
    if (batteryLevel > 30) return "warning";
    return "exception";
  };

  const getSignalIcon = () => {
    const props = { className: "w-4 h-4" };
    switch (signalStrength) {
      case "strong": return <Wifi {...props} style={{ color: '#52c41a' }} />;
      case "weak": return <Wifi {...props} style={{ color: '#fa8c16' }} />;
      case "none": return <WifiOff {...props} style={{ color: '#f5222d' }} />;
      default: return <Wifi {...props} style={{ color: '#999' }} />;
    }
  };

  const renderChart = () => {
    if (!chartVisible || sensorData.length === 0) return null;

    const ChartComponent = chartType === "area" ? AreaChart :
      chartType === "bar" ? BarChart : LineChart;

    return (
      <ResponsiveContainer width="100%" height={200}>
        <ChartComponent data={sensorData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <RechartsTooltip
            formatter={(value) => [`${value} ${sensorConfig.unit}`, sensorConfig.name]}
          />

          {chartType === "area" ? (
            <Area
              type="monotone"
              dataKey="value"
              stroke={customColor}
              fill={customColor}
              fillOpacity={0.3}
            />
          ) : chartType === "bar" ? (
            <Bar dataKey="value" fill={customColor} />
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={customColor}
              strokeWidth={2}
              dot={{ fill: customColor, strokeWidth: 2, r: 4 }}
            />
          )}

          {thresholds?.warning?.max && (
            <ReferenceLine y={thresholds.warning.max} stroke="#fa8c16" strokeDasharray="5 5" />
          )}
          {thresholds?.critical?.max && (
            <ReferenceLine y={thresholds.critical.max} stroke="#f5222d" strokeDasharray="5 5" />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const statusConfig = getStatusConfig();
  const valueStatus = getValueStatus();
  const StatusIcon = statusConfig.icon;

  return (
    <>
      {/* <Badge.Ribbon
        text={statusConfig.text}
        color={statusConfig.color}
        style={{ top: 8, right: 8 }}
      > */}
      <Card
        size="small"
        title={
          <Space size="small">
            <IconComponent className="w-5 h-5" style={{ color: customColor }} />
            <div>
              <div style={{ fontWeight: 600 }}>{sensorName}</div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {brand} {model || brandInfo.model}
              </Text>
            </div>
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Device Details">
              <Button
                type="text"
                size="small"
                icon={<Info className="w-4 h-4" />}
                onClick={() => setShowDetails(true)}
              />
            </Tooltip>
            <Tooltip title={chartVisible ? "Hide Chart" : "Show Chart"}>
              <Button
                type="text"
                size="small"
                icon={chartVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onClick={() => setChartVisible(!chartVisible)}
              />
            </Tooltip>
          </Space>
        }
        styles={{
          body: { padding: '12px' }
        }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {/* Current Reading */}
          <div style={{
            padding: '12px',
            background: '#fafafa',
            borderRadius: '6px',
            border: `1px solid ${valueStatus === 'error' ? '#ff4d4f' :
              valueStatus === 'warning' ? '#faad14' : '#d9d9d9'}`
          }}>
            <Row justify="space-between" align="middle">
              <Col>
                <div style={{ marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Current Reading</Text>
                </div>
                <Space align="center">
                  {getTrendIcon()}
                  <Statistic
                    value={currentValue}
                    suffix={sensorConfig.unit}
                    valueStyle={{
                      fontSize: 24,
                      color: valueStatus === 'error' ? '#f5222d' :
                        valueStatus === 'warning' ? '#fa8c16' : '#262626'
                    }}
                  />
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" size={4} align="end">
                  <Space size={4}>
                    {getSignalIcon()}
                    <Text style={{ fontSize: 11 }}>{signalStrength}</Text>
                  </Space>
                  {/* <Space size={4}>
                      <Battery className="w-3 h-3" />
                      <Progress
                        percent={batteryLevel}
                        size="small"
                        status={getBatteryStatus()}
                        style={{ width: 60 }}
                        showInfo={false}
                      />
                    </Space> */}
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    <MapPin className="w-3 h-3 inline" /> {location.split(' - ')[0]}
                  </Text>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Alert Messages */}
          {valueStatus !== "success" && (
            <Alert
              message={valueStatus === "error" ? "Critical Alert" : "Warning Alert"}
              description={`Reading: ${currentValue} ${sensorConfig.unit}`}
              type={valueStatus}
              showIcon
              style={{ fontSize: 12 }}
            />
          )}

          {/* Thresholds */}
          {thresholds && (
            <Row gutter={8}>
              {thresholds.warning && (
                <Col span={12}>
                  <div style={{
                    padding: 6,
                    background: '#fff7e6',
                    border: '1px solid #ffd591',
                    borderRadius: 4,
                    textAlign: 'center'
                  }}>
                    <Text style={{ fontSize: 10, color: '#d46b08' }}>Warning</Text>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>
                      {thresholds.warning.min}-{thresholds.warning.max} {sensorConfig.unit}
                    </div>
                  </div>
                </Col>
              )}
              {thresholds.critical && (
                <Col span={12}>
                  <div style={{
                    padding: 6,
                    background: '#fff2f0',
                    border: '1px solid #ffccc7',
                    borderRadius: 4,
                    textAlign: 'center'
                  }}>
                    <Text style={{ fontSize: 10, color: '#cf1322' }}>Critical</Text>
                    <div style={{ fontSize: 11, fontWeight: 500 }}>
                      {thresholds.critical.min}-{thresholds.critical.max} {sensorConfig.unit}
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          )}

          {/* Chart Controls */}
          <Row justify="space-between" align="middle">
            <Col>
              <Switch
                size="small"
                checked={chartVisible}
                onChange={setChartVisible}
                checkedChildren="Chart"
                unCheckedChildren="Chart"
              />
            </Col>
            <Col>
              <Select
                size="small"
                value={chartType}
                onChange={setChartType}
                style={{ width: 80 }}
              >
                <Option value="line">Line</Option>
                <Option value="area">Area</Option>
                <Option value="bar">Bar</Option>
              </Select>
            </Col>
          </Row>

          {/* Chart */}
          {chartVisible && (
            <div style={{ height: 200, marginTop: 8 }}>
              {renderChart()}
            </div>
          )}

          {/* Footer */}
          <Divider style={{ margin: '8px 0' }} />
          <Row justify="space-between">
            <Col>
              <Text type="secondary" style={{ fontSize: 11 }}>ID: {sensorId}</Text>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Updated: {new Date().toLocaleTimeString()}
              </Text>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Device Details Drawer */}
      <Drawer
        title={
          <Space>
            <IconComponent className="w-5 h-5" style={{ color: customColor }} />
            <span>{sensorName} Details</span>
          </Space>
        }
        width={500}
        open={showDetails}
        onClose={() => setShowDetails(false)}
        extra={
          <Space>
            <Tag color={statusConfig.color}>
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {statusConfig.text}
            </Tag>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Device Overview */}
          <Card title="Device Overview" size="small">
            <Descriptions
              bordered
              column={1}
              size="small"
              items={[
                { label: 'Sensor ID', children: <Text code>{sensorId}</Text> },
                { label: 'Device Type', children: sensorConfig.name },
                { label: 'Manufacturer', children: brand },
                { label: 'Model', children: model || brandInfo.model },
                { label: 'Measurement Range', children: brandInfo.range },
                { label: 'Accuracy', children: brandInfo.accuracy },
                { label: 'Units', children: sensorConfig.unit },
                {
                  label: 'Location',
                  children: (
                    <Space>
                      <MapPin className="w-4 h-4" />
                      <span>{location}</span>
                    </Space>
                  )
                },
                {
                  label: 'Installation Date',
                  children: (
                    <Space>
                      <Calendar className="w-4 h-4" />
                      <span>Jan 15, 2023</span>
                    </Space>
                  )
                }
              ]}
            />
          </Card>

          {/* Current Status */}
          <Card title="Current Status" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Current Reading"
                  value={currentValue}
                  suffix={sensorConfig.unit}
                  prefix={getTrendIcon()}
                  valueStyle={{ color: customColor }}
                />
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Signal Strength</Text>
                    <div style={{ marginTop: 4 }}>
                      <Space>
                        {getSignalIcon()}
                        <Text style={{ textTransform: 'capitalize' }}>{signalStrength}</Text>
                      </Space>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Battery Level</Text>
                    <div style={{ marginTop: 4 }}>
                      <Progress
                        percent={batteryLevel}
                        status={getBatteryStatus()}
                        size="small"
                      />
                    </div>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity" size="small">
            <Timeline
              size="small"
              items={[
                {
                  children: `Reading updated: ${currentValue} ${sensorConfig.unit}`,
                  color: 'blue'
                },
                {
                  children: `Status: ${statusConfig.text}`,
                  color: statusConfig.color
                },
                {
                  children: `Battery level: ${batteryLevel}%`,
                  color: batteryLevel > 30 ? 'green' : 'orange'
                },
                {
                  children: 'Device calibrated',
                  color: 'gray'
                }
              ]}
            />
          </Card>

          {/* Threshold Configuration */}
          {thresholds && (
            <Card title="Threshold Configuration" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {thresholds.warning && (
                  <Alert
                    message="Warning Threshold"
                    description={`${thresholds.warning.min} - ${thresholds.warning.max} ${sensorConfig.unit}`}
                    type="warning"
                    showIcon
                  />
                )}
                {thresholds.critical && (
                  <Alert
                    message="Critical Threshold"
                    description={`${thresholds.critical.min} - ${thresholds.critical.max} ${sensorConfig.unit}`}
                    type="error"
                    showIcon
                  />
                )}
              </Space>
            </Card>
          )}

          {/* Actions */}
          <Card title="Actions" size="small">
            <Space wrap>
              <Button icon={<Settings />} size="small">Calibrate</Button>
              <Button icon={<Download />} size="small">Export Data</Button>
              <Button icon={<AlertTriangle />} size="small">Test Alert</Button>
              <Button icon={<Zap />} size="small">Reset</Button>
            </Space>
          </Card>
        </Space>
      </Drawer>
    </>
  );
};

// Main Dashboard Component
const WaterMonitoringDashboard = () => {
  const [allSensorsData, setAllSensorsData] = useState({});
  const [showMergeDrawer, setShowMergeDrawer] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');

  const waterSensors = [
    {
      sensorId: "DAM-WL-001",
      sensorName: "Main Dam Water Level",
      sensorType: "water_level",
      location: "Main Dam - North Section",
      brand: "OTT HydroMet",
      model: "OTT PLS-C",
      customColor: "#1890ff",
      thresholds: { warning: { min: 3.0, max: 7.5 }, critical: { min: 2.0, max: 8.5 } },
      batteryLevel: 92,
      signalStrength: "strong",
      status: "online"
    },
    {
      sensorId: "DAM-FL-002",
      sensorName: "Spillway Flow Rate",
      sensorType: "water_flow",
      location: "Main Dam - Spillway",
      brand: "KROHNE",
      model: "OPTISONIC 6300",
      customColor: "#52c41a",
      thresholds: { warning: { min: 0.5, max: 12.0 }, critical: { min: 0.1, max: 18.0 } },
      batteryLevel: 78,
      signalStrength: "strong",
      status: "online"
    },
    {
      sensorId: "DIST-PR-003",
      sensorName: "Distribution Pressure",
      sensorType: "water_pressure",
      location: "Distribution Hub A",
      brand: "Keller",
      model: "Series 33 X",
      customColor: "#722ed1",
      thresholds: { warning: { min: 1.5, max: 4.0 }, critical: { min: 1.0, max: 5.0 } },
      batteryLevel: 45,
      signalStrength: "weak",
      status: "warning"
    },
    {
      sensorId: "QUAL-PH-004",
      sensorName: "Water Quality pH",
      sensorType: "water_quality_ph",
      location: "Treatment Plant - Outlet",
      brand: "Endress+Hauser",
      model: "CPS11D",
      customColor: "#fa8c16",
      thresholds: { warning: { min: 6.8, max: 8.2 }, critical: { min: 6.5, max: 8.5 } },
      batteryLevel: 88,
      signalStrength: "strong",
      status: "online"
    },
    {
      sensorId: "TEMP-WT-005",
      sensorName: "Reservoir Temperature",
      sensorType: "water_temperature",
      location: "Main Reservoir - Center",
      brand: "YSI",
      model: "EXO2 Temp",
      customColor: "#f5222d",
      thresholds: { warning: { min: 5, max: 25 }, critical: { min: 2, max: 30 } },
      batteryLevel: 15,
      signalStrength: "strong",
      status: "online"
    },
    {
      sensorId: "TURB-001",
      sensorName: "Water Turbidity",
      sensorType: "turbidity",
      location: "Intake - Primary Filter",
      brand: "Hach",
      model: "SOLITAX HS-line sc",
      customColor: "#13c2c2",
      thresholds: { warning: { min: 0, max: 5.0 }, critical: { min: 0, max: 10.0 } },
      batteryLevel: 72,
      signalStrength: "strong",
      status: "maintenance"
    },
  ];

  const handleSensorDataUpdate = useCallback((sensorId, data) => {
    setAllSensorsData(prev => ({ ...prev, [sensorId]: data }));
  }, []);

  const getScenarios = () => [
    {
      key: 'dam_ops',
      name: "Dam Operations",
      description: "Water level and flow rate correlation",
      sensors: ["DAM-WL-001", "DAM-FL-002"],
      icon: Activity,
      color: "#1890ff"
    },
    {
      key: 'water_quality',
      name: "Water Quality Analysis",
      description: "pH, temperature, and turbidity monitoring",
      sensors: ["QUAL-PH-004", "TEMP-WT-005", "TURB-001"],
      icon: Droplets,
      color: "#52c41a"
    },
    {
      key: 'distribution',
      name: "Distribution System",
      description: "Pressure and flow monitoring",
      sensors: ["DIST-PR-003", "DAM-FL-002"],
      icon: Gauge,
      color: "#722ed1"
    },
    {
      key: 'environmental',
      name: "Environmental Monitoring",
      description: "Temperature and turbidity trends",
      sensors: ["TEMP-WT-005", "TURB-001"],
      icon: Thermometer,
      color: "#fa8c16"
    },
  ];

  const getSystemStats = () => {
    const online = waterSensors.filter(s => s.status === "online").length;
    const warnings = waterSensors.filter(s => s.status === "warning").length;
    const lowBattery = waterSensors.filter(s => s.batteryLevel < 20).length;
    const maintenance = waterSensors.filter(s => s.status === "maintenance").length;

    return { online, warnings, lowBattery, maintenance, total: waterSensors.length };
  };

  const filteredSensors = waterSensors.filter(sensor => {
    if (filterStatus === 'all') return true;
    return sensor.status === filterStatus;
  });

  const stats = getSystemStats();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e6f7ff 0%, #f6ffed 100%)',
      padding: '24px'
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="large">
                <div>
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    <Droplets className="w-8 h-8 inline mr-3" />
                    Water Management System
                  </Title>
                  <Text type="secondary">Dam & Distribution Network Monitoring Dashboard</Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<Settings width={16} height={16} />}
                  onClick={() => setShowControlPanel(true)}
                >
                  Controls
                </Button>
                <Button
                  type="primary"
                  icon={<GitMerge />}
                  onClick={() => setShowMergeDrawer(true)}
                  size="large"
                >
                  Merge Charts
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* System Statistics */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={6}>
              <Statistic
                title="Active Sensors"
                value={stats.online}
                suffix={`/ ${stats.total}`}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircle className="w-4 h-4" />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Warnings"
                value={stats.warnings}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<AlertTriangle className="w-4 h-4" />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="Maintenance"
                value={stats.maintenance}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<Settings className="w-4 h-4" />}
              />
            </Col>
          </Row>
        </Card>

        {/* Analysis Scenarios */}
        <Card
          title="Quick Analysis Scenarios"
          size="small"
          style={{ marginBottom: 24 }}
          extra={
            <Space>
              <Text type="secondary">Select a scenario for quick analysis</Text>
            </Space>
          }
        >
          <Row gutter={[12, 12]}>
            {getScenarios().map((scenario) => (
              <Col xs={24} sm={12} lg={6} key={scenario.key}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => {
                    setSelectedScenario(scenario);
                    setShowMergeDrawer(true);
                  }}
                  style={{
                    borderColor: scenario.color,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  styles={{
                    body: { padding: '12px' }
                  }}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space>
                      <scenario.icon
                        className="w-4 h-4"
                        style={{ color: scenario.color }}
                      />
                      <Text strong style={{ fontSize: 13 }}>{scenario.name}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {scenario.description}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Space size={4} wrap>
                        {scenario.sensors.slice(0, 2).map((sensorId) => {
                          const sensor = waterSensors.find(s => s.sensorId === sensorId);
                          return (
                            <Tag
                              key={sensorId}
                              size="small"
                              color={scenario.color}
                              style={{ margin: 0, fontSize: 10 }}
                            >
                              {sensor?.sensorName?.split(' ').slice(0, 2).join(' ')}
                            </Tag>
                          );
                        })}
                        {scenario.sensors.length > 2 && (
                          <Tag size="small" style={{ margin: 0, fontSize: 10 }}>
                            +{scenario.sensors.length - 2}
                          </Tag>
                        )}
                      </Space>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Filter Controls */}
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text>Filter by status:</Text>
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">All Sensors</Option>
                  <Option value="online">Online</Option>
                  <Option value="warning">Warning</Option>
                  <Option value="maintenance">Maintenance</Option>
                  <Option value="offline">Offline</Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Text>View:</Text>
                <Select
                  value={viewMode}
                  onChange={setViewMode}
                  style={{ width: 100 }}
                  size="small"
                >
                  <Option value="grid">Grid</Option>
                  <Option value="list">List</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Sensors Display */}
        <Row gutter={[16, 16]}>
          {filteredSensors.map((sensor) => (
            <Col
              key={sensor.sensorId}
              xs={24}
              sm={24}
              md={viewMode === 'grid' ? 12 : 24}
              lg={viewMode === 'grid' ? 8 : 24}
              xl={viewMode === 'grid' ? 8 : 24}
            >
              <WaterSensorCard
                {...sensor}
                onDataUpdate={handleSensorDataUpdate}
                allSensors={waterSensors}
              />
            </Col>
          ))}
        </Row>

        {/* Control Panel Drawer */}
        <Drawer
          title="System Control Panel"
          width={400}
          open={showControlPanel}
          onClose={() => setShowControlPanel(false)}
          extra={
            <Space>
              <Button icon={<Download />} size="small">Export</Button>
            </Space>
          }
        >
          <Collapse defaultActiveKey={['alerts', 'maintenance']}>
            <Panel header="System Alerts" key="alerts">
              <Timeline
                size="small"
                items={[
                  {
                    children: 'Battery low on TEMP-WT-005',
                    color: 'red'
                  },
                  {
                    children: 'DIST-PR-003 pressure warning',
                    color: 'orange'
                  },
                  {
                    children: 'TURB-001 maintenance scheduled',
                    color: 'blue'
                  },
                  {
                    children: 'All systems calibrated',
                    color: 'green'
                  }
                ]}
              />
            </Panel>

            <Panel header="Maintenance Schedule" key="maintenance">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="Upcoming Maintenance"
                  description="TURB-001 scheduled for calibration tomorrow"
                  type="info"
                  showIcon
                />
                <Alert
                  message="Battery Replacement"
                  description="TEMP-WT-005 battery needs replacement"
                  type="warning"
                  showIcon
                />
              </Space>
            </Panel>

            <Panel header="System Settings" key="settings">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text>Data Refresh Interval</Text>
                  <Select
                    defaultValue="30s"
                    style={{ width: '100%', marginTop: 4 }}
                    size="small"
                  >
                    <Option value="10s">10 seconds</Option>
                    <Option value="30s">30 seconds</Option>
                    <Option value="1m">1 minute</Option>
                    <Option value="5m">5 minutes</Option>
                  </Select>
                </div>
                <div>
                  <Text>Alert Notifications</Text>
                  <div style={{ marginTop: 8 }}>
                    <Switch size="small" defaultChecked /> <Text style={{ marginLeft: 8 }}>Email Alerts</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Switch size="small" defaultChecked /> <Text style={{ marginLeft: 8 }}>SMS Alerts</Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Switch size="small" /> <Text style={{ marginLeft: 8 }}>Push Notifications</Text>
                  </div>
                </div>
              </Space>
            </Panel>
          </Collapse>
        </Drawer>

        {/* Time Series Drawer */}
        <MergedChartDrawer
          visible={showMergeDrawer}
          onClose={() => {
            setShowMergeDrawer(false);
            setSelectedScenario(null);
          }}
          sensors={waterSensors}
          allSensorsData={allSensorsData}
        />
      </div>
    </div>
  );
};

export default WaterMonitoringDashboard;