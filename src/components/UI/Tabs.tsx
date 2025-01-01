interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, children }: TabsProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}

export function TabsList({ children }: TabsListProps) {
  return (
    <div className="flex space-x-1 border-b border-gray-200 mb-6">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  return (
    <button
      className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 border-b-2 border-transparent hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-blue-500"
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: TabsContentProps) {
  return (
    <div className="mt-4">
      {children}
    </div>
  );
}