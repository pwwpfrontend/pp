import { useEffect, useState } from "react";
import { getToken, getRole } from "../services/auth";

export default function useAuth(requiredRoles) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const currentRole = getRole();
    const authed = Boolean(token);
    setIsAuthenticated(authed);
    setRole(currentRole || null);

    if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
      setIsAuthorized(authed && requiredRoles.includes(currentRole));
    } else {
      setIsAuthorized(authed);
    }
    setLoading(false);
  }, [requiredRoles]);

  return { isAuthenticated, isAuthorized, role, loading };
}


