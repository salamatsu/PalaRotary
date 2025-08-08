import { Navigate, Outlet } from "react-router";

export const Auth = ({ store, redirect }) => {
  const { userData, token } = store();
  return userData && token ? <Outlet /> : <Navigate to={redirect} />;
};

export const UnAuth = ({ store, redirect = "/" }) => {
  const { userData, token } = store();

  return userData && token ? <Navigate to={redirect} /> : <Outlet />;
};
