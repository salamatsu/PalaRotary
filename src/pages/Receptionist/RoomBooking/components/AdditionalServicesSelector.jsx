import React, { useState, useMemo } from "react";
import { useGetAllAdditionalServices } from "../../../../services/requests/useAdditionalServices";
import {
  Checkbox,
  InputNumber,
  Spin,
  Typography,
  Select,
  Input,
  Button,
  Tag,
  Card,
  Badge,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  ShoppingOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "../../../../utils/formatCurrency";

const { Text, Title } = Typography;
const { Option } = Select;

const AdditionalServicesSelector = ({
  selectedServices,
  setSelectedServices,
  onServicesChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showOnlyPerItem, setShowOnlyPerItem] = useState(false);

  const getAllAdditionalServices = useGetAllAdditionalServices();

  // Get unique service types for category filter
  const serviceTypes = useMemo(() => {
    if (!getAllAdditionalServices.data) return [];
    const types = [
      ...new Set(
        getAllAdditionalServices.data.map((service) => service.serviceType)
      ),
    ];
    return types.sort();
  }, [getAllAdditionalServices.data]);

  // Filter services based on selected filters
  const filteredServices = useMemo(() => {
    if (!getAllAdditionalServices.data) return [];

    let filtered = getAllAdditionalServices.data;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((service) =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) => service.serviceType === selectedCategory
      );
    }

    // Price range filter
    if (priceRange !== "all") {
      filtered = filtered.filter((service) => {
        switch (priceRange) {
          case "free":
            return service.basePrice === 0;
          case "low":
            return service.basePrice > 0 && service.basePrice <= 100;
          case "medium":
            return service.basePrice > 100 && service.basePrice <= 500;
          case "high":
            return service.basePrice > 500 && service.basePrice <= 1000;
          case "premium":
            return service.basePrice > 1000;
          default:
            return true;
        }
      });
    }

    // Per item filter
    if (showOnlyPerItem) {
      filtered = filtered.filter((service) => service.isPerItem === 1);
    }

    return filtered;
  }, [
    getAllAdditionalServices.data,
    searchTerm,
    selectedCategory,
    priceRange,
    showOnlyPerItem,
  ]);

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

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange("all");
    setShowOnlyPerItem(false);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCategory !== "all" ||
    priceRange !== "all" ||
    showOnlyPerItem;

  const totalSelectedValue = selectedServices.reduce(
    (sum, service) => sum + service.totalAmount,
    0
  );

  if (getAllAdditionalServices.isPending)
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Spin size="large" />
        <Text className="mt-4 text-gray-500">Loading services...</Text>
      </div>
    );

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={4} className="!mb-1 flex items-center gap-2">
            <ShoppingOutlined className="text-blue-500" />
            Additional Services
          </Title>
          <Text className="text-gray-600">
            Choose from {getAllAdditionalServices.data?.length || 0} available
            services
          </Text>
        </div>

        {selectedServices.length > 0 && (
          <Card
            size="small"
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm min-w-fit"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-center sm:text-left">
              <Badge
                count={selectedServices.length}
                className="hidden sm:inline-block"
              >
                <Button type="text" size="small" icon={<ShoppingOutlined />} />
              </Badge>
              <div className="sm:hidden">
                <Text strong className="text-blue-600 text-lg">
                  {selectedServices.length} Selected
                </Text>
              </div>
              <div className="hidden sm:block">
                <Text strong className="text-blue-600">
                  {selectedServices.length} service
                  {selectedServices.length !== 1 ? "s" : ""} selected
                </Text>
              </div>
              <div className="flex items-center gap-1">
                <DollarCircleOutlined className="text-green-500" />
                <Text strong className="text-green-600 text-lg">
                  {formatCurrency(totalSelectedValue)}
                </Text>
              </div>
              <Button
                onClick={() => setSelectedServices([])}
                danger
                type="text"
              >
                Clear
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <FilterOutlined className="text-blue-500" />
              <Text strong className="text-base">
                Filters
              </Text>
              {hasActiveFilters && (
                <Badge dot>
                  <span></span>
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={clearAllFilters}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 self-start sm:self-auto"
              >
                Clear All Filters
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Search Services
              </Text>
              <Input
                placeholder="Search by name..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
                className="rounded-lg"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Category
              </Text>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="w-full"
                placeholder="Select category"
              >
                <Option value="all">
                  <span className="flex items-center gap-2">
                    <span>All Categories</span>
                  </span>
                </Option>
                {serviceTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Price Range
              </Text>
              <Select
                value={priceRange}
                onChange={setPriceRange}
                className="w-full"
                placeholder="Select price range"
              >
                <Option value="all">All Prices</Option>
                <Option value="free">Free Services</Option>
                <Option value="low">1 - 100</Option>
                <Option value="medium">101 - 500</Option>
                <Option value="high">501 - 1,000</Option>
                <Option value="premium">1,000+</Option>
              </Select>
            </div>

            {/* Per Item Filter */}
            <div className="space-y-2">
              <Text className="text-sm font-medium text-gray-700">
                Service Type
              </Text>
              <div className="flex items-center h-8">
                <Checkbox
                  checked={showOnlyPerItem}
                  onChange={(e) => setShowOnlyPerItem(e.target.checked)}
                  className="text-sm"
                >
                  Quantity-based only
                </Checkbox>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <Text className="text-sm text-gray-600 font-medium">
                  Active filters:
                </Text>
                {searchTerm && (
                  <Tag
                    closable
                    onClose={() => setSearchTerm("")}
                    className="rounded-full bg-blue-50 border-blue-200 text-blue-700"
                  >
                    Search: "{searchTerm}"
                  </Tag>
                )}
                {selectedCategory !== "all" && (
                  <Tag
                    closable
                    onClose={() => setSelectedCategory("all")}
                    className="rounded-full bg-green-50 border-green-200 text-green-700"
                  >
                    Category:{" "}
                    {selectedCategory.charAt(0).toUpperCase() +
                      selectedCategory.slice(1).toLowerCase()}
                  </Tag>
                )}
                {priceRange !== "all" && (
                  <Tag
                    closable
                    onClose={() => setPriceRange("all")}
                    className="rounded-full bg-purple-50 border-purple-200 text-purple-700"
                  >
                    Price:{" "}
                    {priceRange === "free"
                      ? "Free"
                      : priceRange === "low"
                      ? "$1-$100"
                      : priceRange === "medium"
                      ? "$101-$500"
                      : priceRange === "high"
                      ? "$501-$1,000"
                      : "$1,000+"}
                  </Tag>
                )}
                {showOnlyPerItem && (
                  <Tag
                    closable
                    onClose={() => setShowOnlyPerItem(false)}
                    className="rounded-full bg-orange-50 border-orange-200 text-orange-700"
                  >
                    Quantity-based
                  </Tag>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <Text className="text-gray-600">
          <span className="font-medium">{filteredServices.length}</span> of{" "}
          <span className="font-medium">
            {getAllAdditionalServices.data?.length || 0}
          </span>{" "}
          services
        </Text>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <Card className="text-center py-12">
            <div className="space-y-4">
              <div className="text-6xl">🔍</div>
              <div>
                <Title level={5} className="!mb-2 text-gray-600">
                  No services found
                </Title>
                <Text className="text-gray-500">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more services"
                    : "No services are currently available"}
                </Text>
              </div>
              {hasActiveFilters && (
                <Button
                  type="primary"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-h-[500px] pr-2">
            {/* <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-auto pr-2"> */}
            {filteredServices.map((service) => {
              const isSelected = isServiceSelected(service.serviceId);
              const selectedService = getSelectedService(service.serviceId);

              return (
                <Card
                  key={service.serviceId}
                  className={`transition-all duration-300 hover:shadow-lg cursor-pointer border-2 ${
                    isSelected
                      ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                  onClick={() => handleServiceToggle(service, !isSelected)}
                  size="small"
                >
                  <div className="space-y-3">
                    {/* Service Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleServiceToggle(service, e.target.checked);
                          }}
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <Title level={5} className="!mb-2 !leading-tight">
                            {service.serviceName}
                          </Title>
                          <div className="flex flex-wrap items-center gap-2">
                            <Tag
                              color="blue"
                              className="rounded-full text-xs font-medium border-0 px-3"
                            >
                              {service.serviceType.charAt(0).toUpperCase() +
                                service.serviceType.slice(1).toLowerCase()}
                            </Tag>
                            {service.isPerItem === 1 && (
                              <Tag
                                color="green"
                                className="rounded-full text-xs font-medium border-0 px-3"
                              >
                                Quantity-based
                              </Tag>
                            )}
                            {service.basePrice === 0 && (
                              <Tag
                                color="gold"
                                className="rounded-full text-xs font-medium border-0 px-3"
                              >
                                Free
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price Display */}
                      <div className="flex flex-col items-end text-right flex-shrink-0">
                        <Text className="text-xl font-bold text-blue-600">
                          {service.basePrice === 0
                            ? "Free"
                            : formatCurrency(service.basePrice)}
                        </Text>
                        {service.isPerItem === 1 && service.basePrice > 0 && (
                          <Text className="text-xs text-gray-500 font-medium">
                            per item
                          </Text>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector for Selected Items */}
                    {isSelected && service.isPerItem === 1 && (
                      <Card
                        size="small"
                        className="bg-white border border-blue-200 !mt-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <Text className="font-medium text-gray-700">
                              Quantity:
                            </Text>
                            <InputNumber
                              min={1}
                              max={100}
                              value={selectedService?.quantity || 1}
                              onChange={(value) =>
                                handleQuantityChange(service.serviceId, value)
                              }
                              className="w-20"
                              controls={true}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Text className="text-gray-600">Total:</Text>
                            <Text className="text-lg font-bold text-green-600">
                              {formatCurrency(
                                selectedService?.totalAmount ||
                                  service.basePrice
                              )}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalServicesSelector;
