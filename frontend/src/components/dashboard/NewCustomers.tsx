import { Icon } from "@iconify/react";
import { Link } from "react-router";

const NewCustomers = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
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