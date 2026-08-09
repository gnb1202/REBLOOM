import React, { createContext, useContext, useState } from 'react';

type CoinContextType = {
  coins: number;
  addCoins: (amount: number) => void;
};

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export const CoinProvider = ({ children }: { children: React.ReactNode }) => {
  const [coins, setCoins] = useState(0);

  const addCoins = (amount: number) => {
    setCoins((prev) => prev + amount);
  };

  return (
    <CoinContext.Provider value={{ coins, addCoins }}>
      {children}
    </CoinContext.Provider>
  );
};

export const useCoin = () => {
  const context = useContext(CoinContext);
  if (!context) throw new Error('useCoin must be used within a CoinProvider');
  return context;
};
