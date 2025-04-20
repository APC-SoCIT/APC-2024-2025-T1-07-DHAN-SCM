import React, { useEffect } from "react";
import { Form, Input, Button, Divider, DatePicker } from "antd";
import dayjs from "dayjs";

const FormGroupedItem = ({ formData, onSubmit }) => {
  const [formGroupedItemInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formGroupedItemInstance.setFieldsValue({
        ...formData,
        expiration_date: formData.expiration_date
          ? dayjs(formData.expiration_date)
          : null,
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

    onSubmit({
      ...values,
      expiration_date: dayjs(values.expiration_date).format("YYYY-MM-DD"),
    });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  return (
    <Form
      {...layout}
      form={formGroupedItemInstance}
      validateMessages={{
        required: "This is required.",
      }}
      onFinish={handleFormFinish}
    >
      <Form.Item
        label="Lot Number"
        name="lot_number"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Expiration Date"
        name="expiration_date"
        rules={[{ required: true }]}
      >
        <DatePicker />
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

export default FormGroupedItem;
