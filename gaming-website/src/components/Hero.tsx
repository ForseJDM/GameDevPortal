'use client';

import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section 
      className="relative w-full h-screen mx-auto flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/hero-background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-10 text-center text-white">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-extrabold"
        >
          Игры Будущего
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-4 text-xl"
        >
          Погрузитесь в новые миры, созданные нами
        </motion.p>
      </div>
    </section>
  );
};

export default Hero; 