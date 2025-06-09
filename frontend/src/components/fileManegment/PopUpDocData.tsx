import { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { getCustomDocData } from 'src/index';

type DocDataPopUpProps = {
  uid?: string;
  docId?: string;
  subColId?: string;
  subDocId?: string;
  buttonStyle?: string;
};

export const DocDataPopUp = ({
  uid,
  docId,
  subColId,
  subDocId,
  buttonStyle = "bg-primary text-white rounded-lg px-4 py-2 text-xs font-semibold shadow hover:bg-primary/80"
}: DocDataPopUpProps) => {
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
                    <div key={idx} className="ml-2 mb-2 p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-700">Moč:</span> <span className="text-gray-900">{entry.agreedPower} kW</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Prekoračitev:</span> <span className="text-gray-900">{entry.overrun_delta} kW</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Max moč:</span> <span className="text-gray-900">{entry.maxPowerRecieved} kW</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Cena kazni:</span> <span className="text-gray-900">{entry.penalty_price} €</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Čas:</span> <span className="text-gray-900">{entry.timestamp}</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 mt-1">
                    Skupna cena: <span className="font-semibold">{blockData['total price']} €</span>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'poraba':
        return (
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium text-gray-700">Merilno mesto:</span> <span className="text-gray-900">{data['merilno mesto']}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Poraba (ET):</span> <span className="text-gray-900">{data['poraba et']} kWh</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Delta prejeta delovna energija:</span> <span className="text-gray-900">{data['delta prejeta delovna energija et']} kWh</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Delta oddana delovna energija:</span> <span className="text-gray-900">{data['delta oddana delovna energija et']} kWh</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tarifa (ET):</span> <span className="text-gray-900">{data['tarifa za et']} €/kWh</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cena energije (ET):</span> <span className="text-gray-900">{data['cena energije et']} €/enota</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Vrsta stanja:</span> <span className="text-gray-900">{data['vrsta stanja']}</span>
            </div>
          </div>
        );

      case 'racuni':
        return (
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium text-gray-700">Mesec:</span> <span className="text-gray-900">{data.month}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Skupni znesek:</span> <span className="text-gray-900">{data.totalAmount} €</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Omrežnina:</span> <span className="text-gray-900">{data.networkCost} €</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Penali:</span> <span className="text-gray-900">{data.penalties} €</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">DDV:</span> <span className="text-gray-900">{data.vat} €</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Energija:</span> <span className="text-gray-900">{data.energyCost} €</span>
            </div>
          </div>
        );

      default:
        return <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <Popup
      trigger={
        <button className={buttonStyle}>
          Preglej vsebino
        </button>
      }
      modal
      closeOnDocumentClick
      contentStyle={{
        background: '#fff',
        borderRadius: '16px',
        maxWidth: 420,
        padding: '1.5rem',
        boxShadow: '0 2px 16px #0001',
        color: '#232323',
      }}
    >
      <div>
        <div className="font-semibold text-base mb-3 text-primary">Podrobnosti dokumenta</div>
        {renderContent()}
      </div>
    </Popup>
  );
};
