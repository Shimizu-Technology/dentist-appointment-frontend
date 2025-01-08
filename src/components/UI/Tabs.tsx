import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface TabsContextValue {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      className={`flex space-x-1 border-b border-gray-200 mb-6 flex-wrap ${className}`}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;       // Unique identifier for which tab this trigger corresponds to
  children: ReactNode;
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('TabsTrigger must be used inside a <Tabs> component');
  }

  const { value: activeValue, setValue } = ctx;
  const isActive = activeValue === value;

  return (
    <button
      onClick={() => setValue(value)}
      className={`
        px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2
        focus:outline-none
        ${
          isActive
            ? 'text-gray-900 border-blue-500'
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;       // The same identifier used by TabsTrigger to match
  children: ReactNode;
}

export function TabsContent({ value, children }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('TabsContent must be used inside a <Tabs> component');
  }

  const { value: activeValue } = ctx;

  if (activeValue !== value) return null;

  return <div className="mt-4">{children}</div>;
}
