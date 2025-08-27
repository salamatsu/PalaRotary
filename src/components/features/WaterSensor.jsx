import React, { useState, useEffect } from "react";
import {
  Card,
  Badge,
  Button,
  Select,
  Switch,
  Descriptions,
  Modal,
  Alert,
} from "antd";
import {
  Droplets,
  Gauge,
  Activity,
  Zap,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Wifi,
  WifiOff,
  Battery,
  Settings,
  MapPin,
  Calendar,
  Thermometer,
  Wind,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const { Option } = Select;

// Water sensor configurations with real brands and models
const waterSensorTypes = {
  water_level: {
    icon: Gauge,
    unit: "m",
    name: "Water Level",
    brands: {
      "Hach FLOCDAR": {
        model: "FLOCDAR-2100",
        range: "0-15m",
        accuracy: "±2mm",
      },
      "Campbell Scientific": {
        model: "CS451-L",
        range: "0-9m",
        accuracy: "±3mm",
      },
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
      "Endress+Hauser": {
        model: "Proline Prosonic Flow 93P",
        range: "0-25 m³/s",
        accuracy: "±1%",
      },
      KROHNE: {
        model: "OPTISONIC 6300",
        range: "0-40 m³/s",
        accuracy: "±0.5%",
      },
      Siemens: {
        model: "SITRANS FUS1020",
        range: "0-20 m³/s",
        accuracy: "±1.5%",
      },
    },
  },
  water_pressure: {
    icon: Gauge,
    unit: "bar",
    name: "Water Pressure",
    brands: {
      Honeywell: {
        model: "MLH100PGB06A",
        range: "0-100 bar",
        accuracy: "±0.25%",
      },
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
      Hach: {
        model: "INTELLICAL PHC101",
        range: "0-14 pH",
        accuracy: "±0.1 pH",
      },
      YSI: { model: "EXO2 pH", range: "0-14 pH", accuracy: "±0.2 pH" },
      "Endress+Hauser": {
        model: "CPS11D",
        range: "0-14 pH",
        accuracy: "±0.05 pH",
      },
      "Mettler Toledo": {
        model: "InPro 4260 i",
        range: "0-14 pH",
        accuracy: "±0.1 pH",
      },
    },
  },
  water_temperature: {
    icon: Thermometer,
    unit: "°C",
    name: "Water Temperature",
    brands: {
      "Onset HOBO": {
        model: "U22-001",
        range: "-40 to +70°C",
        accuracy: "±0.2°C",
      },
      "Campbell Scientific": {
        model: "CS547A-L",
        range: "-50 to +70°C",
        accuracy: "±0.1°C",
      },
      Hach: { model: "LDO101", range: "-5 to +50°C", accuracy: "±0.15°C" },
      YSI: { model: "EXO2 Temp", range: "-5 to +50°C", accuracy: "±0.01°C" },
    },
  },
  turbidity: {
    icon: Eye,
    unit: "NTU",
    name: "Turbidity",
    brands: {
      Hach: {
        model: "SOLITAX HS-line sc",
        range: "0-4000 NTU",
        accuracy: "±2%",
      },
      YSI: { model: "EXO2 Turbidity", range: "0-4000 NTU", accuracy: "±5%" },
      "Endress+Hauser": {
        model: "Turbimax CUS52D",
        range: "0-4000 NTU",
        accuracy: "±2%",
      },
      KROHNE: {
        model: "OPTISYS TUR 1050",
        range: "0-4000 NTU",
        accuracy: "±1%",
      },
    },
  },
};

// Generate realistic water sensor data
const generateWaterSensorData = (sensorType, points = 20) => {
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
    const timestamp = new Date(now.getTime() - i * 10 * 60 * 1000); // 10-minute intervals
    const baseValue =
      config.min + (config.max - config.min) * (0.3 + Math.sin(i * 0.2) * 0.3);
    const variation = config.baseVariation * (Math.random() - 0.5);
    const value = Math.max(
      config.min,
      Math.min(config.max, baseValue + variation)
    );

    data.push({
      timestamp: timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: Math.round(value * 100) / 100,
      fullTimestamp: timestamp,
    });
  }

  return { data, config };
};

