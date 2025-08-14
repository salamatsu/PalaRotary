import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export const ROOM_STATUSES = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
};

export const STATUS_CONFIGS = {
  [ROOM_STATUSES.AVAILABLE]: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Available",
  },
  [ROOM_STATUSES.OCCUPIED]: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-4 h-4" />,
    label: "Occupied",
  },
  [ROOM_STATUSES.CLEANING]: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Cleaning",
  },
  [ROOM_STATUSES.MAINTENANCE]: {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Maintenance",
  },
  [ROOM_STATUSES.RESERVED]: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="w-4 h-4" />,
    label: "Reserved",
  },
};

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "gcash", label: "GCash" },
  { value: "paymaya", label: "PayMaya" },
  { value: "bank_transfer", label: "Bank Transfer" },
];