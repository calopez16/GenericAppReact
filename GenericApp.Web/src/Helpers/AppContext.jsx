import { createContext, useState, useEffect } from "react";
export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
    const [userName, setUserName] = useState("Carlos");
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
    const [userRole, setUserRole] = useState(() => localStorage.getItem("userRole"));

    useEffect(() => {
        if (userName) localStorage.setItem("userName", userName);
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (userRole) localStorage.setItem("userRole", userRole);
    }, [userName, accessToken, userRole]);

    const contextValue = {
        userName,
        setUserName,
        accessToken,
        setAccessToken,
        userRole,
        setUserRole,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};