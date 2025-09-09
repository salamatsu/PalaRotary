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
import RoomTypeViewModal from "./components/RoomTypeViewModal";

const { Title } = Typography;

// Optimized modal state hook - separate states for better performance
const useOptimizedModalState = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openAddModal = useCallback(() => {
    setSelectedItem(null);
    setAddModalVisible(true);
  }, []);

  const openEditModal = useCallback((item) => {
    setSelectedItem(item);
    setEditModalVisible(true);
  }, []);

  const openViewModal = useCallback((item) => {
    setSelectedItem(item);
    setViewModalVisible(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setAddModalVisible(false);
    setSelectedItem(null);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModalVisible(false);
    setSelectedItem(null);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewModalVisible(false);
    setSelectedItem(null);
  }, []);

  return {
    // Modal states
    addModalVisible,
    editModalVisible,
    viewModalVisible,
    selectedItem,
    // Modal actions
    openAddModal,
    openEditModal,
    openViewModal,
    closeAddModal,
    closeEditModal,
    closeViewModal,
  };
};

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
        <Space>{children}</Space>
      </Col>
    </Row>
  </Card>
);

const ActionButtons = React.memo(
  ({ record, onEdit, onView, showView = false }) => (
    <Space>
      {showView && (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
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
    </Space>
  )
);

// Separate Add Modal Component for better performance
const AddRoomTypeModal = React.memo(
  ({ open, onClose, onSubmit, branches, loading }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
      onSubmit(values);
      form.resetFields();
    };

    useEffect(() => {
      if (!open) {
        form.resetFields();
      }
    }, [open, form]);

    return (
      <Modal
        title="Add New Room Type"
        open={open}
        onCancel={onClose}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <RoomTypeForm branches={branches} />
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-blue-600"
              >
                Create Room Type
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

// Separate Edit Modal Component for better performance
const EditRoomTypeModal = React.memo(
  ({ open, onClose, onSubmit, branches, selectedItem, loading }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
      onSubmit(values);
    };

    useEffect(() => {
      if (open && selectedItem) {
        form.setFieldsValue({
          ...selectedItem,
          isActive: selectedItem.isActive === 1,
          amenities: parseJsonField(selectedItem.amenities),
          features: parseJsonField(selectedItem.features),
        });
      }
    }, [open, selectedItem, form]);

    return (
      <Modal
        title="Edit Room Type"
        open={open}
        onCancel={onClose}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <RoomTypeForm branches={branches} />
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-blue-600"
              >
                Update Room Type
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

const RoomTypes = () => {
  const { message, modal } = App.useApp();

  const getAllRoomTypesApi = useGetAllRoomTypesApi();
  const getAllBranchesApi = useGetAllBranchesApi();
  const addRoomTypeApi = useAddRoomTypeApi();
  const updateRoomTypeApi = useUpdateRoomTypeApi();
  const updateRoomTypeStatusApi = useUpdateRoomTypeStatusApi();

  // Use optimized modal state
  const {
    addModalVisible,
    editModalVisible,
    viewModalVisible,
    selectedItem,
    openAddModal,
    openEditModal,
    openViewModal,
    closeAddModal,
    closeEditModal,
    closeViewModal,
  } = useOptimizedModalState();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

  const filteredRoomTypes = useTableData(
    getAllRoomTypesApi.data,
    searchTerm,
    filters
  );

  // Memoized columns to prevent unnecessary re-renders
  const columns = React.useMemo(
    () => [
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_, record) => (
          <ActionButtons
            record={record}
            onEdit={openEditModal}
            onView={openViewModal}
            showView
          />
        ),
      },
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
            <div className="text-gray-500 text-sm line-clamp-1">
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
        render: (amenities) => {
          const parsedAmenities = parseJsonField(amenities);
          return (
            <div className="flex flex-wrap gap-1">
              {parsedAmenities.slice(0, 3).map((amenity, idx) => (
                <Tag key={idx} size="small">
                  {amenity}
                </Tag>
              ))}
              {parsedAmenities.length > 3 && (
                <Tag size="small">+{parsedAmenities.length - 3} more</Tag>
              )}
            </div>
          );
        },
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
          <Popconfirm
            title="Confirm Status Change"
            description={`Are you sure you want to ${
              isActive ? "deactivate" : "activate"
            } this room type?`}
            onConfirm={() => handleToggleStatus(record.roomTypeId, isActive)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              loading={updateRoomTypeStatusApi.isPending}
              className="flex items-center gap-1 border-none shadow-none p-0"
              type="text"
            >
              <StatusBadge status={isActive ? "Active" : "Inactive"} />
              <SwapOutlined className="text-xs text-gray-400 hover:text-gray-600" />
            </Button>
          </Popconfirm>
        ),
        filters: STATUS_FILTERS,
        onFilter: (value, record) => record.isActive === value,
      },
    ],
    [openEditModal, openViewModal, updateRoomTypeStatusApi.isPending]
  );

  // Optimized submit handlers
  const handleAddRoomType = useCallback(
    (values) => {
      const { isActive, ...otherValues } = values;
      addRoomTypeApi.mutate(
        { ...otherValues, isActive: isActive ? 1 : 0 },
        {
          onSuccess: () => {
            message.success("Room type created successfully");
            closeAddModal();
            getAllRoomTypesApi.refetch();
          },
          onError: (error) => {
            message.error(
              error.response?.data?.message || "Failed to create room type"
            );
          },
        }
      );
    },
    [addRoomTypeApi, message, closeAddModal, getAllRoomTypesApi]
  );

  const handleEditRoomType = useCallback(
    (values) => {
      const { isActive, ...otherValues } = values;
      updateRoomTypeApi.mutate(
        {
          roomTypeId: selectedItem.roomTypeId,
          ...otherValues,
          isActive: isActive ? 1 : 0,
        },
        {
          onSuccess: () => {
            message.success("Room type updated successfully");
            closeEditModal();
            getAllRoomTypesApi.refetch();
          },
          onError: (error) => {
            message.error(
              error.response?.data?.message || "Failed to update room type"
            );
          },
        }
      );
    },
    [
      updateRoomTypeApi,
      selectedItem,
      message,
      closeEditModal,
      getAllRoomTypesApi,
    ]
  );

  const handleToggleStatus = useCallback(
    (roomTypeId, isActive) => {
      updateRoomTypeStatusApi.mutate(
        {
          roomTypeId,
          isActive: isActive === 0 ? 1 : 0,
        },
        {
          onSuccess: () => {
            const actionText = isActive ? "deactivated" : "activated";
            message.success(`Room type ${actionText} successfully`);
            getAllRoomTypesApi.refetch();
          },
          onError: (error) => {
            const actionText = isActive ? "deactivate" : "activate";
            message.error(
              error.response?.data?.message ||
                `Failed to ${actionText} room type`
            );
          },
        }
      );
    },
    [updateRoomTypeStatusApi, message, getAllRoomTypesApi]
  );

  // Memoized branch options
  const branchOptions = React.useMemo(
    () =>
      getAllBranchesApi.data?.map((branch) => ({
        label: branch.branchName,
        value: branch.branchId,
      })) || [],
    [getAllBranchesApi.data]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={2} className="mb-0">
          Room Type Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddModal}
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
          options={branchOptions}
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

      {/* Separate Add Modal - only renders when needed */}
      {addModalVisible && (
        <AddRoomTypeModal
          open={addModalVisible}
          onClose={closeAddModal}
          onSubmit={handleAddRoomType}
          branches={getAllBranchesApi.data}
          loading={addRoomTypeApi.isPending}
        />
      )}

      {/* Separate Edit Modal - only renders when needed */}
      {editModalVisible && (
        <EditRoomTypeModal
          open={editModalVisible}
          onClose={closeEditModal}
          onSubmit={handleEditRoomType}
          branches={getAllBranchesApi.data}
          selectedItem={selectedItem}
          loading={updateRoomTypeApi.isPending}
        />
      )}

      {/* View Modal - only renders when needed */}
      {viewModalVisible && (
        <RoomTypeViewModal
          open={viewModalVisible}
          onClose={closeViewModal}
          roomTypeData={selectedItem}
          loading={getAllRoomTypesApi.isLoading}
        />
      )}
    </div>
  );
};

export default RoomTypes;
