import { App, Button, Form, Input, Spin } from "antd";
import { NavLink } from "react-router";
import { useLoginAuth } from "../services/requests/useAuth";

const Login = () => {
  const [form] = Form.useForm();
  const { modal, message } = App.useApp();
  const { mutate, isPending } = useLoginAuth();

  const onFinish = (values) => {
    const loadingModal = modal.success({
      icon: <></>,
      iconType: "loading",
      content: (
        <div className=" flex flex-col gap-2 text-center justify-center items-center">
          <Spin />
          <span>Loading...</span>
        </div>
      ),
      title: null,
      closable: false,
      footer: null,
      centered: true,
    });

    mutate(values, {
      onSuccess: () => {
        form.resetFields();
      },
      onError: (error) => {
        console.log({ error });
        console.log(error.response?.data);

        message.error(error.response?.data?.message);
      },
      onSettled: () => {
        loadingModal.destroy();
      },
    });
  };

  form.setFieldsValue({
    username: "admin",
    password: "admin",
  });

  return (
    <>
      <section className="min-h-screen mx-3 flex flex-col gap-4 justify-center items-center relative">
        <h1 className="text-primary-color font-bold text-2xl py-4">
          LOREM IPSUM DOR ET AMET
        </h1>
        <div className="border border-gray-300 lg:w-2/5 md:w-2/3 w-full py-4 px-6 rounded-xl">
          <h1 className="text-primary-color font-semibold text-xl my-3">
            Login to your account
          </h1>
          <Form
            form={form}
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
            disabled={isPending}
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
                // { type: "email", message: "Invalid Email Format" },
              ]}
              label={
                <label className="text-text-color font-medium text-base">
                  Username
                </label>
              }
            >
              <Input size="large" placeholder="Enter Email Address" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
              label={
                <label className="text-text-color font-medium text-base">
                  Password
                </label>
              }
            >
              <Input.Password size="large" placeholder="Enter Password" />
            </Form.Item>
            <div className="flex justify-end mb-4">
              <NavLink>
                <span className="text-text-color text-sm hover:underline">
                  Forgot your password
                </span>
              </NavLink>
            </div>

            <Form.Item>
              <Button
                block
                size="large"
                type="primary"
                htmlType="submit"
                loading={isPending}
              >
                LOGIN
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>
    </>
  );
};

export default Login;
