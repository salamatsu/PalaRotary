import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Activity, Clock, Download, Droplets, Gauge, MapPin, Shield, Thermometer, TrendingUp, Wind, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Enable additional Highcharts modules


const Dashboard = () => {
  const [currentData, setCurrentData] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedSite, setSelectedSite] = useState('North Dam');
  const [viewMode, setViewMode] = useState('realtime');
  const [alerts, setAlerts] = useState([]);
  const dashboardRef = useRef();

  const damSites = [
    { id: 'north', name: 'North Dam', capacity: '125M m³', status: 'operational' },
    { id: 'east', name: 'East Dam', capacity: '98M m³', status: 'operational' },
    { id: 'south', name: 'South Dam', capacity: '156M m³', status: 'maintenance' }
  ];

  // Critical thresholds for dam safety
  const safetyThresholds = {
    waterLevel: { min: 60, max: 85, critical: 90 },
    discharge: { min: 500, max: 2500, critical: 3000 },
    seepage: { normal: 0.05, warning: 0.15, critical: 0.25 },
    pressure: { min: 2.0, max: 6.5, critical: 7.0 },
    temperature: { min: 5, max: 25, critical: 30 },
    ph: { min: 6.5, max: 8.5 },
    turbidity: { normal: 2, warning: 5, critical: 10 },
    vibration: { normal: 0.02, warning: 0.05, critical: 0.1 },
    tiltX: { normal: 0.001, warning: 0.003, critical: 0.005 },
    tiltY: { normal: 0.001, warning: 0.003, critical: 0.005 }
  };

  // Generate realistic sensor data
  const generateSensorData = () => {
    const baseTime = new Date();
    const data = [];

    for (let i = 0; i < 24; i++) {
      const time = new Date(baseTime - (23 - i) * 60 * 60 * 1000);
      data.push({
        time: time.getTime(),
        timestamp: time.toLocaleTimeString('en-US', { hour12: false }),
        waterLevel: 75 + Math.sin(i * 0.3) * 5 + (Math.random() - 0.5) * 2,
        discharge: 1200 + Math.sin(i * 0.2) * 300 + (Math.random() - 0.5) * 100,
        seepage: 0.08 + Math.sin(i * 0.1) * 0.02 + (Math.random() - 0.5) * 0.01,
        pressure: 4.2 + Math.sin(i * 0.4) * 0.8 + (Math.random() - 0.5) * 0.3,
        temperature: 18 + Math.sin(i * 0.5) * 3 + (Math.random() - 0.5) * 1,
        ph: 7.2 + Math.sin(i * 0.3) * 0.3 + (Math.random() - 0.5) * 0.2,
        turbidity: 1.5 + Math.sin(i * 0.2) * 0.8 + (Math.random() - 0.5) * 0.5,
        vibration: 0.025 + Math.sin(i * 0.6) * 0.015 + (Math.random() - 0.5) * 0.005,
        tiltX: 0.002 + Math.sin(i * 0.2) * 0.0008 + (Math.random() - 0.5) * 0.0003,
        tiltY: 0.0015 + Math.sin(i * 0.3) * 0.0006 + (Math.random() - 0.5) * 0.0002,
        powerConsumption: 450 + Math.sin(i * 0.4) * 50 + (Math.random() - 0.5) * 20,
        windSpeed: 12 + Math.sin(i * 0.3) * 5 + (Math.random() - 0.5) * 3
      });
    }
    return data;
  };

  // Status determination function
  const getStatus = (sensor, value) => {
    const threshold = safetyThresholds[sensor];
    if (!threshold) return 'normal';

    if (sensor === 'ph') {
      return value < threshold.min || value > threshold.max ? 'warning' : 'normal';
    }

    if (threshold.critical && value > threshold.critical) return 'critical';
    if (threshold.warning && value > threshold.warning) return 'warning';
    if (threshold.max && value > threshold.max) return 'warning';
    if (threshold.min && value < threshold.min) return 'warning';

    return 'normal';
  };

  // Generate alerts based on current data
  const generateAlerts = (data) => {
    const newAlerts = [];
    const latest = data[data.length - 1];

    if (!latest) return [];

    Object.keys(safetyThresholds).forEach(sensor => {
      const status = getStatus(sensor, latest[sensor]);
      if (status !== 'normal') {
        newAlerts.push({
          id: Math.random(),
          sensor,
          value: latest[sensor],
          status,
          message: `${sensor.toUpperCase()} ${status === 'critical' ? 'CRITICAL' : 'WARNING'}: ${latest[sensor]?.toFixed(3)}`,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });

    return newAlerts;
  };

  useEffect(() => {
    const updateData = () => {
      const newData = generateSensorData();
      setHistoricalData(newData);
      setCurrentData(newData[newData.length - 1]);
      setAlerts(generateAlerts(newData));
    };

    updateData();
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, [selectedSite]);

  const StatusBadge = ({ status }) => {
    const colors = {
      normal: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status] || colors.normal}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const SensorCard = ({ title, value, unit, status, icon: Icon, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{unit}</p>
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span className="ml-1">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  // Highcharts configurations
  const waterLevelDischargeOptions = {
    chart: {
      type: 'line',
      height: 350,
      backgroundColor: 'transparent'
    },
    title: {
      text: null
    },
    xAxis: {
      type: 'datetime',
      categories: historicalData.map(d => d.time),
      labels: {
        formatter: function () {
          return Highcharts.dateFormat('%H:%M', this.value);
        }
      }
    },
    yAxis: [{
      title: {
        text: 'Water Level (m)',
        style: { color: '#3b82f6' }
      },
      labels: {
        style: { color: '#3b82f6' }
      }
    }, {
      title: {
        text: 'Discharge Rate (m³/s)',
        style: { color: '#10b981' }
      },
      labels: {
        style: { color: '#10b981' }
      },
      opposite: true
    }],
    legend: {
      align: 'center'
    },
    series: [{
      name: 'Water Level',
      type: 'line',
      yAxis: 0,
      data: historicalData.map(d => [d.time, d.waterLevel]),
      color: '#3b82f6',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }, {
      name: 'Discharge Rate',
      type: 'line',
      yAxis: 1,
      data: historicalData.map(d => [d.time, d.discharge]),
      color: '#10b981',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }],
    credits: {
      enabled: false
    },
    tooltip: {
      shared: true,
      crosshairs: true
    }
  };

  const seepagePressureOptions = {
    chart: {
      type: 'line',
      height: 350,
      backgroundColor: 'transparent'
    },
    title: {
      text: null
    },
    xAxis: {
      type: 'datetime',
      categories: historicalData.map(d => d.time),
      labels: {
        formatter: function () {
          return Highcharts.dateFormat('%H:%M', this.value);
        }
      }
    },
    yAxis: [{
      title: {
        text: 'Seepage Rate (L/s)',
        style: { color: '#f59e0b' }
      },
      labels: {
        style: { color: '#f59e0b' }
      }
    }, {
      title: {
        text: 'Pressure (MPa)',
        style: { color: '#ef4444' }
      },
      labels: {
        style: { color: '#ef4444' }
      },
      opposite: true
    }],
    series: [{
      name: 'Seepage Rate',
      type: 'area',
      yAxis: 0,
      data: historicalData.map(d => [d.time, d.seepage]),
      color: '#f59e0b',
      fillColor: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, '#fef3c7'],
          [1, 'rgba(254, 243, 199, 0.1)']
        ]
      },
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }, {
      name: 'Structure Pressure',
      type: 'line',
      yAxis: 1,
      data: historicalData.map(d => [d.time, d.pressure]),
      color: '#ef4444',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }],
    credits: {
      enabled: false
    },
    tooltip: {
      shared: true,
      crosshairs: true
    }
  };

  const environmentalOptions = {
    chart: {
      type: 'line',
      height: 350,
      backgroundColor: 'transparent'
    },
    title: {
      text: null
    },
    xAxis: {
      type: 'datetime',
      categories: historicalData.map(d => d.time),
      labels: {
        formatter: function () {
          return Highcharts.dateFormat('%H:%M', this.value);
        }
      }
    },
    yAxis: [{
      title: {
        text: 'Temperature (°C) / pH',
        style: { color: '#f59e0b' }
      },
      labels: {
        style: { color: '#f59e0b' }
      }
    }, {
      title: {
        text: 'Turbidity (NTU)',
        style: { color: '#06b6d4' }
      },
      labels: {
        style: { color: '#06b6d4' }
      },
      opposite: true
    }],
    series: [{
      name: 'Temperature',
      type: 'line',
      yAxis: 0,
      data: historicalData.map(d => [d.time, d.temperature]),
      color: '#f59e0b',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }, {
      name: 'pH Level',
      type: 'line',
      yAxis: 0,
      data: historicalData.map(d => [d.time, d.ph]),
      color: '#8b5cf6',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }, {
      name: 'Turbidity',
      type: 'line',
      yAxis: 1,
      data: historicalData.map(d => [d.time, d.turbidity]),
      color: '#06b6d4',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }],
    credits: {
      enabled: false
    },
    tooltip: {
      shared: true,
      crosshairs: true
    }
  };

  const structuralOptions = {
    chart: {
      type: 'line',
      height: 350,
      backgroundColor: 'transparent'
    },
    title: {
      text: null
    },
    xAxis: {
      type: 'datetime',
      categories: historicalData.map(d => d.time),
      labels: {
        formatter: function () {
          return Highcharts.dateFormat('%H:%M', this.value);
        }
      }
    },
    yAxis: [{
      title: {
        text: 'Vibration (mm/s)',
        style: { color: '#ef4444' }
      },
      labels: {
        style: { color: '#ef4444' }
      }
    }, {
      title: {
        text: 'Tilt (radians)',
        style: { color: '#8b5cf6' }
      },
      labels: {
        style: { color: '#8b5cf6' }
      },
      opposite: true
    }],
    series: [{
      name: 'Vibration',
      type: 'line',
      yAxis: 0,
      data: historicalData.map(d => [d.time, d.vibration]),
      color: '#ef4444',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }, {
      name: 'Tilt X-Axis',
      type: 'line',
      yAxis: 1,
      data: historicalData.map(d => [d.time, d.tiltX]),
      color: '#8b5cf6',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }, {
      name: 'Tilt Y-Axis',
      type: 'line',
      yAxis: 1,
      data: historicalData.map(d => [d.time, d.tiltY]),
      color: '#06b6d4',
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }],
    credits: {
      enabled: false
    },
    tooltip: {
      shared: true,
      crosshairs: true
    }
  };

  // Gauge chart for water level
  const waterLevelGaugeOptions = {
    chart: {
      // type: 'doughnut',
      height: 200,
      backgroundColor: 'transparent'
    },
    title: {
      text: null
    },
    pane: {
      center: ['50%', '85%'],
      size: '140%',
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor: '#EEE',
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc'
      }
    },
    yAxis: {
      min: 0,
      max: 100,
      stops: [
        [0.1, '#55BF3B'], // green
        [0.5, '#DDDF0D'], // yellow
        [0.9, '#DF5353'] // red
      ],
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      title: {
        y: -70,
        text: 'Water Level %'
      },
      labels: {
        y: 16
      }
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true
        }
      }
    },
    series: [{
      name: 'Water Level',
      data: [currentData.waterLevel || 0],
      dataLabels: {
        format: '<div style="text-align:center"><span style="font-size:25px">{y:.1f}%</span></div>'
      }
    }],
    credits: {
      enabled: false
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dam Safety Monitor</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{selectedSite}</span>
              <Clock className="h-4 w-4 ml-4" />
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode(viewMode === 'realtime' ? 'historical' : 'realtime')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {viewMode === 'realtime' ? 'Historical View' : 'Real-time View'}
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Site Selection */}
      <div className="px-6 py-4">
        <div className="flex space-x-4">
          {damSites.map(site => (
            <button
              key={site.id}
              onClick={() => setSelectedSite(site.name)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${selectedSite === site.name
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              <div className="text-left">
                <div>{site.name}</div>
                <div className="text-xs opacity-75">{site.capacity}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div ref={dashboardRef} className="px-6 pb-6">
        {/* Alerts Section */}
        {/* {alerts.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
              </div>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${alert.status === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`h-5 w-5 ${alert.status === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
                      <span className="font-medium">{alert.message}</span>
                    </div>
                    <span className="text-sm text-gray-600">{alert.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}
        {/* {alerts.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
              </div>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${alert.status === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`h-5 w-5 ${alert.status === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
                      <span className="font-medium">{alert.message}</span>
                    </div>
                    <span className="text-sm text-gray-600">{alert.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}

        {/* Sensor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SensorCard
            title="Water Level"
            value={currentData.waterLevel?.toFixed(1)}
            unit="meters"
            status={getStatus('waterLevel', currentData.waterLevel)}
            icon={Droplets}
            trend={2.3}
          />
          <SensorCard
            title="Discharge Rate"
            value={currentData.discharge?.toFixed(0)}
            unit="m³/s"
            status={getStatus('discharge', currentData.discharge)}
            icon={Activity}
            trend={-1.2}
          />
          <SensorCard
            title="Seepage Rate"
            value={currentData.seepage?.toFixed(3)}
            unit="L/s"
            status={getStatus('seepage', currentData.seepage)}
            icon={Droplets}
            trend={0.8}
          />
          <SensorCard
            title="Structure Pressure"
            value={currentData.pressure?.toFixed(2)}
            unit="MPa"
            status={getStatus('pressure', currentData.pressure)}
            icon={Gauge}
            trend={-0.5}
          />
          <SensorCard
            title="Temperature"
            value={currentData.temperature?.toFixed(1)}
            unit="°C"
            status={getStatus('temperature', currentData.temperature)}
            icon={Thermometer}
            trend={1.1}
          />
          <SensorCard
            title="pH Level"
            value={currentData.ph?.toFixed(2)}
            unit="pH"
            status={getStatus('ph', currentData.ph)}
            icon={Activity}
            trend={0.3}
          />
          <SensorCard
            title="Turbidity"
            value={currentData.turbidity?.toFixed(2)}
            unit="NTU"
            status={getStatus('turbidity', currentData.turbidity)}
            icon={Activity}
            trend={-2.1}
          />
          <SensorCard
            title="Vibration"
            value={currentData.vibration?.toFixed(3)}
            unit="mm/s"
            status={getStatus('vibration', currentData.vibration)}
            icon={Activity}
            trend={0.0}
          />
        </div>

        {/* Second Row of Sensors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SensorCard
            title="pH Level"
            value={currentData.ph?.toFixed(2)}
            unit="pH"
            status={getStatus('ph', currentData.ph)}
            icon={Activity}
            trend={0.3}
          />
          <SensorCard
            title="Turbidity"
            value={currentData.turbidity?.toFixed(2)}
            unit="NTU"
            status={getStatus('turbidity', currentData.turbidity)}
            icon={Activity}
            trend={-2.1}
          />
          <SensorCard
            title="Vibration"
            value={currentData.vibration?.toFixed(3)}
            unit="mm/s"
            status={getStatus('vibration', currentData.vibration)}
            icon={Activity}
            trend={0.0}
          />
          <SensorCard
            title="Power Usage"
            value={currentData.powerConsumption?.toFixed(0)}
            unit="kW"
            status="normal"
            icon={Zap}
            trend={1.5}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Water Level and Discharge Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Water Level & Discharge Rate</h3>
            <HighchartsReact
              highcharts={Highcharts}
              options={waterLevelDischargeOptions}
            />
          </div>

          {/* Seepage and Pressure Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seepage Rate & Structure Pressure</h3>
            <HighchartsReact
              highcharts={Highcharts}
              options={seepagePressureOptions}
            />
          </div>

          {/* Environmental Conditions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Conditions</h3>
            <HighchartsReact
              highcharts={Highcharts}
              options={environmentalOptions}
            />
          </div>

          {/* Structural Monitoring */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Structural Monitoring</h3>
            <HighchartsReact
              highcharts={Highcharts}
              options={structuralOptions}
            />
          </div>
        </div>

        {/* Additional Sensor Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tilt Monitoring</h3>
            <div className="grid grid-cols-2 gap-4">
              <SensorCard
                title="Tilt X-Axis"
                value={currentData.tiltX?.toFixed(4)}
                unit="radians"
                status={getStatus('tiltX', currentData.tiltX)}
                icon={Activity}
              />
              <SensorCard
                title="Tilt Y-Axis"
                value={currentData.tiltY?.toFixed(4)}
                unit="radians"
                status={getStatus('tiltY', currentData.tiltY)}
                icon={Activity}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Monitoring</h3>
            <div className="grid grid-cols-2 gap-4">
              <SensorCard
                title="Wind Speed"
                value={currentData.windSpeed?.toFixed(1)}
                unit="m/s"
                status="normal"
                icon={Wind}
              />
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">System Status</div>
                <StatusBadge status="normal" />
                <div className="text-xs text-gray-500 mt-2">All systems operational</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;