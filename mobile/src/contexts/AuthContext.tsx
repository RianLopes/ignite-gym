import { createContext, ReactNode, useEffect, useState } from 'react';
import { UserDTO } from '@dtos/UserDTO';
import { api } from '@services/api';
import { storageAuthTokenSave, storageAuthTokenGet, storageAuthTokenRemove } from '@storage/storageAuthToken';
import { storageUserSave, storageUserGet, storageUserRemove } from '@storage/storageUser';


export type AuthContextDataProps = {
    user: UserDTO
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    isLoadingUserStorageData: boolean;
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {

    const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true)
    const [user, setUser] = useState<UserDTO>({} as UserDTO);

    async function userAndTokenUpdate(userData: UserDTO, token: string) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
    }

    async function userAndTokenSaveStorage(userData: UserDTO, token: string) {
        try {
            setIsLoadingUserStorageData(true);
            await storageUserSave(userData)
            await storageAuthTokenSave(token)
        } catch (error) {
            throw error;
        }finally {
            setIsLoadingUserStorageData(false);
        }

    }

    async function signIn(email: string, password: string) {
        try {
            const { data } = await api.post('/sessions', { email, password })

            if (data.user && data.token) {
                await userAndTokenSaveStorage(data.user, data.token);
                setIsLoadingUserStorageData(true);
                userAndTokenUpdate(data.user, data.token);
            }
        } catch (error) {
            throw error;
        }finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function signOut() {
        try {
            setIsLoadingUserStorageData(true);
            setUser({} as UserDTO);
            await storageUserRemove();
            await storageAuthTokenRemove();
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    async function loadingUserData() {
        try {
            const userLogged = await storageUserGet();
            const token = await storageAuthTokenGet()

            if (token && userLogged) {
                userAndTokenUpdate(userLogged, token);
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoadingUserStorageData(false);
        }
    }

    useEffect(() => {
        loadingUserData();
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            signIn,
            signOut,
            isLoadingUserStorageData,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
