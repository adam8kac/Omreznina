import easterEggBg from '../../../src/assets/images/backgrounds/easteregg.png';

const Tina = () => {
  return (
    <div>
      <img
        src={easterEggBg}
        alt="Easter Egg Background"
        className="w-full object-cover"
      />
    </div>
  );
};

export default Tina;