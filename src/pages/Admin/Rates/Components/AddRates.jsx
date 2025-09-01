import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  App,
  DatePicker,
  InputNumber,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const AddRates = ({ isModalVisible, setIsModalVisible, editingRecord = null, roomTypes = [], rateTypes = [], branches = [] }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    console.log("Submitted:", values);
    // API call here
    message.success(editingRecord ? "Rate updated!" : "Rate created!");
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue(editingRecord);
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  return (
    <Modal
      title={null}
      open={isModalVisible}
      onCancel={handleClose}
      footer={null}
      width={700}
      centered
      closeIcon={
        <CloseOutlined className="text-gray-400 hover:text-gray-600 text-lg p-2" />
      }
      styles={{
        mask: { backdropFilter: "blur(8px)", backgroundColor: "rgba(0, 0, 0, 0.2)" },
        content: {
          borderRadius: "0px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          padding: "0px",
        },
      }}
    >
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-lg font-medium text-black m-0">
          {editingRecord ? "Edit Rate" : "Add New Rate"}
        </h1>
      </div>

      {/* Form */}
      <div className="py-2 px-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* Room Type & Rate Type */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="roomTypeId"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Room Type</span>}
              rules={[{ required: true, message: "Required" }]}
              className="mb-4"
            >
              <Select placeholder="Select room type" className="text-sm">
                {roomTypes.map((roomType) => (
                  <Option key={roomType.roomTypeId} value={roomType.roomTypeId}>
                    {roomType.roomTypeName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="rateTypeId"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Rate Type</span>}
              rules={[{ required: true, message: "Required" }]}
              className="mb-4"
            >
              <Select placeholder="Select rate type" className="text-sm">
                {rateTypes.map((rateType) => (
                  <Option key={rateType.rateTypeId} value={rateType.rateTypeId}>
                    {rateType.rateTypeName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Branch & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="branchId"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Branch</span>}
              rules={[{ required: true, message: "Required" }]}
              className="mb-4"
            >
              <Select placeholder="Select branch" className="text-sm">
                {branches.map((branch) => (
                  <Option key={branch.branchId} value={branch.branchId}>
                    {branch.branchName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="currency"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Currency</span>}
              rules={[{ required: true, message: "Required" }]}
              initialValue="PHP"
              className="mb-4"
            >
              <Select placeholder="Select currency" className="text-sm">
                <Option value="PHP">Philippine Peso (₱)</Option>
                <Option value="USD">US Dollar ($)</Option>
                <Option value="EUR">Euro (€)</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Base Rate & Status */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="baseRate"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Base Rate</span>}
              rules={[
                { required: true, message: "Required" },
                { type: "number", min: 0, message: "Rate must be positive!" },
              ]}
              className="mb-4"
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="1500.00"
                className="w-full h-9 text-sm"
                formatter={(value) =>
                  `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
              />
            </Form.Item>

            <div className="flex flex-col space-y-2">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Status
              </span>
              <Form.Item name="isActive" valuePropName="checked" className="mt-4">
                <div className="flex items-center pt-3 pl-2">
                  <p className="text-xs text-gray-500 pr-2">Rate is:</p>
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </div>
              </Form.Item>
            </div>
          </div>

          {/* Effective Period */}
          <Form.Item
            name="effectivePeriod"
            label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Effective Period</span>}
            rules={[{ required: true, message: "Required" }]}
            className="mb-4"
          >
            <DatePicker.RangePicker
              className="w-full text-sm"
              placeholder={["Start Date", "End Date"]}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          {/* Notes */}
          <Form.Item
            name="notes"
            label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Notes</span>}
            tooltip="Additional notes or conditions for this rate"
            className="mb-6"
          >
            <TextArea
              rows={3}
              placeholder="Any special conditions, restrictions, or notes..."
              className="text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none resize-none"
            />
          </Form.Item>
        </Form>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
        <Button
          onClick={handleClose}
          className="h-9 px-6 text-sm font-medium text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-700 focus:border-gray-400 focus:text-gray-700"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          onClick={() => form.submit()}
          loading={loading}
          className="h-9 px-6 text-sm font-medium bg-black border-black hover:bg-gray-800 hover:border-gray-800 focus:bg-gray-800 focus:border-gray-800"
        >
          {loading
            ? `${editingRecord ? "Updating" : "Creating"}...`
            : `${editingRecord ? "Update" : "Create"} Rate`}
        </Button>
      </div>
    </Modal>
  );
};

export default AddRates;
