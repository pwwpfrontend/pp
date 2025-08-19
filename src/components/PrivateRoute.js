import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ roles }) => {
  const { isAuthenticated, isAuthorized, loading } = useAuth(roles);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAuthorized) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

export default PrivateRoute;


