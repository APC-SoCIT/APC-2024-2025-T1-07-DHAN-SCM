import React, { useEffect } from "react";
import { Form, Input, Button, Divider, DatePicker } from "antd";
import dayjs from "dayjs";

const FormMaintenance = ({ formData, onSubmit }) => {
  const [formMaintenanceInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formMaintenanceInstance.setFieldsValue({
        ...formData,
        date_added: formData.date_added ? dayjs(formData.date_added) : null,
        last_updated: formData.last_updated
          ? dayjs(formData.last_updated)
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
      date_added: dayjs(values.date_added).format("YYYY-MM-DD"),
      last_updated: dayjs(values.last_updated).format("YYYY-MM-DD"),
    });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  return (
    <Form
      {...layout}
      form={formMaintenanceInstance}
      validateMessages={{
        required: "This is required.",
      }}
      onFinish={handleFormFinish}
    >
      <Form.Item
        label="Date Added"
        name="date_added"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        label="Last Update"
        name="last_updated"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item label="Notes" name="notes" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Actual Image" name="actual_image">
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

export default FormMaintenance;
