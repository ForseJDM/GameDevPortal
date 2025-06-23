import ClickerGame from '@/components/games/ClickerGame';

const ClickerPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white pt-20">
      <h1 className="text-4xl font-bold mb-8">Кликер Прогрессии</h1>
      <ClickerGame />
    </div>
  );
};

export default ClickerPage; 