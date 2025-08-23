import React, { useEffect, useState } from "react";
import auth from "../utils/auth";

export default function AuthStatus() {
  const [user, setUser] = useState(auth.getUser());
  useEffect(() => {
    const handler = () => setUser(auth.getUser());
    window.addEventListener("authChanged", handler);
    return () => window.removeEventListener("authChanged", handler);
  }, []);

  if (!auth.isAuthenticated()) {
    return <span className="text-gray-500">No has iniciado sesión</span>;
  }
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-green-700 font-semibold text-sm md:text-base">Bienvenido,</span>
      <span className="text-gray-700 text-xs md:text-sm font-medium max-w-[140px] truncate">{user?.name || user?.email}</span>
    </div>
  );
}
