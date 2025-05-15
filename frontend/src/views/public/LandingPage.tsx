import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "flowbite-react";
import logo from "../../assets/images/logos/logo.png";
import { Icon } from "@iconify/react";
import AOS from "aos";
import "aos/dist/aos.css";
import lightningBg from "../../assets/images/backgrounds/lightning.png";



const gradientStyle = {
  background: "linear-gradient(45deg, rgba(238,119,82,0.2), rgba(231,60,126,0.2), rgba(35,166,213,0.2), rgba(35,213,171,0.2))",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite",
  minHeight: "100vh",
};

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


    useEffect(() => {
    AOS.init({ duration: 1000 });
    }, []);


  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={gradientStyle} className="font-sans text-gray-800 scroll-smooth relative overflow-x-hidden">
        <div className="absolute top-0 left-0 w-full h-[600px] z-0 pointer-events-none fade-mask" 
            style={{
            backgroundImage: `url(${lightningBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            }}
        ></div>

      <div className="absolute top-6 left-6 z-20">
        <img src={logo} alt="Omrežnina+ Logo" className="h-12 w-auto" />
      </div>

      <div className="absolute top-6 right-6 z-20 flex gap-4">
        <Link to="/auth/login">
          <Button size="sm" color="light">Prijava</Button>
        </Link>
        <Link to="/auth/register">
          <Button size="sm">Registracija</Button>
        </Link>
      </div>

        <div className="flex flex-col items-center justify-center text-center pt-20 relative z-10">
            <br />
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-4">Omrežnina+</h1>




        </div>


      {!isMobile && (
        <div className="absolute top-[220px] left-1/2 transform -translate-x-1/2 z-0 h-[calc(100%-320px)] flex flex-col items-center pointer-events-none">
          <div className="w-[3px] bg-gray-200 rounded-full h-full overflow-hidden relative">
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-yellow-400 to-blue-600 animate-pulse"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>
          <Icon icon="solar:zap-bold" className="text-yellow-400 mt-4 w-6 h-6 animate-pulse" />
        </div>
      )}

      <main className="max-w-6xl mx-auto py-20 px-4 space-y-32 relative z-10">
        <section className="flex flex-col md:grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="md:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Kaj ponujamo?</h2>
            <p className="text-gray-700 text-base sm:text-lg">
              Omrežnina+ je sodobna platforma za upravljanje porabe električne energije. 
              Namenjena je uporabnikom, ki želijo enostaven nadzor in transparentnost.
            </p>
          </div>
          <div className="hidden md:block md:col-span-1" />
          <div className="md:col-span-1 flex justify-center">
            <Icon icon="solar:graph-up-bold" className="text-blue-500 w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        </section>

        <section className="flex flex-col md:grid md:grid-cols-3 gap-8 items-center text-center md:text-left" data-aos="fade-up">
        <div className="md:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Sproti obveščeni</h2>
            <p className="text-gray-700 text-base sm:text-lg">
            Prejmite opozorila o spremembah v tarifah, porabi ali sistemskih vzdrževanjih neposredno v vašo aplikacijo.
            </p>
        </div>
        <div className="hidden md:block md:col-span-1" />
        <div className="md:col-span-1 flex justify-center">
            <Icon icon="solar:bell-bold" className="text-red-400 w-12 h-12 sm:w-16 sm:h-16" />
        </div>
        </section>

        <section className="flex flex-col md:grid md:grid-cols-3 gap-8 items-center text-center md:text-left"  data-aos="fade-up">
          <div className="md:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Pripravljeni na prihodnost</h2>
            <p className="text-gray-700 text-base sm:text-lg">
              S platformo Omrežnina+ ste vedno korak pred izpadom elektrike in predvidenimi spremembami v omrežnini.
            </p>
          </div>
          <div className="hidden md:block md:col-span-1" />
          <div className="md:col-span-1 flex justify-center">
            <Icon icon="solar:shield-check-bold" className="text-green-500 w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        </section>
      </main>

      <div className="hidden md:flex justify-center mt-8">
        <Icon icon="solar:bolt-bold-duotone" className="w-8 h-8" style={{ color: "#f8c20a" }} />
      </div>

      <footer className="text-center text-sm text-gray-500 py-6 relative z-10">
        &copy; {new Date().getFullYear()} Omrežnina+. Vse pravice pridržane.
      </footer>
    </div>
  );
};

export default LandingPage;
