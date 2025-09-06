import { Form, Select, Spin } from "antd";
import { Suspense, useCallback, useEffect, useMemo } from "react";
import { useAddressData } from "../../hooks/useAddressData";

const AddressForm = ({ form }) => {
  const {
    regionsData,
    provincesData,
    citiesData,
    isLoadingRegions,
    isLoadingProvinces,
    isLoadingCities,
    loadProvincesData,
    loadCitiesData,
  } = useAddressData();

  // Watch form values
  const selectedRegion = Form.useWatch("region", form);
  const selectedProvince = Form.useWatch("province", form);

  // Load provinces when region changes
  useEffect(() => {
    if (selectedRegion) {
      loadProvincesData(selectedRegion);
      // Clear dependent fields when region changes
      form.setFieldsValue({
        province: undefined,
        city: undefined,
      });
    } else {
      loadProvincesData(null);
    }
  }, [selectedRegion, loadProvincesData, form]);

  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadCitiesData(selectedProvince);
      // Clear city when province changes
      form.setFieldsValue({
        city: undefined,
      });
    } else {
      loadCitiesData(null);
    }
  }, [selectedProvince, loadCitiesData, form]);

  // Memoized region options
  const regionOptions = useMemo(() => {
    if (!regionsData.length) return [];

    return regionsData.map((region) => ({
      label: region.regDesc,
      value: region.regCode,
      key: region.regCode,
    }));
  }, [regionsData]);

  // Memoized province options
  const provinceOptions = useMemo(() => {
    if (!provincesData.length) return [];

    return provincesData.map((province) => ({
      label: province.provDesc,
      value: province.provCode,
      key: province.provCode,
    }));
  }, [provincesData]);

  // Memoized city options
  const cityOptions = useMemo(() => {
    if (!citiesData.length) return [];

    return citiesData.map((city) => ({
      label: city.citymunDesc,
      value: city.citymunCode,
      key: city.citymunCode,
    }));
  }, [citiesData]);

  // Handle region change
  const handleRegionChange = useCallback(
    (value) => {
      form.setFieldsValue({
        region: value,
        province: undefined,
        city: undefined,
      });
    },
    [form]
  );

  // Handle province change
  const handleProvinceChange = useCallback(
    (value) => {
      form.setFieldsValue({
        province: value,
        city: undefined,
      });
    },
    [form]
  );

  // Handle city change
  const handleCityChange = useCallback(
    (value) => {
      form.setFieldsValue({
        city: value,
      });
    },
    [form]
  );

  // Filter option function for search functionality
  const filterOption = useCallback(
    (input, option) =>
      option?.label?.toLowerCase().includes(input.toLowerCase()),
    []
  );

  return (
    <Suspense fallback={<Spin size="large" />}>
      {/* Region Selection */}
      <Form.Item
        name="region"
        label="Region"
        rules={[{ required: true, message: "Please select your region!" }]}
      >
        <Select
          placeholder="Select Region"
          onChange={handleRegionChange}
          showSearch
          filterOption={filterOption}
          allowClear
          loading={isLoadingRegions}
          disabled={isLoadingRegions}
          options={regionOptions}
          notFoundContent={
            isLoadingRegions ? "Loading regions..." : "No regions found"
          }
        />
      </Form.Item>

      {/* Province Selection */}
      <Form.Item
        name="province"
        label="Province"
        rules={[{ required: true, message: "Please select your province!" }]}
      >
        <Select
          placeholder="Select Province"
          onChange={handleProvinceChange}
          showSearch
          filterOption={filterOption}
          allowClear
          loading={isLoadingProvinces}
          disabled={!selectedRegion || isLoadingProvinces}
          options={provinceOptions}
          notFoundContent={
            !selectedRegion
              ? "Please select a region first"
              : isLoadingProvinces
              ? "Loading provinces..."
              : "No provinces found"
          }
        />
      </Form.Item>

      {/* City Selection */}
      <Form.Item
        name="city"
        label="City/Municipality"
        rules={[{ required: true, message: "Please select your city!" }]}
      >
        <Select
          placeholder="Select City/Municipality"
          onChange={handleCityChange}
          showSearch
          filterOption={filterOption}
          allowClear
          disabled={!selectedProvince || isLoadingCities}
          loading={isLoadingCities}
          options={cityOptions}
          notFoundContent={
            !selectedProvince
              ? "Please select a province first"
              : isLoadingCities
              ? "Loading cities..."
              : "No cities found"
          }
        />
      </Form.Item>
    </Suspense>
  );
};

export default AddressForm;
