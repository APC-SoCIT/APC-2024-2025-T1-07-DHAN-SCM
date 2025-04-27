import React, { useEffect } from "react";
import { Form, Input, InputNumber, Button, Divider, DatePicker } from "antd";
import dayjs from "dayjs";

const FormClaim = ({ formData, onSubmit }) => {
  const [formClaimInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formClaimInstance.setFieldsValue({
        ...formData,
        calibration_date: formData.calibration_date
          ? dayjs(formData.calibration_date)
          : null,
        calibration_due_date: formData.calibration_due_date
          ? dayjs(formData.calibration_due_date)
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
      calibration_date: dayjs(values.calibration_date).format("YYYY-MM-DD"),
      calibration_due_date: dayjs(values.calibration_due_date).format(
        "YYYY-MM-DD"
      ),
    });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  return (
    <Form
      {...layout}
      form={formClaimInstance}
      validateMessages={{
        required: "This is required.",
      }}
      onFinish={handleFormFinish}
    >
      <Form.Item
        label="Calibrate Date"
        name="calibration_date"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        label="Calibrate Due Date"
        name="calibration_due_date"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        label="Calibrate Interval"
        name="calibration_interval"
        rules={[{ required: true }]}
      >
        <InputNumber />
      </Form.Item>

      <Form.Item
        label="Calibrated By"
        name="calibrated_by"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Calibration Method"
        name="calibration_method"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Calibration Status"
        name="calibration_status"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Result" name="result" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Notes" name="notes">
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

export default FormClaim;
