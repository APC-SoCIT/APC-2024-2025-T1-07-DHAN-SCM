import React, { useEffect } from "react";
import { Form, InputNumber, Select, Button, Divider } from "antd";

const FormStockLedgerItem = ({ formData, onSubmit }) => {
  const [formStockLedgerItemInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formStockLedgerItemInstance.setFieldsValue(formData);
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
      form={formStockLedgerItemInstance}
      validateMessages={{
        required: "This is required.",
      }}
      onFinish={handleFormFinish}
    >
      <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item
        label="Movement Type"
        name="movement_type"
        rules={[{ required: true }]}
      >
        <Select
          options={[
            { label: "Increment", value: "Increment" },
            { label: "Decrement", value: "Decrement" },
          ]}
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

export default FormStockLedgerItem;
