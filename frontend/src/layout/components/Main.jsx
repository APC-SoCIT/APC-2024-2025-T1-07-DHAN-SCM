import { Layout } from "antd";

function Main({ children }) {
  return (
    <Layout
      style={{
        padding: "0 24px 24px",
      }}
    >
      {children}
    </Layout>
  );
}

export default Main;
