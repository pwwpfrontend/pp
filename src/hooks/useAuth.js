import { useEffect, useState } from "react";
import { getToken, getRole } from "../services/auth";

export default function useAuth(requiredRoles = []) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    const authed = Boolean(token);
    
    console.log('useAuth effect:', { token: !!token, currentRole: role, authed, requiredRoles });
    
    setIsAuthenticated(authed);
    setCurrentRole(role || null);

    if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
      const authorized = authed && requiredRoles.includes(role);
      console.log('useAuth authorization:', { authed, currentRole: role, requiredRoles, authorized });
      setIsAuthorized(authorized);
    } else {
      setIsAuthorized(authed);
    }
    setLoading(false);
  }, [requiredRoles]);

  return { isAuthenticated, isAuthorized, currentRole, loading };
}


