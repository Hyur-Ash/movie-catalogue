import { createContext } from 'react';

export const Context = createContext();

export const ContextProvider = ({children}) => {
    const message = 'Hello Hyur!';
    return (
        <Context.Provider value={{
            message
        }}>
            {children}
        </Context.Provider>
    )
}