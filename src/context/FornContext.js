import React, { createContext, useState } from 'react';

export const FornContext = createContext();

export const FornProvider = ({ children }) => {
    const [selectedForn, setSelectedForn] = useState(null);

    return (
        <FornContext.Provider value={{ selectedForn, setSelectedForn }}>
            {children}
        </FornContext.Provider>
    );
};