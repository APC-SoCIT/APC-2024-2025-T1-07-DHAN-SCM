import { Outlet, Navigate } from "react-router-dom";

import useUserStore from "../store/UserStore";

const PublicRoutes = () => {
  const { id: userId } = useUserStore((state) => state);
  console.log("userId", userId);

  return !userId ? <Outlet /> : <Navigate replace to="/products" />;
};

export default PublicRoutes;
