import { STATUS_CONFIGS } from "../../lib/constants";

const StatusTag = ({ status }) => {
  const config = STATUS_CONFIGS[status];
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusTag;
