import React, { useEffect } from "react";
import { Form, Input, Button, Divider, DatePicker } from "antd";
import dayjs from "dayjs";

const FormClaim = ({ formData, onSubmit }) => {
  const [formClaimInstance] = Form.useForm();

  useEffect(() => {
    if (formData) {
      formClaimInstance.setFieldsValue({
        ...formData,
        claim_date: formData.claim_date ? dayjs(formData.claim_date) : null,
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
      claim_date: dayjs(values.claim_date).format("YYYY-MM-DD"),
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
        label="Process By"
        name="process_by"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Claim Date"
        name="claim_date"
        rules={[{ required: true }]}
      >
        <DatePicker />
      </Form.Item>
      <Form.Item label="Other Details" name="other_details">
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