export const WaterSensorComponent = ({
  sensorId = "ws-001",
  sensorName = "Dam Level Sensor",
  sensorType = "water_level",
  location = "Main Dam - Section A",
  brand = "Hach FLOCDAR",
  model = "",
  chartType = "line",
  showChart = true,
  refreshInterval = 10000,
  thresholds = null,
  status = "online",
  customColor = "#0ea5e9",
  installationDate = "2023-01-15",
  signalStrength = "strong",
  deviceInfo = {},
}) => {
  const [sensorData, setSensorData] = useState([]);
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedChartType, setSelectedChartType] = useState(chartType);
  const [trend, setTrend] = useState("stable");
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);

  // Get sensor configuration
  const sensorConfig =
    waterSensorTypes[sensorType] || waterSensorTypes.water_level;
  const brandInfo =
    sensorConfig.brands[brand] || Object.values(sensorConfig.brands)[0];
  const actualModel = model || brandInfo.model;

  // Initialize sensor data
  useEffect(() => {
    const { data } = generateWaterSensorData(sensorType);
    setSensorData(data);
    setCurrentValue(data[data.length - 1]?.value || 0);
  }, [sensorType]);

  // Auto-refresh data
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      const { data } = generateWaterSensorData(sensorType);
      setSensorData(data);

      const newValue = data[data.length - 1]?.value || 0;
      const oldValue = currentValue;

      // Determine trend with sensor-specific thresholds
      const threshold =
        sensorType === "water_quality_ph"
          ? 0.1
          : sensorType === "water_temperature"
            ? 0.5
            : 0.2;

      if (newValue > oldValue + threshold) {
        setTrend("up");
      } else if (newValue < oldValue - threshold) {
        setTrend("down");
      } else {
        setTrend("stable");
      }

      setCurrentValue(newValue);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, currentValue, sensorType]);

  // Get sensor icon
  const IconComponent = sensorConfig.icon;

  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case "online":
        return { color: "green", text: "Online" };
      case "offline":
        return { color: "red", text: "Offline" };
      case "maintenance":
        return { color: "orange", text: "Maintenance" };
      case "warning":
        return { color: "orange", text: "Warning" };
      case "error":
        return { color: "red", text: "Error" };
      default:
        return { color: "blue", text: "Unknown" };
    }
  };

  // Check if value exceeds thresholds
  const getValueStatus = () => {
    if (!thresholds) return "normal";

    if (
      thresholds.critical &&
      (currentValue > thresholds.critical.max ||
        currentValue < thresholds.critical.min)
    ) {
      return "critical";
    }

    if (
      thresholds.warning &&
      (currentValue > thresholds.warning.max ||
        currentValue < thresholds.warning.min)
    ) {
      return "warning";
    }

    return "normal";
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get signal strength icon
  const getSignalIcon = () => {
    switch (signalStrength) {
      case "strong":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "weak":
        return <Wifi className="w-4 h-4 text-orange-500" />;
      case "none":
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  // Render chart
  const renderChart = () => {
    if (!showChart || !isVisible || sensorData.length === 0) return null;

    const chartProps = {
      data: sensorData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (selectedChartType) {
      case "area":
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip
              formatter={(value) => [
                `${value} ${sensorConfig.unit}`,
                sensorConfig.name,
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={customColor}
              fill={customColor}
              fillOpacity={0.3}
            />
            {thresholds?.warning?.max && (
              <ReferenceLine
                y={thresholds.warning.max}
                stroke="orange"
                strokeDasharray="5 5"
              />
            )}
            {thresholds?.critical?.max && (
              <ReferenceLine
                y={thresholds.critical.max}
                stroke="red"
                strokeDasharray="5 5"
              />
            )}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip
              formatter={(value) => [
                `${value} ${sensorConfig.unit}`,
                sensorConfig.name,
              ]}
            />
            <Bar dataKey="value" fill={customColor} />
          </BarChart>
        );

      default:
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip
              formatter={(value) => [
                `${value} ${sensorConfig.unit}`,
                sensorConfig.name,
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={customColor}
              strokeWidth={2}
              dot={{ fill: customColor, strokeWidth: 2, r: 4 }}
            />
            {thresholds?.warning?.max && (
              <ReferenceLine
                y={thresholds.warning.max}
                stroke="orange"
                strokeDasharray="5 5"
              />
            )}
            {thresholds?.critical?.max && (
              <ReferenceLine
                y={thresholds.critical.max}
                stroke="red"
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        );
    }
  };

  const statusConfig = getStatusConfig();
  const valueStatus = getValueStatus();

  return (
    <>
      <Card
        className={`w-full transition-all duration-300 ${valueStatus === "critical"
          ? "border-red-500 shadow-red-100"
          : valueStatus === "warning"
            ? "border-orange-500 shadow-orange-100"
            : "border-gray-200 hover:shadow-lg"
          }`}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconComponent
                className="w-6 h-6"
                style={{ color: customColor }}
              />
              <div>
                <div className="font-medium text-gray-800">{sensorName}</div>
                <div className="text-xs text-gray-500">
                  {brand} {actualModel}
                </div>
              </div>
            </div>
            <Badge color={statusConfig.color} text={statusConfig.text} />
          </div>
        }
        extra={
          <div className="flex items-center space-x-2">
            <Button
              type="text"
              icon={<Info className="w-4 h-4" />}
              onClick={() => setShowDeviceInfo(true)}
              className="p-1"
              title="Device Information"
            />
            <Button
              type="text"
              icon={
                isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )
              }
              onClick={() => setIsVisible(!isVisible)}
              className="p-1"
              title="Toggle Chart"
            />
          </div>
        }
      >
        <div className="space-y-4">
          {/* Current Value and Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Reading</div>
              <div className="flex items-center space-x-2">
                {getTrendIcon()}
                <span
                  className={`text-3xl font-bold ${valueStatus === "critical"
                    ? "text-red-600"
                    : valueStatus === "warning"
                      ? "text-orange-600"
                      : "text-gray-800"
                    }`}
                >
                  {currentValue} {sensorConfig.unit}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-1">
                {getSignalIcon()}
              </div>
              <div className="text-xs text-gray-500">
                <MapPin className="w-3 h-3 inline mr-1" />
                {location}
              </div>
            </div>
          </div>

          {/* Threshold Status Alert */}
          {valueStatus !== "normal" && (
            <Alert
              message={
                valueStatus === "critical"
                  ? "Critical Threshold Exceeded"
                  : "Warning Threshold Exceeded"
              }
              description={`Current value: ${currentValue} ${sensorConfig.unit}`}
              type={valueStatus === "critical" ? "error" : "warning"}
              showIcon
              className="text-sm"
            />
          )}

          {/* Threshold Display */}
          {thresholds && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {thresholds.warning && (
                <div className="p-2 bg-orange-50 rounded border border-orange-200">
                  <div className="text-orange-700 font-medium">
                    Warning Range
                  </div>
                  <div className="text-orange-600">
                    {thresholds.warning.min} - {thresholds.warning.max}{" "}
                    {sensorConfig.unit}
                  </div>
                </div>
              )}
              {thresholds.critical && (
                <div className="p-2 bg-red-50 rounded border border-red-200">
                  <div className="text-red-700 font-medium">Critical Range</div>
                  <div className="text-red-600">
                    {thresholds.critical.min} - {thresholds.critical.max}{" "}
                    {sensorConfig.unit}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chart Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                size="small"
                checked={showChart && isVisible}
                onChange={(checked) => setIsVisible(checked)}
              />
              <span className="text-sm text-gray-600">Show Chart</span>
            </div>
            <Select
              size="small"
              value={selectedChartType}
              onChange={setSelectedChartType}
              className="w-24"
            >
              <Option value="line">Line</Option>
              <Option value="area">Area</Option>
              <Option value="bar">Bar</Option>
            </Select>
          </div>

          {/* Chart */}
          {showChart && isVisible && (
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t">
            <span>ID: {sensorId}</span>
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </Card>

      {/* Device Information Modal */}
      <Modal
        title="Device Information"
        open={showDeviceInfo}
        onCancel={() => setShowDeviceInfo(false)}
        footer={null}
        width={600}

      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Sensor ID">{sensorId}</Descriptions.Item>
          <Descriptions.Item label="Status" span={1}>
            <Badge color={statusConfig.color} text={statusConfig.text} />
          </Descriptions.Item>

          <Descriptions.Item label="Device Type">
            {sensorConfig.name}
          </Descriptions.Item>
          <Descriptions.Item label="Manufacturer">{brand}</Descriptions.Item>

          <Descriptions.Item label="Model">{actualModel}</Descriptions.Item>
          <Descriptions.Item label="Measurement Range">
            {brandInfo.range}
          </Descriptions.Item>

          <Descriptions.Item label="Accuracy">
            {brandInfo.accuracy}
          </Descriptions.Item>
          <Descriptions.Item label="Units">
            {sensorConfig.unit}
          </Descriptions.Item>

          <Descriptions.Item label="Installation Date">
            <Calendar className="w-4 h-4 inline mr-1" />
            {new Date(installationDate).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            <MapPin className="w-4 h-4 inline mr-1" />
            {location}
          </Descriptions.Item>

          <Descriptions.Item label="Signal Strength">
            <span className=" flex">
              {getSignalIcon()}
              <span className="ml-1 capitalize">{signalStrength}</span>

            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Data Interval">
            {refreshInterval / 1000}s
          </Descriptions.Item>
          <Descriptions.Item label="Current Value">
            {currentValue} {sensorConfig.unit}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
};
