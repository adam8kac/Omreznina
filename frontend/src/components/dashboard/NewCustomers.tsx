import { Icon } from "@iconify/react";
import { Link } from "react-router";

const NewCustomers = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 relative">
      <button 
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" 
        onClick={onClose}
        aria-label="Zapri"
      >
        <Icon icon="mdi:close" height={22} />
      </button>
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-red-100 text-red-500 p-3 rounded-md">
          <Icon icon="mdi:heart-outline" height={24} />
        </div>
        <p className="text-lg text-dark font-semibold">Novi na Omrežnina+?</p>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Preberite si več o naši platformi in odkrijte, kako vam lahko pomaga
        pri nadzoru nad porabo elektrike.
      </p>
      <Link
        to="/about-us"
        className="inline-block text-sm text-blue-600 hover:underline font-medium"
      >
        Več o nas →
      </Link>
    </div>
  );
};

export default NewCustomers;