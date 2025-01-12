// File: /src/components/UI/Tabs.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

interface TabsContextValue {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
}

/**
 * <Tabs> – The parent that manages which tab is active.
 */
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

/**
 * <TabsList> – The container for all <TabsTrigger> elements.
 * Wraps them with flex, gap, and possible border styling.
 */
export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      className={`
        flex flex-wrap gap-2
        border-b border-gray-200
        mb-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;       // Unique identifier for which tab this trigger corresponds to
  children: ReactNode;
}

/**
 * <TabsTrigger> – A clickable button that activates a particular tab pane.
 */
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
      aria-selected={isActive}
      className={`
        px-3 py-2 text-sm font-medium
        rounded-md
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors
        ${
          isActive
            ? // Active (selected) tab styles
              'bg-blue-100 text-blue-700'
            : // Inactive (unselected) tab styles
              'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
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

/**
 * <TabsContent> – Renders its children only if the active tab value matches `value`.
 */
export function TabsContent({ value, children }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('TabsContent must be used inside a <Tabs> component');
  }

  const { value: activeValue } = ctx;
  if (activeValue !== value) return null;

  return <div className="mt-4">{children}</div>;
}
