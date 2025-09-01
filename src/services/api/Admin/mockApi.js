// mockApi.js
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// Create an axios instance
export const axiosDefault = axios.create();

// Attach mock adapter
const mock = new MockAdapter(axiosDefault, { delayResponse: 500 }); // optional delay

// Mock storage
let branches = [];

// Mock POST /api/branches
mock.onPost("/api/branches").reply((config) => {
  const payload = JSON.parse(config.data);

  if (!payload.branchCode || !payload.branchName || !payload.city) {
    return [400, { message: "branchCode, branchName, and city are required" }];
  }

  const newBranch = {
    id: branches.length + 1,
    address: payload.address || "",
    amenities: payload.amenities || [],
    branchCode: payload.branchCode,
    branchName: payload.branchName,
    city: payload.city,
    contactNumber: payload.contactNumber || "",
    email: payload.email || "",
    isActive: payload.isActive ?? true,
    operatingHours: payload.operatingHours || "N/A",
    region: payload.region || "",
    createdAt: new Date().toISOString(),
  };

  branches.push(newBranch);

  return [201, { message: "Branch created successfully", data: newBranch }];
});

// Mock GET /api/branches
mock.onGet("/api/branches").reply(200, branches);
