import { useNavigate } from "react-router-dom";
import { Layout, Typography, Space, Button, theme } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

function PageTitleProvider({ route, children }) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();

  const { title, subTitle, isWithBackButton } = route;

  return (
    <>
      <Space>
        {isWithBackButton && (
          <Button
            type="link"
            style={{ paddingLeft: 0 }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftOutlined />
          </Button>
        )}
        <Title level={4} style={{ margin: 0, padding: "16px 0 24px" }}>
          {title}
        </Title>
        <Text type="secondary">{subTitle}</Text>
      </Space>
      <Layout.Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        {children}
      </Layout.Content>
    </>
  );
}

export default PageTitleProvider;
