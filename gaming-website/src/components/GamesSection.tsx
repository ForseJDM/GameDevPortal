'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const GamesSection = () => {
  return (
    <section id="games" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12"
        >
          Наши Проекты
        </motion.h2>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Snake Game Card */}
          <Link href="/play/snake">
            <div className="group block overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-shadow duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
              <Image
                src="/game-card-universal.jpg"
                alt="Snake Game"
                width={400}
                height={250}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold">Змейка</h3>
                <p className="mt-2 text-gray-400">
                  Классическая змейка с подсчетом очков и сохранением рекордов.
                </p>
              </div>
            </div>
          </Link>

          {/* Clicker Game Card */}
          <Link href="/play/clicker">
            <div className="group block overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-shadow duration-300 hover:shadow-lg hover:shadow-cyan-500/30">
              <Image
                src="/game-card-universal.jpg"
                alt="Clicker Game"
                width={400}
                height={250}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold">Кликер</h3>
                <p className="mt-2 text-gray-400">
                  Прогрессируйте, кликая и покупая улучшения.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GamesSection; 