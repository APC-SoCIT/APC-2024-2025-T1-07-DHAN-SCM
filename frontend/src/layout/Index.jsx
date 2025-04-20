import { Outlet } from "react-router-dom";
import { Layout } from "antd";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Footer from "./components/Footer";

function MainLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout>
        <Header />
        <Main>
          <Outlet />
        </Main>
        <Footer />
      </Layout>
    </Layout>
  );
}

export default MainLayout;
