import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  zone1,
  zone2,
  zone3,
  zone4,
  zone5,
  zone6,
  zone7,
  zone8,
} from "../assets/images/shirts";

export const SHIRT_ZONES_IMAGE = {
  ["ZONE 1"]: zone1,
  ["ZONE 2"]: zone2,
  ["ZONE 3"]: zone3,
  ["ZONE 4"]: zone4,
  ["ZONE 4A"]: zone4,
  ["ZONE 4B"]: zone4,
  ["ZONE 5"]: zone5,
  ["ZONE 5A"]: zone5,
  ["ZONE 5B"]: zone5,
  ["ZONE 6"]: zone6,
  ["ZONE 7"]: zone7,
  ["ZONE 8"]: zone8,
};

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

export const KID_SHIRT_SIZES = [
  { size: "6", width: 10, length: 17 },
  { size: "8", width: 11, length: 18 },
  { size: "10", width: 12, length: 19 },
  { size: "12", width: 13, length: 20 },
  { size: "14", width: 14, length: 21 },
  { size: "16", width: 15, length: 22 },
  { size: "18", width: 16, length: 23 },
  { size: "20 / 2XS", width: 17, length: 24 },
];

export const ADULT_SHIRT_SIZES = [
  { size: "2XS", width: 17, length: 24 },
  { size: "XS", width: 18, length: 25 },
  { size: "S", width: 19, length: 26 },
  { size: "M", width: 20, length: 27 },
  { size: "L", width: 21, length: 28 },
  { size: "XL", width: 22, length: 29 },
  { size: "2XL", width: 23, length: 30 },
  { size: "3XL", width: 24, length: 31 },
  { size: "4XL", width: 25, length: 31.5 },
  { size: "5XL", width: 26, length: 32 },
  { size: "6XL", width: 27, length: 32.5 },
  { size: "7XL", width: 28, length: 33 },
];

export const ZONE_INFORMATION = [
  { zone: "ZONE 1", area: "Malabon, Navotas", color: "Grey" },
  { zone: "ZONE 2", area: "Caloocan", color: "Red" },
  { zone: "ZONE 3", area: "Valenzuela", color: "Yellow" },
  { zone: "ZONE 4", area: "Marikina", color: "White" },
  { zone: "ZONE 5", area: "Rizal", color: "Blue" },
  { zone: "ZONE 6", area: "Pasig", color: "Green" },
  { zone: "ZONE 7", area: "San Juan", color: "Maroon" },
  { zone: "ZONE 8", area: "Mandaluyong", color: "Lavender" },
];

// Pricing configuration
export const SHIRT_PRICING_CONFIG = {
  promoPrice: 320,
  regularPrice: 350,
  promoEndDate: "2025-12-25", // December 25, 2025
  orderDeadline: "2026-01-05", // January 5, 2026
};

// Function to get current shirt price based on date
export const getCurrentShirtPrice = () => {
  const now = new Date();
  const promoEnd = new Date(SHIRT_PRICING_CONFIG.promoEndDate + "T23:59:59");

  // Check if current date is before or on promo end date
  if (now <= promoEnd) {
    return SHIRT_PRICING_CONFIG.promoPrice;
  }

  return SHIRT_PRICING_CONFIG.regularPrice;
};

// Function to check if promo is active
export const isPromoActive = () => {
  const now = new Date();
  const promoEnd = new Date(SHIRT_PRICING_CONFIG.promoEndDate + "T23:59:59");
  return now <= promoEnd;
};

// Function to check if orders are still accepted
export const canPlaceOrder = () => {
  const now = new Date();
  const deadline = new Date(SHIRT_PRICING_CONFIG.orderDeadline + "T23:59:59");
  return now <= deadline;
};

// Legacy pricing object for backward compatibility
export const SHIRT_PRICING = {
  base: getCurrentShirtPrice(),
  sizes: {
    "2XS": getCurrentShirtPrice(),
    XS: getCurrentShirtPrice(),
    S: getCurrentShirtPrice(),
    M: getCurrentShirtPrice(),
    L: getCurrentShirtPrice(),
    XL: getCurrentShirtPrice(),
    "2XL": getCurrentShirtPrice(),
    "3XL": getCurrentShirtPrice(),
    "4XL": getCurrentShirtPrice(),
    "5XL": getCurrentShirtPrice(),
    "6XL": getCurrentShirtPrice(),
    "7XL": getCurrentShirtPrice(),
    // Kids sizes
    6: getCurrentShirtPrice(),
    8: getCurrentShirtPrice(),
    10: getCurrentShirtPrice(),
    12: getCurrentShirtPrice(),
    14: getCurrentShirtPrice(),
    16: getCurrentShirtPrice(),
    18: getCurrentShirtPrice(),
    "20 / 2XS": getCurrentShirtPrice(),
  },
};
