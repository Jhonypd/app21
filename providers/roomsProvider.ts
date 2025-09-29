'use client';

import { createContext, useContext } from 'react';

interface Room {
  id: string;
  code: string;
  title: string;
  private: boolean;
  created_by: string;
}

interface RoomsContextProps {
  room: Room;
  loadingRoom: boolean;
}

const RoomsContext = createContext<RoomsContextProps | undefined>(
  undefined,
);

export const RoomsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {return(<RoomsContext.Provider>{children}</RoomsContext.Provider>)};

export const useRooms = () => {
  const context = useContext(RoomsContext);

  if (!context) {
    throw new Error(
      'useNotifications deve ser usado dentro de um NotificationProvider',
    );
  }

  return context;
};
