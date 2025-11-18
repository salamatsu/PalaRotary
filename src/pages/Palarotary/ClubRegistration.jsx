import { useState } from 'react';
import { Card, Form, Input, Select, Button, Steps, Upload, message, Alert, Divider } from 'antd';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useRegisterClub, useUploadPaymentProof, usePaymentInfo } from '../../services/requests/usePalarotary';

const { Step } = Steps;
const { TextArea } = Input;

export default function ClubRegistration() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [clubId, setClubId] = useState(null);
  const [clubData, setClubData] = useState(null);

  const registerClub = useRegisterClub();
  const uploadPayment = useUploadPaymentProof();
  const { data: paymentInfo } = usePaymentInfo();

  const onFinishStep1 = async (values) => {
    try {
      const response = await registerClub.mutateAsync(values);
      setClubId(response.data.club_id);
      setClubData(values);
      message.success('Club registered successfully! Please proceed to payment.');
      setCurrentStep(1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to register club');
    }
  };

  const handlePaymentUpload = async (info) => {
    if (info.file.status === 'done' || info.file) {
      try {
        await uploadPayment.mutateAsync({
          clubId,
          file: info.file.originFileObj || info.file
        });
        message.success('Payment proof uploaded successfully!');
        setCurrentStep(2);
      } catch (error) {
        message.error(error.response?.data?.message || 'Failed to upload payment proof');
      }
    }
  };

  const paymentMethods = paymentInfo?.data || [];

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: '#fe0808', fontSize: '32px', marginBottom: '8px' }}>PALAROTARY 2025</h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            January 25, 2026 | Marikina Sports Center | 8am-6pm
          </p>
        </div>

        <Steps current={currentStep} style={{ marginBottom: '32px' }}>
          <Step title="Club Information" />
          <Step title="Payment" />
          <Step title="Confirmation" />
        </Steps>

        {currentStep === 0 && (
          <>
            <Alert
              message="Club Registration Fee: ₱4,000.00"
              description="Note: Free Lechon for zones with complete payments!"
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinishStep1}
              initialValues={{ payment_method: 'BDO' }}
            >
              <Form.Item
                label="Club Name"
                name="club_name"
                rules={[{ required: true, message: 'Please enter club name' }]}
              >
                <Input placeholder="Enter your club name" size="large" />
              </Form.Item>

              <Form.Item
                label="Contact Person"
                name="contact_person"
                rules={[{ required: true, message: 'Please enter contact person name' }]}
              >
                <Input placeholder="Full name of contact person" size="large" />
              </Form.Item>

              <Form.Item
                label="Contact Number"
                name="contact_number"
                rules={[
                  { required: true, message: 'Please enter contact number' },
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Invalid phone number' }
                ]}
              >
                <Input placeholder="e.g., 0917 123 4567" size="large" />
              </Form.Item>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Invalid email address' }
                ]}
              >
                <Input placeholder="your.email@example.com" size="large" />
              </Form.Item>

              <Form.Item
                label="Zone (Optional)"
                name="zone"
              >
                <Input placeholder="Enter your zone" size="large" />
              </Form.Item>

              <Form.Item
                label="Payment Method"
                name="payment_method"
                rules={[{ required: true, message: 'Please select payment method' }]}
              >
                <Select size="large">
                  <Select.Option value="BDO">BDO Bank Transfer</Select.Option>
                  <Select.Option value="G-cash">GCash</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={registerClub.isPending}
                  style={{ background: '#fe0808', borderColor: '#fe0808' }}
                >
                  Register Club
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        {currentStep === 1 && (
          <>
            <Alert
              message="Club Registered Successfully!"
              description="Please make your payment and upload proof below."
              type="success"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Card title="Payment Instructions" style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <strong>Registration Fee: ₱4,000.00</strong>
              </div>

              {paymentMethods.map((method, index) => (
                <div key={index} style={{ background: '#f5f5f5', padding: '16px', marginBottom: '12px', borderRadius: '8px' }}>
                  <h4 style={{ margin: 0, marginBottom: '8px' }}>
                    {method.payment_method === 'BDO' ? '🏦 BDO Bank Transfer' : '📱 GCash Payment'}
                  </h4>
                  <p style={{ margin: 0 }}>
                    <strong>Account Name:</strong> {method.account_name}
                  </p>
                  {method.account_number && (
                    <p style={{ margin: 0 }}>
                      <strong>Account Number:</strong> {method.account_number}
                    </p>
                  )}
                  {method.mobile_number && (
                    <p style={{ margin: 0 }}>
                      <strong>Mobile Number:</strong> {method.mobile_number}
                    </p>
                  )}
                </div>
              ))}

              <Alert
                message="Important"
                description="Please upload your proof of payment within 4 hours to secure your registration."
                type="warning"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </Card>

            <Upload
              accept="image/*,.pdf"
              beforeUpload={() => false}
              onChange={handlePaymentUpload}
              maxCount={1}
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                block
                loading={uploadPayment.isPending}
                style={{ marginBottom: '16px' }}
              >
                Upload Proof of Payment
              </Button>
            </Upload>

            <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
              Accepted formats: JPG, PNG, PDF (Max 5MB)
            </p>
          </>
        )}

        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <CheckCircleOutlined style={{ fontSize: '72px', color: '#52c41a', marginBottom: '24px' }} />
            <h2 style={{ color: '#52c41a', marginBottom: '16px' }}>Registration Complete!</h2>
            <p style={{ fontSize: '16px', marginBottom: '24px' }}>
              Thank you for registering <strong>{clubData?.club_name}</strong>!
            </p>

            <Alert
              message="What's Next?"
              description={
                <div style={{ textAlign: 'left' }}>
                  <p>• Check your email for confirmation and payment instructions</p>
                  <p>• Your registration will be reviewed by our admin team</p>
                  <p>• Once approved, you can register your club members</p>
                  <p>• You'll receive an email notification when approved</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Divider />

            <div style={{ background: '#fff3cd', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0 }}>Event Details</h3>
              <p style={{ margin: '8px 0' }}><strong>Date:</strong> January 25, 2026</p>
              <p style={{ margin: '8px 0' }}><strong>Time:</strong> 8am-6pm</p>
              <p style={{ margin: '8px 0' }}><strong>Location:</strong> Marikina Sports Center</p>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={() => window.location.reload()}
              style={{ marginTop: '24px', background: '#fe0808', borderColor: '#fe0808' }}
            >
              Register Another Club
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
