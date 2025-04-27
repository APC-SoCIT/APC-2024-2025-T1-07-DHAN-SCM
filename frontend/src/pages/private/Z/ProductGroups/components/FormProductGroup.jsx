import React, { useEffect } from "react";
import { Form, Input, Button, Divider } from "antd";

const FormProductGroup = ({ formData, onSubmit }) => {
  const [formProductGroupInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formProductGroupInstance.setFieldsValue(formData);
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
      form={formProductGroupInstance}
      validateMessages={{
        required: "This is required.",
      }}
      onFinish={handleFormFinish}
    >
      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input />
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

export default FormProductGroup;
