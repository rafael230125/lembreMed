import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { iniciarBackgroundFetch } from '../backgroundTask/backgroundTasks';

type UserData = {
  uid?: string;
  email?: string;
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  role?: string;
  profileImage?: string;
};

type UserContextType = {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  updateUserField: (field: keyof UserData, value: string) => void;
  resetUserData: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({});

  const updateUserField = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const resetUserData = () => {
    setUserData({});
  };
  useEffect(() => { iniciarBackgroundFetch(); }, []);
  return (
    <UserContext.Provider value={{ userData, setUserData, updateUserField, resetUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
