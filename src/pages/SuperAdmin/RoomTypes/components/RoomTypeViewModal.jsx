import React from "react";
import { Modal, Tag, Divider, Image, Badge } from "antd";
import {
  MapPin,
  Users,
  Bed,
  Square,
  Wifi,
  AirVent,
  Tv,
  Bath,
  Sparkles,
  Cable,
  Clock,
  Shield,
  ConciergeBell,
  Palette,
  CheckCircle,
  XCircle,
  Hash,
  FileText,
  Star,
} from "lucide-react";

const RoomTypeViewModal = ({
  open,
  onClose,
  roomTypeData,
  loading = false,
}) => {
  if (!roomTypeData) return null;

  // Parse JSON strings safely
  const parseJsonString = (jsonString) => {
    try {
      return JSON.parse(jsonString || "[]");
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  };

  const amenities = parseJsonString(roomTypeData.amenities);
  const features = parseJsonString(roomTypeData.features);

  // Icon mapping for amenities
  const getAmenityIcon = (amenity) => {
    const iconMap = {
      "Free WiFi": <Wifi className="w-4 h-4" />,
      "Air Conditioning": <AirVent className="w-4 h-4" />,
      "LED TV": <Tv className="w-4 h-4" />,
      "Private Bathroom": <Bath className="w-4 h-4" />,
      "Complimentary Toiletries": <Sparkles className="w-4 h-4" />,
      "Cable Channels": <Cable className="w-4 h-4" />,
    };
    return iconMap[amenity] || <CheckCircle className="w-4 h-4" />;
  };

  // Icon mapping for features
  const getFeatureIcon = (feature) => {
    const iconMap = {
      "12/24 Hour Rates": <Clock className="w-4 h-4" />,
      "Clean Linens": <Sparkles className="w-4 h-4" />,
      "Room Service Available": <ConciergeBell className="w-4 h-4" />,
      "Safe Environment": <Shield className="w-4 h-4" />,
      "Japanese Theme Decor": <Palette className="w-4 h-4" />,
    };
    return iconMap[feature] || <Star className="w-4 h-4" />;
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-2">
          <div className="flex items-center gap-2">
            <Bed className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-800">
              {roomTypeData.roomTypeName}
            </span>
          </div>
          <Badge
            status={roomTypeData.isActive ? "success" : "error"}
            text={roomTypeData.isActive ? "Active" : "Inactive"}
            className="ml-auto"
          />
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      loading={loading}
      className="room-type-modal"
    >
      <div className="space-y-6">
        {/* Room Image */}
        {roomTypeData.imageUrl && (
          <div className="w-full">
            <Image
              src={roomTypeData.imageUrl}
              alt={roomTypeData.roomTypeName}
              className="w-full h-64 object-cover rounded-lg"
              placeholder={
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Bed className="w-12 h-12 text-gray-400" />
                </div>
              }
            />
          </div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Room Code:</span>
              <Tag color="blue">{roomTypeData.roomTypeCode}</Tag>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Branch:</span>
              <span className="text-gray-600">{roomTypeData.branchName}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Max Occupancy:</span>
              <Tag color="green">{roomTypeData.maxOccupancy} guests</Tag>
            </div>

            <div className="flex items-center gap-2">
              <Square className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Room Size:</span>
              <span className="text-gray-600">{roomTypeData.roomSize} sqm</span>
            </div>
          </div>
        </div>

        <Divider />

        {/* Bed Configuration */}
        <div className="flex items-center gap-2">
          <Bed className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Bed Configuration:</span>
          <Tag color="purple">{roomTypeData.bedConfiguration}</Tag>
        </div>

        <Divider />

        {/* Description */}
        {roomTypeData.description && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Description:</span>
            </div>
            <p className="text-gray-600 leading-relaxed pl-7">
              {roomTypeData.description}
            </p>
          </div>
        )}

        <Divider />

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Amenities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                >
                  {getAmenityIcon(amenity)}
                  <span className="text-sm text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                >
                  {getFeatureIcon(feature)}
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {roomTypeData.isActive ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium text-gray-700">Status:</span>
          </div>
          <Tag
            color={roomTypeData.isActive ? "success" : "error"}
            className="text-sm font-medium"
          >
            {roomTypeData.isActive ? "Active" : "Inactive"}
          </Tag>
        </div>
      </div>
    </Modal>
  );
};

export default RoomTypeViewModal;
