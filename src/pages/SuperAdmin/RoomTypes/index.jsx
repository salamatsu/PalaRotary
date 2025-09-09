import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import RoomTypeForm from "../../../components/forms/RoomTypeForm";
import { StatusBadge } from "../../../components/ui/badges/StatusBadge";
import { useModal } from "../../../hooks/useModal";
import { useTableData } from "../../../hooks/useTableData";
import { STATUS_FILTERS } from "../../../lib/constants";
import { useGetAllBranchesApi } from "../../../services/requests/useBranches";
import {
  useAddRoomTypeApi,
  useGetAllRoomTypesApi,
  useUpdateRoomTypeApi,
  useUpdateRoomTypeStatusApi,
} from "../../../services/requests/useRoomTypes";
import { parseJsonField } from "../../../utils/parseJsonField";

const { Title } = Typography;

const FilterBar = ({ onSearch, onFilter, children }) => (
  <Card className="mb-4 shadow-sm">
    <Row gutter={[16, 16]} align="middle">
      <Col flex="auto">
        <Input.Search
          placeholder="Search..."
          allowClear
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-md"
        />
      </Col>
      <Col>
        <Space>
          {children}
          {/* <Button icon={<FilterOutlined />}>Filters</Button>
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button icon={<ReloadOutlined />}>Refresh</Button> */}
        </Space>
      </Col>
    </Row>
  </Card>
);
const ActionButtons = ({
  record,
  onEdit,
  onDelete,
  onView,
  showView = false,
}) => (
  <Space>
    {showView && (
      <Tooltip title="View Details">
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => onView?.(record)}
          className="text-blue-500 hover:text-blue-700"
        />
      </Tooltip>
    )}
    <Tooltip title="Edit">
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={() => onEdit(record)}
        className="text-green-500 hover:text-green-700"
      />
    </Tooltip>
    <Popconfirm
      title="Are you sure you want to delete this record?"
      onConfirm={() => onDelete(record)}
      okText="Yes"
      cancelText="No"
    >
      <Tooltip title="Delete">
        <Button
          type="text"
          icon={<DeleteOutlined />}
          className="text-red-500 hover:text-red-700"
        />
      </Tooltip>
    </Popconfirm>
  </Space>
);

const StatusRenderer = React.memo(({ isActive, onClick, loading = false }) => (
  <Button
    size="small"
    onClick={onClick}
    loading={loading}
    className="flex items-center gap-1 border-none shadow-none p-0"
    type="text"
  >
    <StatusBadge status={isActive ? "Active" : "Inactive"} />
    <SwapOutlined className="text-xs text-gray-400 hover:text-gray-600" />
  </Button>
));

