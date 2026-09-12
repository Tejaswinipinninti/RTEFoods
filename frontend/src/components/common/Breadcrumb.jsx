import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs sm:text-sm overflow-x-auto">
      <Link
        to="/"
        className="flex items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : item.link ? (
              <Link
                to={item.link}
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-400">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
