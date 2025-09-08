import { Divider, Modal, Tag } from "antd";
import {
  Building2,
  Calendar,
  Clock,
  Hash,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { DATE_FORMATS, formatDateTime } from "../../../../utils/formatDate";

const BranchInfoModal = ({ open, onClose, branchData }) => {
  if (!branchData) return null;

  const {
    branchId,
    branchCode,
    branchName,
    address,
    city,
    region,
    province,
    contactNumber,
    email,
    operatingHours,
    amenities,
    isActive,
    createdAt,
    updatedAt,
  } = branchData;

  // Parse amenities JSON string
  const parsedAmenities = amenities ? JSON.parse(amenities) : [];

  // Get status color
  const getStatusColor = (status) => {
    return status ? "green" : "red";
  };

  // Get status text
  const getStatusText = (status) => {
    return status ? "Active" : "Inactive";
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-semibold text-gray-800">
            Branch Information
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      styles={{
        mask: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        },
        content: {
          borderRadius: "0px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
      }}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {branchName}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Hash className="w-4 h-4" />
                <span className="font-mono text-sm">{branchCode}</span>
              </div>
            </div>
            <Tag
              color={getStatusColor(isActive)}
              className="px-3 py-1 text-sm font-medium rounded-full"
            >
              {getStatusText(isActive)}
            </Tag>
          </div>
        </div>

        {/* Location Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Location
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Address
                </label>
                <p className="text-gray-800 mt-1">{address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    City
                  </label>
                  <p className="text-gray-800 mt-1">{city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Region
                  </label>
                  <p className="text-gray-800 mt-1">{region}</p>
                </div>
              </div>
              {province && (
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Province
                  </label>
                  <p className="text-gray-800 mt-1">{province}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              Contact Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Phone
                  </label>
                  <p className="text-gray-800">{contactNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Email
                  </label>
                  <p className="text-blue-600">{email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Operating Hours
                  </label>
                  <p className="text-gray-800">{operatingHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        {/* Amenities Section */}
        {parsedAmenities.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Amenities & Services
            </h3>
            <div className="flex flex-wrap gap-2">
              {parsedAmenities.map((amenity, index) => (
                <Tag
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 border-blue-200 rounded-full"
                >
                  {amenity}
                </Tag>
              ))}
            </div>
          </div>
        )}

        <Divider className="my-6" />

        {/* Metadata Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-500" />
            Branch Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-gray-500 uppercase tracking-wide font-medium">
                Branch ID
              </label>
              <p className="text-gray-800 font-mono mt-1">#{branchId}</p>
            </div>
            <div>
              <label className="text-gray-500 uppercase tracking-wide font-medium">
                Created
              </label>
              <p className="text-gray-800 mt-1">
                {formatDateTime(createdAt, DATE_FORMATS.DATE)}
              </p>
            </div>
            <div>
              <label className="text-gray-500 uppercase tracking-wide font-medium">
                Last Updated
              </label>
              <p className="text-gray-800 mt-1">
                {formatDateTime(updatedAt, DATE_FORMATS.DATE)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BranchInfoModal;
