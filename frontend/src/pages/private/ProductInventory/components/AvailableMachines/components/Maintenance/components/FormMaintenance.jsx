import React, { useEffect } from "react";
import { Form, Input, Button, Divider, DatePicker } from "antd";
import dayjs from "dayjs";

const FormMaintenance = ({ formData, onSubmit }) => {
  const [formMaintenanceInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formMaintenanceInstance.setFieldsValue({
        ...formData,
        maintenance_date: formData.maintenance_date
          ? dayjs(formData.maintenance_date)
          : null,
        next_maintenance_date: formData.next_maintenance_date
          ? dayjs(formData.next_maintenance_date)
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
      maintenance_date: dayjs(values.maintenance_date).format("YYYY-MM-DD"),
      next_maintenance_date: dayjs(values.next_maintenance_date).format(
        "YYYY-MM-DD"
      ),
    });
  };

  const layout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
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
        label="Maintenance Date"
        name="maintenance_date"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        label="Performed By"
        name="performed_by"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Next Maintenance Date"
        name="next_maintenance_date"
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

export default FormMaintenance;
