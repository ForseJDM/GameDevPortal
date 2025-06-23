'use client';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} GameDev Portal. Все права защищены.</p>
        <p className="text-sm text-gray-400 mt-2">
          Создано с ❤️ на Next.js и Tailwind CSS.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 