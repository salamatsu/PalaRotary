import React from "react";
import { useGetAllAdditionalServices } from "../../../../services/requests/useAdditionalServices";
import { Checkbox, InputNumber, Spin, Typography } from "antd";
import { formatCurrency } from "../../../../utils/formatCurrency";

const { Text } = Typography;

const AdditionalServicesSelector = ({ selectedServices, onServicesChange }) => {

  const getAllAdditionalServices = useGetAllAdditionalServices();

  const handleServiceToggle = (service, checked) => {
    if (checked) {
      const newService = {
        ...service,
        quantity: 1,
        totalAmount: service.basePrice,
      };
      onServicesChange([...selectedServices, newService]);
    } else {
      onServicesChange(
        selectedServices.filter((s) => s.serviceId !== service.serviceId)
      );
    }
  };

  const handleQuantityChange = (serviceId, quantity) => {
    onServicesChange(
      selectedServices.map((service) =>
        service.serviceId === serviceId
          ? {
            ...service,
            quantity,
            totalAmount: service.basePrice * quantity,
          }
          : service
      )
    );
  };

  const isServiceSelected = (serviceId) => {
    return selectedServices.some((s) => s.serviceId === serviceId);
  };

  const getSelectedService = (serviceId) => {
    return selectedServices.find((s) => s.serviceId === serviceId);
  };

  if (getAllAdditionalServices.isPending)
    return (
      <div className="flex items-center justify-center py-8">
        <Spin size="large" />
      </div>
    );
  return (
    <div className="space-y-3">
      <div className="space-y-3 max-h-[300px] overflow-auto">
        {getAllAdditionalServices.data.map((service) => {
          const isSelected = isServiceSelected(service.serviceId);
          const selectedService = getSelectedService(service.serviceId);

          return (
            <div key={service.serviceId} className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${isSelected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) =>
                      handleServiceToggle(service, e.target.checked)
                    }
                    className="scale-110"
                  />
                  <div>
                    <Text strong className="text-base">{service.serviceName}</Text>
                    <div className="text-sm text-gray-500 capitalize">
                      {service.serviceType}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Text strong className="text-blue-600 text-lg">
                    {formatCurrency(service.basePrice)}
                  </Text>
                  {service.isPerItem == 1 && (
                    <div className="text-xs text-gray-500">/item</div>
                  )}
                </div>
              </div>

              {isSelected && service.isPerItem == 1 && (
                <div className="flex items-center gap-3 mt-3 p-3 bg-white rounded-lg border">
                  <Text className="text-sm font-medium">Quantity:</Text>
                  <InputNumber
                    min={1}
                    max={10}
                    value={selectedService?.quantity || 1}
                    onChange={(value) =>
                      handleQuantityChange(service.serviceId, value)
                    }
                    size="small"
                    className="w-20"
                  />
                  <Text className="text-sm text-gray-500">
                    Total:{" "}
                    <span className="font-medium text-blue-600">
                      {formatCurrency(
                        selectedService?.totalAmount || service.basePrice
                      )}
                    </span>
                  </Text>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdditionalServicesSelector;
