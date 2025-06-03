import { useEffect, useState } from 'react';
import { Label, TextInput } from 'flowbite-react';
import { getMfaSettings, setupMfaSettings } from 'src/index';
import base32Encode from 'base32-encode';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  uid: string;
}

const MfaSettingsPanel = ({ uid }: Props) => {
  const [enabled, setEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [otpUrl, setOtpUrl] = useState('');
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({
    message: '',
    type: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await getMfaSettings(uid);
        setEnabled(settings?.enabled ?? false);
      } catch {
        setStatus({
          message: 'Napaka pri pridobivanju nastavitev dvofaktorske avtentikacije.',
          type: 'error',
        });
      }
    };
    load();
  }, [uid]);

  const generateBase32Secret = (length = 20): string => {
    const random = new Uint8Array(length);
    window.crypto.getRandomValues(random);
    return base32Encode(random, 'RFC4648', { padding: false });
  };

  const generateSecret = () => {
    const sec = generateBase32Secret();
    const otp = `otpauth://totp/Omreznina:${uid}?secret=${sec}&issuer=OmrezninaApp`;
    setSecret(sec);
    setOtpUrl(otp);
    setStatus({ message: '', type: '' });
  };

  const enable2FA = async () => {
    setLoading(true);
    try {
      const success = await setupMfaSettings(uid, secret, true);
      if (success) {
        setEnabled(true);
        setStatus({ message: 'Dvofaktorska avtentikacija je uspešno omogočena.', type: 'success' });
      } else {
        throw new Error();
      }
    } catch {
      setStatus({
        message: 'Napaka pri omogočanju dvofaktorske avtentikacije.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const success = await setupMfaSettings(uid, 'disabled', false);
      if (success) {
        setEnabled(false);
        setSecret('');
        setOtpUrl('');
        setStatus({ message: 'Dvofaktorska avtentikacija je uspešno onemogočena.', type: 'success' });
      } else {
        throw new Error();
      }
    } catch {
      setStatus({
        message: 'Napaka pri onemogočanju dvofaktorske avtentikacije.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl px-8 py-10 text-center">
      <h2 className="text-2xl font-bold mb-2">Dvofaktorska avtentikacija (2FA)</h2>
      <p className="text-gray-600 text-sm mb-6">
        Dvofaktorska avtentikacija je trenutno{' '}
        <span className="font-semibold">{enabled ? 'OMOGOČENA' : 'ONEMOGOČENA'}</span> za ta račun.
      </p>

      {!enabled && !secret && (
        <button
          className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90"
          onClick={generateSecret}
        >
          Ustvari žeton in QR kodo
        </button>
      )}

      {!enabled && secret && (
        <>
          <div className="mt-6 text-left">
            <Label value="Žeton" className="mb-1 block text-sm" />
            <TextInput value={secret} readOnly className="w-full" />
          </div>

          <div className="mt-6">
            <Label value="QR koda za Google Authenticator" className="mb-2 block text-sm" />
            <div className="flex justify-center">
              <QRCodeSVG value={otpUrl} size={200} />
            </div>
          </div>

          <button
            onClick={enable2FA}
            disabled={loading}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Omogoči dvofaktorsko avtentikacijo
          </button>
        </>
      )}

      {enabled && (
        <button
          onClick={disable2FA}
          disabled={loading}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
        >
          Onemogoči dvofaktorsko avtentikacijo
        </button>
      )}

      {status.message && (
        <p
          className={`text-center text-sm mt-5 font-medium ${
            status.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
};

export default MfaSettingsPanel;
