import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import http from "../../../services/httpService";
import useAppStore from "../../../store/UserStore";
import "./style.css";
import logo from "../../../assets/images/megaion.png";

const { Title } = Typography;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setIsLoading(true);

      const res = await http.post("/api/login", values);
      localStorage.setItem("token", res.data.token);
      window.location.reload();
    } catch (error) {
      alert(error.message || "Login failed");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Title level={2} className="login-title">
        Login
      </Title>
      <Form
        name="basic"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* <div style={{ textAlign: "center" }}>
          <img
            src={logo}
            alt="Megaion Logo"
            className="login-logo"
            style={{ width: 200, marginBottom: 24 }}
          />
        </div> */}
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            loading={isLoading}
            size="large"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
