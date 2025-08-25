import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button, message, InputNumber } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const AddRoomType = ({ open, setOpen, editingRecord = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form values:', values);
      message.success(`Room type ${editingRecord ? 'updated' : 'created'} successfully`);
      setOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save room type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      centered
      closeIcon={
        <CloseOutlined className="text-gray-400 hover:text-gray-600 text-lg p-2" />
      }
      styles={{
        mask: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.2)' },
        content: {
          borderRadius: '0px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '0px'
        }
      }}
    >
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-lg font-medium text-black m-0">
          {editingRecord ? "Edit Room Type" : "Add New Room Type"}
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
          {/* Room Type Code & Name */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="roomTypeCode"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Room Type Code</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <Input
                placeholder="STD001"
                className="h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
            <Form.Item
              name="roomTypeName"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Room Type Name</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <Input
                placeholder="Standard Room"
                className="h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
          </div>

          {/* Description */}
          <Form.Item
            name="description"
            label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Description</span>}
            rules={[{ required: true, message: 'Required' }]}
            className="mb-4"
          >
            <TextArea
              rows={3}
              placeholder="Room type description and features"
              className="text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none resize-none"
            />
          </Form.Item>

          {/* Capacity & Size */}
          <div className="grid grid-cols-4">
            <Form.Item
              name="maxOccupancy"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Max Occupancy</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <InputNumber
                min={1}
                max={20}
                placeholder="2"
                className="w-full h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
            <Form.Item
              name="roomSize"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Room Size (sqm)</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <InputNumber
                min={1}
                placeholder="25"
                className="w-full h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>

            <Form.Item
              name="baseRate"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Base Rate (₱)</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <InputNumber
                min={0}
                step={100}
                placeholder="2500"
                formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₱\s?|(,*)/g, '')}
                className="w-full h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
            <Form.Item
              name="extraPersonRate"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Extra Person Rate (₱)</span>}
              className="mb-4"
            >
              <InputNumber
                min={0}
                step={100}
                placeholder="500"
                formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/₱\s?|(,*)/g, '')}
                className="w-full h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
          </div>

          {/* Bed Type & Room Category */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="bedType"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Bed Type</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <Select
                placeholder="Select bed type"
                className="text-sm"
                style={{ height: '36px' }}
              >
                <Option value="Single">Single Bed</Option>
                <Option value="Double">Double Bed</Option>
                <Option value="Queen">Queen Bed</Option>
                <Option value="King">King Bed</Option>
                <Option value="Twin">Twin Beds</Option>
                <Option value="Bunk">Bunk Beds</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="category"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Category</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <Select
                placeholder="Select category"
                className="text-sm"
                style={{ height: '36px' }}
              >
                <Option value="Standard">Standard</Option>
                <Option value="Deluxe">Deluxe</Option>
                <Option value="Premium">Premium</Option>
                <Option value="Suite">Suite</Option>
                <Option value="Executive">Executive</Option>
              </Select>
            </Form.Item>
          </div>

          {/* View Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="viewType"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">View Type</span>}
              className="mb-4"
            >
              <Select
                placeholder="Select view type"
                className="text-sm"
                style={{ height: '36px' }}
              >
                <Option value="City">City View</Option>
                <Option value="Garden">Garden View</Option>
                <Option value="Pool">Pool View</Option>
                <Option value="Ocean">Ocean View</Option>
                <Option value="Mountain">Mountain View</Option>
                <Option value="Interior">Interior View</Option>
              </Select>
            </Form.Item>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Status</span>
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-black">Active</span>
                  <p className="text-xs text-gray-500 mt-1">Room type is available</p>
                </div>
                <Form.Item name="isActive" valuePropName="checked" className="mb-0">
                  <Switch
                    size="small"
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    // style={{
                    //   backgroundColor: '#d1d5db'
                    // }}
                    className="bg-gray-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <Form.Item
            name="amenities"
            label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Room Amenities</span>}
            className="mb-6"
          >
            <Select
              mode="tags"
              placeholder="Add room amenities"
              tokenSeparators={[',']}
              className="text-sm"
            >
              <Option value="Air Conditioning">Air Conditioning</Option>
              <Option value="WiFi">WiFi</Option>
              <Option value="TV">TV</Option>
              <Option value="Mini Bar">Mini Bar</Option>
              <Option value="Safe">Safe</Option>
              <Option value="Balcony">Balcony</Option>
              <Option value="Bathtub">Bathtub</Option>
              <Option value="Shower">Shower</Option>
              <Option value="Hair Dryer">Hair Dryer</Option>
              <Option value="Coffee Maker">Coffee Maker</Option>
              <Option value="Telephone">Telephone</Option>
              <Option value="Room Service">Room Service</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
        <Button
          onClick={handleCancel}
          className="h-9 px-6 text-sm font-medium text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-700 focus:border-gray-400 focus:text-gray-700"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
          className="h-9 px-6 text-sm font-medium bg-black border-black hover:bg-gray-800 hover:border-gray-800 focus:bg-gray-800 focus:border-gray-800"
        >
          {loading ? `${editingRecord ? 'Updating' : 'Creating'}...` : `${editingRecord ? 'Update' : 'Create'} Room Type`}
        </Button>
      </div>
    </Modal>
  );
};

export default AddRoomType;