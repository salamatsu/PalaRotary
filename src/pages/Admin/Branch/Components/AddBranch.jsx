import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button, message, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const AddBranch = ({ isModalVisible, setIsModalVisible, editingRecord = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form values:', values);
      message.success(`Branch ${editingRecord ? 'updated' : 'created'} successfully`);
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={null}
      open={isModalVisible}
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
          {editingRecord ? "Edit Branch" : "Add New Branch"}
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
          {/* Branch Code & Name */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="branchCode"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Branch Code</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <Input
                placeholder="BR001"
                className="h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
            <Form.Item
              name="branchName"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Branch Name</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <Input
                placeholder="Metro Manila Branch"
                className="h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
          </div>

          {/* Address */}
          <Form.Item
            name="address"
            label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Address</span>}
            rules={[{ required: true, message: 'Required' }]}
            className="mb-4"
          >
            <TextArea
              rows={2}
              placeholder="Complete address"
              className="text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none resize-none"
            />
          </Form.Item>

          {/* City & Region */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="city"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">City</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <Input
                placeholder="Manila"
                className="h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
            <Form.Item
              name="region"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Region</span>}
              rules={[{ required: true, message: 'Required' }]}
              className="mb-4"
            >
              <Select
                placeholder="Select region"
                className="text-sm"
                style={{ height: '36px' }}
              >
                <Option value="NCR">NCR</Option>
                <Option value="Region I">Region I</Option>
                <Option value="Region IV-A">Region IV-A</Option>
                <Option value="Region II">Region II</Option>
                <Option value="Region III">Region III</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Contact Number & Email */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="contactNumber"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Contact Number</span>}
              className="mb-4"
            >
              <Input
                placeholder="+63 2 1234 5678"
                className="h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
            <Form.Item
              name="email"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Email</span>}
              className="mb-4"
            >
              <Input
                type="email"
                placeholder="branch@hotel.com"
                className="h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
          </div>

          {/* Operating Hours & Status */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="operatingHours"
              label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Operating Hours</span>}
              className="mb-4"
            >
              <Input
                placeholder="24/7"
                className="h-9 text-sm border-gray-200 hover:border-black focus:border-black focus:shadow-none"
              />
            </Form.Item>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Status</span>
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-medium text-black">Active</span>
                  <p className="text-xs text-gray-500 mt-1">Branch is operational</p>
                </div>
                <Form.Item name="isActive" valuePropName="checked" className="mb-0">
                  <Switch
                    size="small"
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    style={{
                      backgroundColor: '#d1d5db'
                    }}
                    className="bg-gray-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <Form.Item
            name="amenities"
            label={<span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Amenities</span>}
            className="mb-6"
          >
            <Select
              mode="tags"
              placeholder="Add amenities"
              tokenSeparators={[',']}
              className="text-sm"
            >
              <Option value="WiFi">WiFi</Option>
              <Option value="Parking">Parking</Option>
              <Option value="Restaurant">Restaurant</Option>
              <Option value="Pool">Pool</Option>
              <Option value="Gym">Gym</Option>
              <Option value="Spa">Spa</Option>
              <Option value="Conference Room">Conference Room</Option>
              <Option value="Business Center">Business Center</Option>
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
          {loading ? `${editingRecord ? 'Updating' : 'Creating'}...` : `${editingRecord ? 'Update' : 'Create'} Branch`}
        </Button>
      </div>
    </Modal>
  );
};

export default AddBranch