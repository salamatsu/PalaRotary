import dayjs from "dayjs";

export const formatDateTime = (dateTime) => {
  if (!dateTime) return "Not set";
  return dayjs(dateTime).format("MMM DD, YYYY hh:mm A");
};

export const getCurrentDayType = () => {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
};

// Utility functions
// const formatDateTime = useCallback((dateTime) => {
//   if (!dateTime) return "Not set";
//   try {
//     const date = new Date(dateTime);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch (error) {
//     console.error("Date formatting error:", error);
//     return "Invalid date";
//   }
// }, []);
