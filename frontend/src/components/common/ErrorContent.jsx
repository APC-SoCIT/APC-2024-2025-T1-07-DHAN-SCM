import React from "react";
import { Result } from "antd";
const ErrorContent = ({ errorMessage }) => (
  <Result
    status="warning"
    title={"There are some problems with your operation."}
    subTitle={errorMessage}
  />
);
export default ErrorContent;
