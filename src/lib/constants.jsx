import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export const USER_ROLES = {
  admin: "Admin",
  guest: "Guest",
};

export const STATUS_FILTERS = [
  { text: "Active", value: true },
  { text: "Inactive", value: false },
];

export const ROOM_STATUSES = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
};

export const BED_CONFIGURATIONS = [
  "Single Bed",
  "Double Bed",
  "Queen Bed",
  "King Bed",
  "Twin Beds",
  "Bunk Beds",
  "Sofa Bed",
  "Extra Bed / Rollaway",
  "Hospital Adjustable Bed",
];

export const AMENITIES = [
  {
    category: "Room Features",
    amenities: [
      "Air Conditioning",
      "LED/LCD TV with cable channels",
      "Free Wi-Fi (rooms & public areas)",
      "Private bathroom with shower",
      "Complimentary toiletries & towels",
      "In-room safe",
      "Desk & phone",
      "Free bottled water",
      "Toothbrush & toothpaste",
      "Slippers",
      "Bidet",
      "Hairdryer",
    ],
  },
  {
    category: "Guest Services & Facilities",
    amenities: [
      "24/7 Room Service",
      "Daily housekeeping",
      "24-hour front desk",
      "Concierge services",
      "Luggage storage",
      "Laundry service",
      "Dry cleaning",
      "Security (CCTV, smoke-free rooms)",
    ],
  },
  {
    category: "Dining & Refreshments",
    amenities: [
      "On-site restaurant/café",
      "Coffee/tea in common areas",
      "Complimentary bottled water",
      "Breakfast available (with fee)",
    ],
  },
  {
    category: "Location & Accessibility",
    amenities: [
      "Elevators/lifts",
      "Wheelchair accessible rooms",
      "Free self-parking",
      "Valet parking",
    ],
  },
  {
    category: "Health & Safety",
    amenities: [
      "Fire extinguishers",
      "Smoke detectors",
      "First-aid kits",
      "COVID-19 safety protocols",
    ],
  },
];

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
