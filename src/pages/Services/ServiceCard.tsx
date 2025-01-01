import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  Icon: LucideIcon;
}

export default function ServiceCard({ title, description, features, Icon }: ServiceCardProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-blue-600 mb-4">
        <Icon className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-600">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}