import { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = () => {
    if (!hasLoaded && uid && docId && subColId && subDocId) {
      setLoading(true);
      getCustomDocData(uid, docId, subColId, subDocId)
        .then(setData)
        .finally(() => {
          setLoading(false);
          setHasLoaded(true);
        });
    }
    setShowPopup((prev) => !prev);
  };

  const renderContent = () => {
    if (loading) return <div className="text-center py-4 text-gray-500">Nalaganje ...</div>;
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
    <div className="relative inline-block w-full">
      <button
        className={buttonStyle}
        type="button"
        onClick={handleClick}
      >
        Preglej vsebino
      </button>
      {showPopup && (
        <div className="fixed z-50 top-1/2 right-1/2 md:right-8 md:left-auto left-1/2 -translate-y-1/2 md:translate-x-0 -translate-x-1/2 w-[98vw] max-w-xs md:max-w-md bg-white border border-blue-200 rounded-xl shadow-2xl p-2 md:p-6 text-xs flex flex-col items-center">
          <div className="font-semibold text-base mb-2 text-primary flex items-center gap-2 w-full">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" /></svg>
            Podrobnosti
            <button className="ml-auto text-gray-400 hover:text-red-600 text-lg font-bold px-2 py-1 rounded-full focus:outline-none" onClick={() => setShowPopup(false)} title="Zapri">×</button>
          </div>
          <div className="w-full overflow-x-auto">
            {loading ? <div className="text-center py-2 text-gray-500">Nalaganje ...</div> :
              docId === 'optimum' || docId === 'prekoracitve' ? (
                <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                  {Object.entries(data || {}).map(([block, blockData]: any) => {
                    if (block === 'total monthly price') {
                      return (
                        <div key={block} className="w-full text-right text-lg font-semibold text-primary mt-2">
                          Skupna mesečna cena: {blockData} €
                        </div>
                      );
                    }
                    return (
                      <div key={block} className="border rounded-lg p-2 md:p-3 bg-blue-50 shadow-sm min-w-[160px] max-w-[180px] md:min-w-[220px] md:max-w-xs flex-1">
                        <div className="font-semibold text-primary mb-2">Blok {block}</div>
                        {blockData.data?.map((entry: any, idx: number) => (
                          <div key={idx} className="mb-2">
                            <div><span className="font-medium text-gray-700">Moč:</span> <span className="text-gray-900">{entry.agreedPower} kW</span></div>
                            <div><span className="font-medium text-gray-700">Prekoračitev:</span> <span className="text-gray-900">{entry.overrun_delta} kW</span></div>
                            <div><span className="font-medium text-gray-700">Max moč:</span> <span className="text-gray-900">{entry.maxPowerRecieved} kW</span></div>
                            <div><span className="font-medium text-gray-700">Cena kazni:</span> <span className="text-gray-900">{entry.penalty_price} €</span></div>
                            <div><span className="font-medium text-gray-700">Čas:</span> <span className="text-gray-900">{entry.timestamp}</span></div>
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-1 text-right">
                          Skupna cena bloka: <span className="font-semibold">{blockData['total price']} €</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : renderContent()
            }
          </div>
        </div>
      )}
    </div>
  );
};
