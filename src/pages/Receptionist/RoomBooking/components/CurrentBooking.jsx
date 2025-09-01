import { Button, Drawer, Space, Typography } from "antd";
import { Plus, Printer, X } from "lucide-react";
import { memo, useState } from "react";
import { useGetBookingByRoomIdApi } from "../../../../services/requests/useBookings";
import BookingInformation from "./BookingInformation";
import ExtendBooking from "./ExtendBooking";
import PaymentSettlement from "./PaymentSettlement";

const CurrentBookedRoom = memo(({ room, onSelect }) => {
  const getBookingByRoomIdApi = useGetBookingByRoomIdApi(room?.roomId);
  const [isShowExtend, setIsShowExtend] = useState(false);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);

  return (
    <Drawer
      placement="right"
      open={!!room}
      onClose={() => onSelect(null)}
      width={"100%"}
      closeIcon={null}
      className="booking-drawer"
      title={
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Details
          </h1>
          <p className="text-lg text-gray-600 font-mono">
            Ref. #:{" "}
            <Typography.Text
              copyable
              style={{ fontSize: "1.25rem", fontWeight: "bold" }}
            >
              {getBookingByRoomIdApi.data?.bookingReference}
            </Typography.Text>
          </p>
        </div>
      }
      extra={
        <Button
          type="text"
          key={"cancel"}
          onClick={() => onSelect(null)}
          className="rounded-lg"
          size="large"
          icon={<X />}
        />
      }
      footer={
        <div className="flex justify-end items-center">
          <Space>
            <Button
              key={"extend"}
              size="large"
              type="primary"
              onClick={() => setIsShowExtend(true)}
            >
              <Plus className="w-4 h-4" />
              Extend Booking Information
            </Button>
            <Button key={"print"} size="large">
              <Printer className="w-4 h-4" /> Print Booking
            </Button>
          </Space>
        </div>
      }
      classNames={{
        body: "bg-gray-50",
      }}
    >
      <div className="flex flex-col gap-4">
        {getBookingByRoomIdApi.data && (
          <BookingInformation
            bookingData={getBookingByRoomIdApi.data}
            request={getBookingByRoomIdApi}
            settlePayment={() => setIsPaymentDrawerOpen(true)}
          />
        )}
      </div>

      <Drawer
        placement="right"
        open={isShowExtend}
        onClose={() => setIsShowExtend(false)}
        size="large"
        closeIcon={null}
        className="booking-drawer"
        title={
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Extend booking
          </h1>
        }
        extra={
          <Button
            danger
            key={"cancel"}
            onClick={() => setIsShowExtend(false)}
            className="rounded-lg"
            size="large"
          >
            <X className="w-4 h-4" />
          </Button>
        }
        classNames={{
          body: "bg-gray-50",
        }}
      >
        <ExtendBooking
          bookingData={getBookingByRoomIdApi.data}
          request={getBookingByRoomIdApi}
          callback={() => setIsShowExtend(false)}
        />
      </Drawer>

      <PaymentSettlement
        open={isPaymentDrawerOpen}
        onClose={() => setIsPaymentDrawerOpen(false)}
        bookingData={getBookingByRoomIdApi.data}
        onPaymentSuccess={(result) => {
          console.log("Payment processed:", result);
          // Handle success - refresh booking data, show success message, etc.
        }}
      />
    </Drawer>
  );
});

export default CurrentBookedRoom;
