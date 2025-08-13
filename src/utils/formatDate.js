import dayjs from "dayjs";

export const formatDateTime = (dateTime) => {
  if (!dateTime) return 'Not set';
  return dayjs(dateTime).format('MMM DD, YYYY hh:mm A');
};

export const getCurrentDayType = () => {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? "weekend" : "weekday";
};