const RoomTypes = () => {
  const { message, modal } = App.useApp();

  const getAllRoomTypesApi = useGetAllRoomTypesApi();
  const getAllBranchesApi = useGetAllBranchesApi();
  const addRoomTypeApi = useAddRoomTypeApi();
  const updateRoomTypeApi = useUpdateRoomTypeApi();
  const updateRoomTypeStatusApi = useUpdateRoomTypeStatusApi();

  const [roomTypes, setRoomTypes] = useState(getAllRoomTypesApi.data);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { isVisible, editingRecord, showModal, hideModal } = useModal();
  const [form] = Form.useForm();

  const filteredRoomTypes = useTableData(
    getAllRoomTypesApi.data,
    searchTerm,
    filters
  );
  const columns = [
    {
      title: "Code",
      dataIndex: "roomTypeCode",
      key: "roomTypeCode",
      width: 100,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: "Room Type",
      dataIndex: "roomTypeName",
      key: "roomTypeName",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-gray-500 text-sm  line-clamp-1">
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: "Configuration",
      key: "configuration",
      render: (_, record) => (
        <div>
          <span>{record.bedConfiguration}</span>
          <div className="text-gray-500 text-sm">
            {record.maxOccupancy} Max • {record.roomSize}sqm
          </div>
        </div>
      ),
    },
    {
      title: "Amenities",
      dataIndex: "amenities",
      key: "amenities",
      render: (amenities) => (
        <div className="flex flex-wrap gap-1">
          {parseJsonField(amenities)
            .slice(0, 3)
            .map((amenity, idx) => (
              <Tag key={idx} size="small">
                {amenity}
              </Tag>
            ))}
          {parseJsonField(amenities).length > 3 && (
            <Tag size="small">+{parseJsonField(amenities).length - 3} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive, record) => (
        <StatusRenderer
          isActive={isActive}
          onClick={() =>
            handleToggleStatus({ roomTypeId: record.roomTypeId, isActive })
          }
        />
      ),
      filters: STATUS_FILTERS,
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={showModal}
          onDelete={handleDeleteRoomType}
          showView
        />
      ),
    },
  ];

  const handleSubmitRoomType = ({ isActive, ...values }) => {
    if (editingRecord) {
      console.log({ isActive });

      updateRoomTypeApi.mutate(
        {
          roomTypeId: editingRecord.roomTypeId,
          ...values,
          isActive: isActive ? 1 : 0,
        },
        {
          onSuccess: (data) => {
            console.log(data);
            message.success("Room type updated successfully");
            hideModal();
            getAllRoomTypesApi.refetch();
          },
          onError: (error) => {
            message.error(
              error.response?.data?.message || `Failed to ${actionText} branch`
            );
          },
        }
      );
    } else {
      addRoomTypeApi.mutate(
        { ...values, isActive: isActive ? 1 : 0 },
        {
          onSuccess: (data) => {
            message.success("Room type created successfully");
            hideModal();
            getAllRoomTypesApi.refetch();
          },
          onError: (error) => {
            message.error(
              error.response?.data?.message || `Failed to ${actionText} branch`
            );
          },
        }
      );
    }

    console.log(values);
    // hideModal();
    // form.resetFields();
  };

  const handleToggleStatus = ({ roomTypeId, isActive }) => {
    const actionText = isActive ? "deactivate" : "activate";

    modal.confirm({
      title: "Confirm Status Change",
      content: `Are you sure you want to ${actionText} this room type?`,
      okText: "Yes",
      cancelText: "No",
      okButtonProps: {
        className: isActive
          ? "bg-red-500 hover:bg-red-600"
          : "bg-green-500 hover:bg-green-600",
      },
      onOk: () => {
        updateRoomTypeStatusApi.mutate(
          {
            roomTypeId,
            isActive: isActive === 0 ? 1 : 0,
          },
          {
            onSuccess: () => {
              message.success(`Branch ${actionText}d successfully`);
              getAllRoomTypesApi.refetch();
            },
            onError: (error) => {
              message.error(
                error.response?.data?.message ||
                `Failed to ${actionText} branch`
              );
            },
          }
        );
      },
    });
  }

  const handleDeleteRoomType = (record) => {
    setRoomTypes((prev) =>
      prev.filter((rt) => rt.roomTypeId !== record.roomTypeId)
    );
    message.success("Room type deleted successfully");
  };

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        isActive: editingRecord.isActive === 1,
        amenities: parseJsonField(editingRecord.amenities),
        features: parseJsonField(editingRecord.features),
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Room Type Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Room Type
        </Button>
      </div>

      <FilterBar onSearch={setSearchTerm}>
        <Select
          placeholder="Filter by Branch"
          allowClear
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, branchId: value }))
          }
          className="w-48"
          options={getAllBranchesApi.data.map((branch) => ({
            label: branch.branchName,
            value: branch.branchId,
          }))}
        />
      </FilterBar>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredRoomTypes}
          rowKey="roomTypeId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} room types`,
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? "Edit Room Type" : "Add New Room Type"}
        open={isVisible}
        onCancel={hideModal}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitRoomType}
          className="mt-4"
        >
          <RoomTypeForm branches={getAllBranchesApi.data} />
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={hideModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingRecord ? "Update" : "Create"} Room Type
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomTypes;
