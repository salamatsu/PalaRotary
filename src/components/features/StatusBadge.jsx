import { getStatusColor } from "../../utils/colorsutils";

const StatusBadge = ({ status, type = "default" }) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
        status
      )}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
