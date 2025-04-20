import React, { useEffect } from "react";
import { Form, Input, Button, Select, Divider } from "antd";

const FormUser = ({ formData, supportingData, onSubmit }) => {
  const [formUserInstance] = Form.useForm();

  const { roles } = supportingData;

  useEffect(() => {
    if (formData) {
      formUserInstance.setFieldsValue({
        ...formData,
        roles: formData.roles.map((role) => role.id),
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

  return (
    <Form
      {...layout}
      form={formUserInstance}
      validateMessages={{
        required: "This is required.",
      }}
      onFinish={handleFormFinish}
    >
      <Form.Item label="Name" name="full_name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Username" name="username" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ required: true }]}>
        <Input readOnly={formData} />
      </Form.Item>
      {!formData && (
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true }]}
        >
          <Input.Password placeholder="input password" />
        </Form.Item>
      )}

      <Form.Item label="Roles" name="roles" rules={[{ required: true }]}>
        <Select
          mode="multiple"
          allowClear
          options={roles.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
        />
      </Form.Item>
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

export default FormUser;
