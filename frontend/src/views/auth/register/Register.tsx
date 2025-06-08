import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";
import AuthRegister from "../authforms/AuthRegister";
import { Link } from "react-router";
import { FaBell, FaPlug } from "react-icons/fa";

const gradientStyle = {
  background: "linear-gradient(45deg, rgba(238,119,82,0.2), rgba(231,60,126,0.2), rgba(35,166,213,0.2), rgba(35,213,171,0.2))",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite",
  height: "100vh",
};

const Register = () => {
  const wireRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);

  const handleDrag = (e: any) => {
    const wire = wireRef.current;
    if (!wire) return;

    const rect = wire.getBoundingClientRect();
    const y = e.clientY || (e.touches && e.touches[0]?.clientY);

    if (y !== undefined) {
      const relativeY = Math.min(Math.max(y - rect.top, 0), rect.height);
      const newPosition = (relativeY / rect.height) * 100;
      setPosition(newPosition);
    }
  };

  return (
    <div style={gradientStyle} className="relative overflow-hidden h-screen flex items-center justify-center px-4">
      <div className="flex w-full max-w-6xl items-center relative">
        <div className="hidden md:flex flex-col justify-center gap-6 w-1/2 px-8">
          <h2 className="text-2xl font-semibold text-dark mb-2">Imejte nadzor</h2>
          <p className="text-md text-gray-700">
            Omrežnina+ je sodobna platforma za upravljanje porabe električne energije. Namenjena je uporabnikom, ki želijo enostaven nadzor in transparentnost.
          </p>
          <div className="flex items-start gap-4 mt-4">
            <FaBell size={24} className="mt-1 text-primary" />
            <div>
              <h3 className="font-medium text-dark">Sproti obveščeni</h3>
              <p className="text-sm text-gray-700">
                 Vedno imejte jasen vpogled v obračun elektrike in omrežnine.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <FaPlug size={24} className="mt-1 text-primary" />
            <div>
              <h3 className="font-medium text-dark">Korak pred prihodnostjo</h3>
              <p className="text-sm text-gray-700">
                Z Omrežnino+ boste pravočasno pripravljeni na spremembe in se izognili nepotrebnim stroškom.
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center px-4 relative" style={{ height: "300px" }}>
          <div
            ref={wireRef}
            className="w-[4px] bg-gray-300 rounded-full h-full relative"
            onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
            onTouchMove={handleDrag}
          >
            <div
              className="absolute left-0 w-full bg-gradient-to-b from-yellow-400 to-blue-500"
              style={{ height: `${position}%`, top: 0 }}
            />
            <div
              className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none"
              style={{ top: `${position}%` }}
              draggable="false"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
            >
              <Icon icon="heroicons:bolt-solid" className="text-yellow-400 w-6 h-6 z-20 relative" />
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center w-full md:w-1/2 px-6">
          <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 w-full max-w-md border-none">
            <div className="flex flex-col gap-2 w-full">
              <div className="mx-auto">
                <FullLogo />
              </div>
              <p className="text-sm text-center text-dark my-3">Registracija v Omrežnina+</p>
              <AuthRegister />
              <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
                <p>Že imate račun?</p>
                <Link to="/auth/login" className="text-primary text-sm font-medium">
                  Prijava
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
