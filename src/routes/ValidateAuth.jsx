import { Navigate, Outlet } from "react-router";

export const Auth = ({ store, redirect }) => {
  const { token, admin, isAuthenticated } = store();

  return isAuthenticated && token ? <Outlet /> : <Navigate to={redirect} />;
};

export const UnAuth = ({ store, redirect = "/" }) => {
  const { token, admin, isAuthenticated } = store();

  return isAuthenticated && token ? <Navigate to={redirect} /> : <Outlet />;
};
