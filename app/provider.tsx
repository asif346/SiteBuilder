"use client";

import React, { useEffect, useState, createContext } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { OnSaveContext } from "@/context/OnSaveContext";

export const UserDetailContext = createContext<{
  userDetail: any;
  setUserDetail: (value: any) => void;
}>({ userDetail: null, setUserDetail: () => {} });

export default function Provider({ children }: { children: React.ReactNode }) {
  const [userDetail, setUserDetail] = useState<any>(null);
  const { user } = useUser();

  const [onSaveData, setOnSaveData] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      CreateNewUser();
    }
  }, [user?.id]);

  const CreateNewUser = async () => {
    try {
      const result = await axios.post("/api/users");

      // ✅ Store user data in context
      setUserDetail(result?.data?.user);

      console.log("User Created / Fetched:", result.data);
    } catch (error) {
      console.error("User creation failed:", error);
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <OnSaveContext.Provider value={{onSaveData,setOnSaveData}}>{children}</OnSaveContext.Provider>
    </UserDetailContext.Provider>
  );
}
