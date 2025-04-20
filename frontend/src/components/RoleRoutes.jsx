import { Outlet, Navigate } from "react-router-dom";

import useUserStore from "../store/UserStore";

const RoleRoutes = (props) => {
  const { type: userType } = useUserStore((state) => state);

  return props.userType === userType ? (
    <Outlet />
  ) : (
    <Navigate replace to="/405" />
  );
};

export default RoleRoutes;
