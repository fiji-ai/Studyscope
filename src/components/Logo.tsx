import React from 'react';
import { GraduationCap } from 'lucide-react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`${className} bg-brand-600 p-2.5 rounded-xl shadow-lg shadow-brand-200 flex items-center justify-center`}>
      <GraduationCap className="w-full h-full text-white" />
    </div>
  );
};

export default Logo;
