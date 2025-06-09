import { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { getCustomDocData } from 'src/index';

type DocDataPopUpProps = {
  uid?: string;
  docId?: string;
  subColId?: string;
  subDocId?: string;
};

export const DocDataPopUp = ({ uid, docId, subColId, subDocId }: DocDataPopUpProps) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (uid && docId && subColId && subDocId) {
      getCustomDocData(uid, docId, subColId, subDocId).then(setData);
    }
  }, [uid, docId, subColId, subDocId]);

  const renderContent = () => {
    if (!data || !docId) return 'Ni podatkov.';

    switch (docId) {
      case 'optimum':
      case 'prekoracitve':
        return (
          <div className="space-y-2 text-sm max-h-[300px] overflow-auto">
            {Object.entries(data).map(([block, blockData]: any) => {
              if (block === 'total monthly price') {
                return (
                  <div key={block}>
                    <strong>Skupna mesečna cena:</strong> {blockData} €
                  </div>
                );
              }

              return (
                <div key={block} className="border-b pb-1">
                  <div>
                    <strong>Blok {block}</strong>
                  </div>
                  {blockData.data?.map((entry: any, idx: number) => (
                    <div key={idx} className="ml-2">
                      <div>Moč: {entry.agreedPower} kW</div>
                      <div>Prekoračitev: {entry.overrun_delta} kW</div>
                      <div>Cena kazni: {entry.penalty_price} €</div>
                      <div>Max moč: {entry.maxPowerRecieved} kW</div>
                      <div>Čas: {entry.timestamp}</div>
                    </div>
                  ))}
                  <div>Skupna cena: {blockData['total price']} €</div>
                </div>
              );
            })}
          </div>
        );

      case 'poraba':
        return (
          <div className="space-y-1 text-sm">
            <div>
              <strong>Merilno mesto:</strong> {data['merilno mesto']}
            </div>
            <div>
              <strong>Poraba (ET):</strong> {data['poraba et']} kWh
            </div>
            <div>
              <strong>Delta prejeta delovna energija:</strong> {data['delta prejeta delovna energija et']} kWh
            </div>
            <div>
              <strong>Delta oddana delovna energija:</strong> {data['delta oddana delovna energija et']} kWh
            </div>
            <div>
              <strong>Tarifa (ET):</strong> {data['tarifa za et']} €/kWh
            </div>
            <div>
              <strong>Cena energije (ET):</strong> {data['cena energije et']} €/enota
            </div>
            <div>
              <strong>Vrsta stanja:</strong> {data['vrsta stanja']}
            </div>
          </div>
        );

      case 'racuni':
        return (
          <div className="space-y-1 text-sm">
            <div>
              <strong>Mesec:</strong> {data.month}
            </div>
            <div>
              <strong>Skupni znesek:</strong> {data.totalAmount} €
            </div>
            <div>
              <strong>Omrežnina:</strong> {data.networkCost} €
            </div>
            <div>
              <strong>Penali:</strong> {data.penalties} €
            </div>
            <div>
              <strong>DDV:</strong> {data.vat} €
            </div>
            <div>
              <strong>Energija:</strong> {data.energyCost} €
            </div>
          </div>
        );

      default:
        return <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <div>
      <Popup
        trigger={
          <button
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
            }}
          >
            Preglej vsebino
          </button>
        }
        position="left center"
      >
        <div className="bg-white p-4 rounded shadow-md max-w-[400px] text-black">{renderContent()}</div>
      </Popup>
    </div>
  );
};
