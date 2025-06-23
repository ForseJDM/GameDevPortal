import SnakeGame from '@/components/games/SnakeGame';

const SnakePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 pt-20">
      <h1 className="text-4xl font-bold text-white mb-8">Классическая Змейка</h1>
      <SnakeGame />
    </div>
  );
};

export default SnakePage; 