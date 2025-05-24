import { useState } from 'react';
import UploadInvoice from './UploadInvoice';
import UploadReceipt from './UploadReciept';

export default function UploadData() {

  const [selected, setSelected] = useState<'invoice' | 'receipt'>('invoice');

  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-full p-1 shadow-sm w-fit">
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-150 ${
              selected === 'invoice'
                ? 'bg-primary text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelected('invoice')}
            type="button"
          >
            Naloži izpisek
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-150 ${
              selected === 'receipt'
                ? 'bg-primary text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelected('receipt')}
            type="button"
          >
            Naloži račun
          </button>
        </div>
      </div>
        {selected === 'invoice' && <UploadInvoice />}
        {selected === 'receipt' && <UploadReceipt />}
    </div>
  );
};

