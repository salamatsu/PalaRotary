import {
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Form,
  Input,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Mail, Phone } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import {
  useGetAllBranchesApi,
  useUpdateBranchStatusApi,
} from "../../../services/requests/useBranches";
import { DATE_FORMATS, formatDateTime } from "../../../utils/formatDate";
import { useStyledTable } from "../../../hooks/useStyleTable";
import AddBranch from "./Components/AddBranch";
import BranchInfoModal from "./Components/BranchInfoModal";
import UpdateBranch from "./Components/UpdateBranch";
import { StatusBadge } from "../../../components/ui/badges/StatusBadge";

const { Title } = Typography;

// Constants
const PAGINATION_CONFIG = {
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ["10", "25", "50", "100"],
};

const STATUS_FILTERS = [
  { text: "Active", value: true },
  { text: "Inactive", value: false },
];

// Utility functions
const filterTableData = (dataSource, searchTerm, filters) => {
  if (!dataSource?.length) return [];

  let filteredData = dataSource;

  // Search filter
  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    filteredData = filteredData.filter((item) => {
      const searchFields = [
        item.branchCode,
        item.branchName,
        item.city,
        item.region,
        item.contactNumber,
        item.email,
      ];

      return searchFields.some((field) =>
        field?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }

  // Additional filters
  if (Object.keys(filters).length > 0) {
    filteredData = filteredData.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === "") return true;
        return item[key] === value;
      });
    });
  }

  return filteredData;
};

// Memoized renderers
const LocationRenderer = React.memo(({ record }) => (
  <div className="flex flex-col gap-1.5">
    <div className="font-medium text-gray-900 truncate">{record.citymunDesc}</div>
    <small className="text-gray-500 truncate">{record.regDesc}</small>
  </div>
));
LocationRenderer.displayName = "LocationRenderer";

const ContactRenderer = React.memo(({ record }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1.5">
      <Phone className="w-3 h-3 text-gray-400" />
      <span className="text-sm text-gray-700">
        {record.contactNumber || "-"}
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <Mail className="w-3 h-3 text-gray-400" />
      <span
        className="text-sm text-gray-500 truncate max-w-[120px]"
        title={record.email}
      >
        {record.email || "-"}
      </span>
    </div>
  </div>
));
ContactRenderer.displayName = "ContactRenderer";

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
StatusRenderer.displayName = "StatusRenderer";

