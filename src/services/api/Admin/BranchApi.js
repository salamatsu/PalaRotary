// branchApi.js

// In-memory mock database
let branches = [];

export const createBranchApi = async (payload) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!payload.branchCode || !payload.branchName || !payload.city) {
        reject(new Error("branchCode, branchName, and city are required"));
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

      resolve({
        message: "Branch created successfully",
        data: newBranch,
      });
    }, 500); // simulate network delay
  });
};

export const getBranchesApi = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(branches);
    }, 300);
  });
};
