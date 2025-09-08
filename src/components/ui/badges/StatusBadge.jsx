import { Badge } from "antd";

export const StatusBadge = ({ status, type = "default" }) => {
  const getStatus = () => {
    if (type === "room") {
      switch (status.toLowerCase()) {
        case "active":
        case "available":
          return "success";
        case "inactive":
        case "occupied":
          return "error";
        case "cleaning":
          return "processing";
        case "maintenance":
          return "warning";
        case "out_of_order":
          return "default";
        default:
          return "default";
      }
    }
    return status === "Active" ? "success" : "error";
  };

  return <Badge status={getStatus()} text={status} />;
};