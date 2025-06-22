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

// Define os métodos disponíveis no contexto
type UserContextType = {
  userData: UserData; // Dados do usuário
  setUserData: React.Dispatch<React.SetStateAction<UserData>>; // Atualizar todos os dados
  updateUserField: (field: keyof UserData, value: string) => void; // Atualizar um campo
  resetUserData: () => void; // Resetar os dados
};

// Cria o contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define o provedor do contexto
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({});

  // Atualiza um campo individualmente
  const updateUserField = (field: keyof UserData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // Reseta os dados do usuário
  const resetUserData = () => {
    setUserData({});
  };
  useEffect(() => {iniciarBackgroundFetch();}, []);
  return (
    <UserContext.Provider value={{ userData, setUserData, updateUserField, resetUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para acessar o contexto
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
