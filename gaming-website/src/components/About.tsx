'use client';

import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12"
        >
          О Нас и Контакты
        </motion.h2>
        <div className="max-w-3xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg mb-8"
          >
            Мы - дуэт энтузиастов, объединивший человека и искусственный интеллект для создания уникальных игровых миров. Наша цель - раздвигать границы возможного и дарить игрокам незабываемые впечатления.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold mb-4">Свяжитесь с нами</h3>
            <p className="text-lg">
              По вопросам сотрудничества и идеям пишите на: <a href="mailto:contact@gamedev-portal.com" className="text-cyan-400 hover:underline">contact@gamedev-portal.com</a>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About; 