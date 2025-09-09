import { Form, Input, InputNumber, Select, Switch } from "antd";
import { AMENITIES, BED_CONFIGURATIONS } from "../../lib/constants";
const { Option } = Select;
const RoomTypeForm = ({ branches = [] }) => {
  return (
    <>
      <Form.Item
        name="branchId"
        label="Branch"
        rules={[
          {
            required: false,
            message: "Please select branch!",
          },
        ]}
      >
        <Select
          placeholder="Select branch (optional for all branches)"
          allowClear
          options={branches.map((branch) => ({
            label: branch.branchName,
            value: branch.branchId,
          }))}
        />
      </Form.Item>
      <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="roomTypeCode"
          label="Room Type Code"
          rules={[{ required: true, message: "Please input room type code!" }]}
        >
          <Input placeholder="e.g., STD, DLX, STE" />
        </Form.Item>
        <Form.Item
          name="roomTypeName"
          label="Room Type Name"
          rules={[{ required: true, message: "Please input room type name!" }]}
        >
          <Input placeholder="e.g., Standard Room" />
        </Form.Item>
      </div>
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-4">
        <Form.Item
          name="maxOccupancy"
          label="Max Occupancy"
          rules={[{ required: true, message: "Please input max occupancy!" }]}
          initialValue={2}
        >
          <InputNumber
            min={1}
            max={10}
            placeholder="2"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="roomSize" label="Room Size">
          <Input placeholder="25 sqm" />
        </Form.Item>

        <Form.Item name="isActive" label="Status" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
        </Form.Item>
      </div>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={2} placeholder="Room type description" />
      </Form.Item>
      <Form.Item name="bedConfiguration" label="Bed Configuration">
        <Select
          placeholder="Select bed configuration"
          allowClear
          options={BED_CONFIGURATIONS.map((bed) => ({
            label: bed,
            value: bed,
          }))}
        />
      </Form.Item>
      <Form.Item name="amenities" label="Amenities">
        <Select
          mode="tags"
          placeholder="Add amenities"
          tokenSeparators={[","]}
          allowClear
          options={AMENITIES.map((group) => ({
            label: group.category,
            options: group.amenities.map((item) => ({
              label: item,
              value: item,
            })),
          }))}
        />
      </Form.Item>

      <Form.Item name="features" label="Features">
        <Select mode="tags" placeholder="Add features" tokenSeparators={[","]}>
          <Option value="Private Bathroom">Private Bathroom</Option>
          <Option value="Jacuzzi">Jacuzzi</Option>
          <Option value="Kitchenette">Kitchenette</Option>
          <Option value="Work Desk">Work Desk</Option>
          <Option value="Sofa">Sofa</Option>
        </Select>
      </Form.Item>

      {/* <Form.Item name="imageUrl" label="Image URL">
                <Input placeholder="https://example.com/room-image.jpg" />
              </Form.Item> */}
    </>
  );
};

export default RoomTypeForm;
