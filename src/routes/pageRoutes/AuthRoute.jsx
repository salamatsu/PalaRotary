import { Route, Routes } from "react-router";
import { UnAuth } from "../ValidateAuth";
import Login from "../../pages/Login";

const AuthRoute = () => {
  return (
    <Routes>
      <Route element={<UnAuth />}>
        <Route path="/*" element={<Login />} />
      </Route>
    </Routes>
  );
};

export default AuthRoute;
