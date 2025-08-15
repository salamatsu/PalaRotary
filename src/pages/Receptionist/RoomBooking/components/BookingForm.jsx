import React, { useCallback, useEffect, useState } from "react";
import { useGetRoomsRates } from "../../../../services/requests/useRooms";
import { App, Button, Card, Collapse, Drawer, Image, InputNumber, Tag } from "antd";
import dayjs from "dayjs";
import { Calculator, CreditCard, Gift, Plus, User } from "lucide-react";
import { formatCurrency } from "../../../../utils/formatCurrency";
import PromoCodeInput from "./PromoCodeInput";
import AdditionalServicesSelector from "./AdditionalServicesSelector";
import PaymentSummary from "../../../../components/features/PaymentSummary";

const { Panel } = Collapse;

const BookingForm = ({ selectedRoom, bookingDetails, onBookingChange, onBook }) => {
  const { notification } = App.useApp()
  const [selectedRate, setSelectedRate] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getRoomsRates = useGetRoomsRates(
    selectedRoom.roomTypeId,
    selectedRoom.branchId
  );

  useEffect(() => {
    setSelectedRate(null);
    setAppliedPromo(null);
  }, [selectedRoom]);

  const handleBookClick = useCallback(() => {
    if (!selectedRate) {
      notification.error({
        message: "Rate Required",
        description: "Please select a rate before booking.",
      });
      return;
    }
    onBook(selectedRate, appliedPromo, selectedServices);
  }, [selectedRate, appliedPromo, selectedServices, onBook]);

  const currentDayType =
    dayjs().day() === 0 || dayjs().day() === 6 ? "weekend" : "weekday";

  return (
    <div className=" mx-auto">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room Details Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="relative">
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                {selectedRoom?.roomTypeName}
              </div>
            </div>
            <Image
              src={selectedRoom?.imageUrl}
              alt={selectedRoom?.roomTypeName}
              className="w-full h-56 object-cover"
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmMWY1ZjkiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlMmU4ZjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIiBmb250LXdlaWdodD0iNTAwIj5Sb29tIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
            />
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {selectedRoom?.roomTypeName}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {selectedRoom?.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                <User className="w-4 h-4" />
                <span>Max occupancy: {selectedRoom?.maxOccupancy || 2} guests</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-blue-500" />
                Number of Guests
              </label>
              <div className="relative">
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  max={selectedRoom?.maxOccupancy || 2}
                  value={bookingDetails.guests}
                  onChange={(value) => onBookingChange("guests", value)}
                  size="large"
                  controls
                  className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Rate Selection Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Select Rate</h3>
              <p className="text-sm text-gray-600">Choose your preferred rate plan</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {/* <div className="space-y-3 max-h-80 overflow-y-auto mb-6"> */}
            {getRoomsRates.data
              .filter(
                ({ dayType }) =>
                  dayType === "all" || dayType === currentDayType
              )
              .map((rate) => (
                <div
                  key={rate.rateId}
                  className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 group ${selectedRate?.rateId === rate.rateId
                    ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]"
                    }`}
                  onClick={() => setSelectedRate(rate)}
                >
                  {selectedRate?.rateId === rate.rateId && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-base mb-2">
                        {rate.rateTypeName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                          {rate.duration} hour{rate.duration > 1 && "s"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatCurrency(rate.baseRate * rate.duration)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(rate.baseRate)} / hour
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Gift className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700">Promo Code</h4>
                <p className="text-xs text-gray-500">Apply a discount code</p>
              </div>
            </div>
            <PromoCodeInput
              selectedRoom={selectedRoom}
              onApplyPromo={setAppliedPromo}
              appliedPromo={appliedPromo}
              onRemovePromo={() => setAppliedPromo(null)}
            />
          </div>
        </Card>

        {/* Services & Payment Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
          <div className="space-y-6">
            {/* Additional Services */}
            <div>
              <Button block size="large" onClick={() => setIsModalOpen(true)} type="dashed" className="rounded-xl h-14 font-bold text-base transition-all duration-300 hover:bg-orange-50 hover:border-orange-200 hover:shadow-lg hover:scale-[1.02]">
                <Plus className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-gray-900">Additional Services</span>
                {selectedServices.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <Tag color="blue" className="rounded-full text-xs">
                      {selectedServices.length} selected
                    </Tag>
                  </div>
                )}
              </Button>
            </div>

            {/* Payment Summary */}
            {selectedRate && (
              <PaymentSummary
                baseAmount={selectedRate.baseRate * selectedRate.duration}
                appliedPromo={appliedPromo}
                selectedServices={selectedServices}
              />
            )}

            {/* Book Button */}
            <div className="pt-4">
              <Button
                block
                size="large"
                type="primary"
                disabled={!selectedRate}
                onClick={handleBookClick}
                icon={<Calculator className="w-5 h-5" />}
                className={`rounded-xl h-14 font-bold text-base transition-all duration-300 ${selectedRate
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  : 'bg-gray-300'
                  }`}
              >
                {selectedRate ? "Complete Booking" : "Select a Rate to Continue"}
              </Button>

              {!selectedRate && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  Please select a rate above to proceed with your booking
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Drawer placement="right" open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Additional Services" size="large">

        <AdditionalServicesSelector
          selectedServices={selectedServices}
          onServicesChange={setSelectedServices}
          showHeader={false}
        />
      </Drawer>
    </div>

  );
};

export default BookingForm;
