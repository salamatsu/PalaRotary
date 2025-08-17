import { InfoCircleFilled } from "@ant-design/icons";
import { CheckCircle, CreditCard, Plus, Receipt } from "lucide-react";

const BookingReminder = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
      {/* <Bed className="w-12 h-12 mx-auto mb-4 text-gray-300" /> */}
      <h3 className="text-lg font-medium text-gray-900 mb-2 italic space-x-4">
        <InfoCircleFilled /> Selecting a Room
      </h3>
      <p className="text-gray-600 mb-4">
        Choose an available room to start the booking process
      </p>
      <div className="space-y-2 text-sm text-gray-500 text-left">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Apply promo codes for discounts</span>
        </div>
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-500" />
          <span>Add extra services and amenities</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-purple-500" />
          <span>Multiple payment methods supported</span>
        </div>
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-orange-500" />
          <span>Detailed payment breakdown</span>
        </div>
      </div>
    </div>
  );
};

export default BookingReminder;
