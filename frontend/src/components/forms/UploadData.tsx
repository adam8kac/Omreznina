import { useState } from 'react';
import UploadInvoice from './UploadInvoice';
import UploadReceipt from './UploadReciept';
import Upload15min from './Upload15min';

export default function UploadData() {
  const [selected, setSelected] = useState<'invoice' | 'receipt' | 'minutni'>('invoice');

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Nalaganje podatkov</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Naloži podatke o računih, dnevnih stanjih in 15-minutnih intervalih za boljši pregled in prikaz porabe.
          Izberi ustrezno možnost glede na to, kaj želiš prikazati – mesečno porabo, podrobnosti računa ali analizo porabe glede na optimalne vrednosti.
        </p>
      </div>

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
            Naloži dnevna stanja
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
          <button
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-150 ${
              selected === 'minutni'
                ? 'bg-primary text-white shadow'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelected('minutni')}
            type="button"
          >
            Naloži 15-minutni izpisek
          </button>
        </div>
      </div>
      {selected === 'invoice' && <UploadInvoice />}
      {selected === 'receipt' && <UploadReceipt />}
      {selected === 'minutni' && <Upload15min />}
    </div>
  );
};