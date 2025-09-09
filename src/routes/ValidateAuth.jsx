import { Navigate, Outlet } from "react-router";
import { useEffect } from "react";

import { useCurrentActiveUserToken } from "../store/hotelStore";
export const Auth = ({ store, redirect }) => {
  // return <Outlet />;

  const { userData, token } = store();
  const { setToken, setUser } = useCurrentActiveUserToken();

  useEffect(() => {
    if (token) {
      setToken(token);
    }

    if (userData) {
      setUser(userData?.role);
    }
  }, [token, userData]);

  return userData && token ? <Outlet /> : <Navigate to={redirect} />;
};

export const UnAuth = ({ store, redirect = "/" }) => {
  // return <Outlet />;

  const { userData, token } = store();

  return userData && token ? <Navigate to={redirect} /> : <Outlet />;
};
