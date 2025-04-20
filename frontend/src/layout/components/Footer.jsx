import { Layout, Row, Col, Tag, Switch, Typography } from "antd";
import { SunFilled, MoonFilled } from "@ant-design/icons";

import useAppStore from "../../store/AppStore";

const { Text } = Typography;

function Footer() {
  const { isDarkTheme, toggleDarkTheme } = useAppStore();

  return (
    <Layout.Footer
      style={{
        textAlign: "center",
        padding: "16px 24px",
      }}
    >
      <Row justify="space-between">
        <Col>
          <Text>Created with ❤️ {new Date().getFullYear()} by Team DHAN</Text>
        </Col>
        <Col>
          <Tag>v0.1</Tag>
          <Switch
            checkedChildren={<SunFilled />}
            unCheckedChildren={<MoonFilled />}
            checked={!isDarkTheme}
            onChange={toggleDarkTheme}
          />
        </Col>
      </Row>
    </Layout.Footer>
  );
}

export default Footer;
