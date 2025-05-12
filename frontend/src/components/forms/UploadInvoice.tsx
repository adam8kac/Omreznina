import React, { useState } from 'react';
import { Label, TextInput, Button, FileInput } from 'flowbite-react';

const UploadInvoice: React.FC = () => {
  const [invoiceName, setInvoiceName] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !invoiceName || !invoiceDate) {
      alert('Izpolni vsa polja in izberi datoteko.');
      return;
    }

    console.log('Ime računa:', invoiceName);
    console.log('Datum računa:', invoiceDate);
    console.log('Datoteka:', file);

    alert('Račun uspešno naložen!');
    setInvoiceName('');
    setInvoiceDate('');
    setFile(null);
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title text-xl font-semibold mb-4">Ročno nalaganje računa</h5>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 gap-6">
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="invoiceName" value="Naziv računa" className="mb-1 block" />
              <TextInput
                id="invoiceName"
                type="text"
                placeholder="Npr. Elektrika marec 2025"
                value={invoiceName}
                onChange={(e) => setInvoiceName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate" value="Datum" className="mb-1 block" />
              <TextInput
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="fileInput" value="Izberi datoteko" className="mb-1 block" />
              <FileInput
                id="fileInput"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
              />
              {file && (
                <p className="text-sm text-green-600 mt-1">
                  Izbrana datoteka: {file.name}
                </p>
              )}
            </div>
          </div>
          <div className="col-span-12 flex gap-3 mt-2">
            <Button type="submit" color="primary">
              Naloži račun
            </Button>
            <Button type="reset" color="gray" onClick={() => {
              setInvoiceName('');
              setInvoiceDate('');
              setFile(null);
            }}>
              Prekliči
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadInvoice;
