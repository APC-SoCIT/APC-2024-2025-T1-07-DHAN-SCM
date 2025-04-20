import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme, App } from "antd";
import "./assets/styles/app.css";

import AppContent from "./App.jsx";
import useAppStore from "./store/AppStore";

function Main() {
  const { isDarkTheme } = useAppStore();

  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <App>
          <AppContent />
        </App>
      </ConfigProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<Main />);
