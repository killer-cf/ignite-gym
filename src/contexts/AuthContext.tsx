import { createContext, ReactNode } from "react";
import { UserDTO } from "@dtos/UserDTO"

export const AutContext = createContext({})

type AuthContextProviderProps = {
  children: ReactNode
}

export type AuthContextDataProps = {
  user: UserDTO;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps)  {
  return (
    <AuthContext.Provider value={{
      user: {
        id: '1',
        name: 'Rodrigo Gonçalves',
        email: 'rodrigo@email.com',
        avatar: 'rodrigo.png'
      }
    }}>
      {children}
    </AuthContext.Provider>
  )
}