import { Droplets } from "lucide-react";
import { WaterSensorComponent } from "../components/features/WaterSensor";

const WaterMonitoringDashboard = () => {
  const waterSensors = [
    {
      sensorId: "DAM-WL-001",
      sensorName: "Main Dam Water Level",
      sensorType: "water_level",
      location: "Main Dam - North Section",
      brand: "OTT HydroMet",
      model: "OTT PLS-C",
      customColor: "#0ea5e9",
      thresholds: {
        warning: { min: 3.0, max: 7.5 },
        critical: { min: 2.0, max: 8.5 },
      },
      batteryLevel: 92,
      signalStrength: "strong",
    },
    {
      sensorId: "DAM-FL-002",
      sensorName: "Spillway Flow Rate",
      sensorType: "water_flow",
      location: "Main Dam - Spillway",
      brand: "KROHNE",
      model: "OPTISONIC 6300",
      customColor: "#10b981",
      chartType: "area",
      thresholds: {
        warning: { min: 0.5, max: 12.0 },
        critical: { min: 0.1, max: 18.0 },
      },
      batteryLevel: 78,
      signalStrength: "strong",
    },
    {
      sensorId: "DIST-PR-003",
      sensorName: "Distribution Pressure",
      sensorType: "water_pressure",
      location: "Distribution Hub A",
      brand: "Keller",
      model: "Series 33 X",
      customColor: "#8b5cf6",
      thresholds: {
        warning: { min: 1.5, max: 4.0 },
        critical: { min: 1.0, max: 5.0 },
      },
      batteryLevel: 65,
      signalStrength: "weak",
      status: "warning",
    },
    {
      sensorId: "QUAL-PH-004",
      sensorName: "Water Quality pH",
      sensorType: "water_quality_ph",
      location: "Treatment Plant - Outlet",
      brand: "Endress+Hauser",
      model: "CPS11D",
      customColor: "#f59e0b",
      thresholds: {
        warning: { min: 6.8, max: 8.2 },
        critical: { min: 6.5, max: 8.5 },
      },
      batteryLevel: 88,
      signalStrength: "strong",
    },
    {
      sensorId: "TEMP-WT-005",
      sensorName: "Reservoir Temperature",
      sensorType: "water_temperature",
      location: "Main Reservoir - Center",
      brand: "YSI",
      model: "EXO2 Temp",
      customColor: "#ef4444",
      thresholds: {
        warning: { min: 5, max: 25 },
        critical: { min: 2, max: 30 },
      },
      batteryLevel: 45,
      signalStrength: "strong",
    },
    {
      sensorId: "TURB-001",
      sensorName: "Water Turbidity",
      sensorType: "turbidity",
      location: "Intake - Primary Filter",
      brand: "Hach",
      model: "SOLITAX HS-line sc",
      customColor: "#06b6d4",
      thresholds: {
        warning: { min: 0, max: 5.0 },
        critical: { min: 0, max: 10.0 },
      },
      batteryLevel: 72,
      signalStrength: "strong",
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <Droplets className="w-8 h-8 text-blue-600 mr-3" />
            Water Management System
          </h1>
          <p className="text-gray-600 mt-2">
            Dam & Distribution Network Monitoring Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {waterSensors.map((sensor) => (
            <WaterSensorComponent key={sensor.sensorId} {...sensor} />
          ))}
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            System Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {waterSensors.filter((s) => s.status !== "offline").length}
              </div>
              <div className="text-gray-600">Active Sensors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {waterSensors.filter((s) => s.status === "warning").length}
              </div>
              <div className="text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {waterSensors.length}
              </div>
              <div className="text-gray-600">Total Sensors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterMonitoringDashboard;
