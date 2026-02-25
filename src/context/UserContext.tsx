"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import axios from "axios";

const BACKEND_BASE_URL = "http://localhost:9999";

type UserContextType = {
  isLogin: boolean | null;
  checkLogin: () => void;
  setIsLogin: (v: boolean) => void;
};

const UserContext = createContext<UserContextType>({
  isLogin: null,
  checkLogin: () => {},
  setIsLogin: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLogin, setIsLogin] = useState<boolean | null>(null);

  const checkLogin = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setIsLogin(!!res.data);
    } catch (err: any) {
      setIsLogin(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <UserContext.Provider value={{ isLogin, setIsLogin, checkLogin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
