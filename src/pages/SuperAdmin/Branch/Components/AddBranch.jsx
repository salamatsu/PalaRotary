import { CloseOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Form, Modal } from "antd";
import React from "react";
import BranchForm from "../../../../components/forms/BranchForm";
import { useAddBranchApi } from "../../../../services/requests/useBranches";

const AddBranch = ({ open, onClose }) => {
  const { message, modal } = App.useApp();
  const queryClient = useQueryClient();
  const addBranchApi = useAddBranchApi();

  const [form] = Form.useForm();

  const handleClose = () => {
    onClose(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    modal.confirm({
      title: "Confirm Add Branch",
      content: "Are you sure you want to add this branch?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        addBranchApi.mutate(values, {
          onSuccess: () => {
            message.success("Branch added successfully");
            handleClose();

            queryClient.invalidateQueries(["getAllBranchesApi"]);
          },
          onError: (error) => {
            message.error(
              error.response?.data?.message || "Failed to add branch"
            );
          },
        });
      },
    });
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      centered
      closeIcon={
        <CloseOutlined className="text-gray-400 hover:text-gray-600 text-lg p-2" />
      }
      styles={{
        mask: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        },
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
        <h1 className="text-lg font-medium text-black m-0">Add New Branch</h1>
      </div>

      {/* Form */}
      <div className="py-2 px-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <BranchForm form={form} />
        </Form>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
        <Button
          onClick={() => form.resetFields()}
          className="h-9 px-6 text-sm font-medium text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-700 focus:border-gray-400 focus:text-gray-700"
          disabled={addBranchApi.isPending}
        >
          Clear
        </Button>
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={addBranchApi.isPending}
          className="h-9 px-6 text-sm font-medium bg-black border-black hover:bg-gray-800 hover:border-gray-800 focus:bg-gray-800 focus:border-gray-800"
        >
          {addBranchApi.isPending ? `Creating...` : `Create Branch`}
        </Button>
      </div>
    </Modal>
  );
};

export default AddBranch;