// Action handlers
const useActionHandlers = () => {
  const { modal, message } = App.useApp();
  const updateBranchStatusApi = useUpdateBranchStatusApi();
  const getAllBranchesApi = useGetAllBranchesApi();

  const handleToggleStatus = useCallback(
    ({ branchId, isActive }) => {
      const actionText = isActive ? "deactivate" : "activate";

      modal.confirm({
        title: "Confirm Status Change",
        content: `Are you sure you want to ${actionText} this branch?`,
        okText: "Yes",
        cancelText: "No",
        okButtonProps: {
          className: isActive
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600",
        },
        onOk: () => {
          updateBranchStatusApi.mutate(
            {
              branchId,
              isActive: isActive === 0 ? 1 : 0,
            },
            {
              onSuccess: () => {
                message.success(`Branch ${actionText}d successfully`);
                getAllBranchesApi.refetch();
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
    },
    [modal, message, updateBranchStatusApi, getAllBranchesApi]
  );

  return { handleToggleStatus };
};

// Modal state management
const useModalState = () => {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view', 'edit', null

  const openModal = useCallback((type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (type === "add") {
      setIsAddModalVisible(true);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedItem(null);
    setIsAddModalVisible(false);
  }, []);

  return {
    isAddModalVisible,
    selectedItem,
    modalType,
    openModal,
    closeModal,
  };
};

const Branch = () => {
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

  // Hooks
  const getAllBranchesApi = useGetAllBranchesApi();
  const components = useStyledTable();
  const { handleToggleStatus } = useActionHandlers();
  const { isAddModalVisible, selectedItem, modalType, openModal, closeModal } =
    useModalState();

  // Memoized data
  const filteredBranches = useMemo(
    () => filterTableData(getAllBranchesApi.data || [], searchTerm, filters),
    [getAllBranchesApi.data, searchTerm, filters]
  );

  const paginationConfig = useMemo(
    () => ({
      ...PAGINATION_CONFIG,
      showTotal: (total) => `Total ${total} branches`,
    }),
    []
  );

  // Column definitions
  const columns = useMemo(
    () => [
      {
        title: "Actions",
        key: "actions",
        width: 120,
        fixed: "left",
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="View Details" trigger="hover" mouseEnterDelay={0.5}>
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => openModal("view", record)}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              />
            </Tooltip>
            <Tooltip title="Edit Branch" trigger="hover" mouseEnterDelay={0.5}>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => openModal("edit", record)}
                className="text-green-500 hover:text-green-700 hover:bg-green-50"
              />
            </Tooltip>
          </Space>
        ),
      },
      {
        title: "Branch Code",
        dataIndex: "branchCode",
        key: "branchCode",
        width: 150,
        sorter: (a, b) =>
          (a.branchCode || "").localeCompare(b.branchCode || ""),
        render: (text) => (
          <span className="font-mono text-sm text-gray-700">{text}</span>
        ),
      },
      {
        title: "Branch Name",
        dataIndex: "branchName",
        key: "branchName",
        width: 200,
        sorter: (a, b) =>
          (a.branchName || "").localeCompare(b.branchName || ""),
        render: (text) => (
          <span className="font-medium text-gray-900">{text}</span>
        ),
        ellipsis: {
          showTitle: false,
        },
        render: (text) => (
          <Tooltip title={text}>
            <span className="font-medium text-gray-900">{text}</span>
          </Tooltip>
        ),
      },
      {
        title: "Location",
        key: "location",
        width: 200,
        render: (_, record) => <LocationRenderer record={record} />,
      },
      {
        title: "Contact",
        key: "contact",
        width: 200,
        render: (_, record) => <ContactRenderer record={record} />,
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
              handleToggleStatus({ branchId: record.branchId, isActive })
            }
          />
        ),
        filters: STATUS_FILTERS,
        onFilter: (value, record) => record.isActive === value,
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 120,
        render: (value) => (
          <span className="text-sm text-gray-600">
            {formatDateTime(value, DATE_FORMATS.DATE)}
          </span>
        ),
        sorter: (a, b) =>
          dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      },
    ],
    [handleToggleStatus, openModal]
  );

  // Event handlers
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleRefresh = useCallback(() => {
    getAllBranchesApi.refetch();
  }, [getAllBranchesApi]);

  const handleExport = useCallback(() => {
    // Export functionality
    console.log("Export functionality to be implemented");
  }, []);

  const handleModalClose = useCallback(() => {
    closeModal();
    form.resetFields();
  }, [closeModal, form]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 space-y-4 p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <Title level={2} className="mb-0">
            Branch Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal("add")}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
          >
            Add Branch
          </Button>
        </div>

        {/* Controls Section */}
        <div className="flex justify-between items-center gap-4">
          <Input.Search
            placeholder="Search by code, name, city, region, contact..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-md"
            loading={getAllBranchesApi.isLoading}
          />
          <Space>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              disabled={!filteredBranches.length}
            >
              Export
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={getAllBranchesApi.isLoading}
            >
              Refresh
            </Button>
          </Space>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 px-6 pb-6">
        <Table
          size="small"
          components={components}
          columns={columns}
          dataSource={filteredBranches}
          rowKey="branchId"
          pagination={paginationConfig}
          loading={getAllBranchesApi.isLoading}
          scroll={{ x: 1200, y: "calc(100vh - 300px)" }}
          showSorterTooltip={{
            title: "Click to sort",
            mouseEnterDelay: 0.5,
          }}
          locale={{
            emptyText: searchTerm
              ? "No matching branches found"
              : "No branches available",
          }}
        />
      </div>

      {/* Modals */}
      <AddBranch open={isAddModalVisible} onClose={handleModalClose} />

      <UpdateBranch
        open={modalType === "edit"}
        selectedItem={selectedItem}
        onClose={handleModalClose}
      />

      <BranchInfoModal
        open={modalType === "view"}
        onClose={handleModalClose}
        branchData={selectedItem}
      />
    </div>
  );
};

export default React.memo(Branch);
