import React, { useEffect } from "react";
import { Form, Input, Button, Select, Divider, Alert } from "antd";

const FormCompany = ({ formData, supportingDetails, onSubmit }) => {
  const [formCompanyInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formCompanyInstance.setFieldsValue({
        ...formData,
        //users: formData.company_members.map((item) => item.user_id),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleFormFinish = (values) => {
    // Convert `undefined` to `null`
    for (let key in values) {
      if (values[key] === undefined) {
        values[key] = null;
      }
    }

    onSubmit(values);
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const { users } = supportingDetails;

  return (
    <Form
      {...layout}
      form={formCompanyInstance}
      validateMessages={{
        required: "This is required.",
      }}
      onFinish={handleFormFinish}
    >
      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="Contact Info"
        name="contact_info"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Website URL"
        name="website_url"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Industry" name="industry" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Address" name="address" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="City" name="city" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Country" name="country" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Zip Code" name="zip_code" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="Phone Number"
        name="phone_number"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
            message: "Invalid email format.",
          },
          { required: true },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Primary Contact Name"
        name="primary_contact_name"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Primary Contact Phone"
        name="primary_contact_phone"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Primary Contact Email"
        name="primary_contact_email"
        rules={[
          {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
            message: "Invalid email format.",
          },
          { required: true },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Additional Info"
        name="additional_info"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      {/* <Form.Item
        label="Shipping Address"
        name="shipping_address"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Physical Address"
        name="physical_address"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Business Type" name="business_type">
        <Select
          options={[
            {
              value: "Sole",
              label: "Sole",
            },
            {
              value: "Partnership",
              label: "Partnership",
            },
            {
              value: "Corporation",
              label: "Corporation",
            },
          ]}
        />
      </Form.Item>
      <Form.Item label="Industry" name="industry">
        <Input />
      </Form.Item>
      <Form.Item
        label="Primary Contact Name"
        name="primary_contact_name"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Primary Contact Title" name="primary_contact_title">
        <Input />
      </Form.Item>
      <Form.Item
        label="Primary Contact Number"
        name="primary_contact_number"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Secondary Contact Name" name="secondary_contact_name">
        <Input />
      </Form.Item>
      <Form.Item label="Secondary Contact Title" name="secondary_contact_title">
        <Input />
      </Form.Item>
      <Form.Item
        label="Secondary Contact Number"
        name="secondary_contact_number"
      >
        <Input />
      </Form.Item>
      <Form.Item label="Payment Term" name="payment_term">
        <Input />
      </Form.Item>
      <Form.Item label="Payment Method" name="payment_method">
        <Input />
      </Form.Item>
      <Form.Item label="Credit Limit" name="credit_limit">
        <Input type="number" />
      </Form.Item>
      <Form.Item label="Category" name="category">
        <Select
          options={[
            {
              value: "High-Value",
              label: "High-Value",
            },
            {
              value: "Low-Value",
              label: "Low-Value",
            },
            {
              value: "Strategic Partner",
              label: "Strategic Partner",
            },
          ]}
        />
      </Form.Item>
      <Form.Item label="Users" name="users" rules={[{ required: true }]}>
        <Select
          mode="multiple"
          allowClear
          options={users.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        wrapperCol={{
          offset: layout.labelCol.span,
          span: layout.wrapperCol.span,
        }}
      >
        <Alert
          description="Each user can belong to only one company. The system will automatically check this."
          showIcon
        />
      </Form.Item> */}
      <Divider />
      <Form.Item noStyle>
        <div style={{ textAlign: "right" }}>
          <Button type="primary" htmlType="submit">
            OK
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default FormCompany;
