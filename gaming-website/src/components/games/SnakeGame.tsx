'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import useFavicon from '@/hooks/useFavicon';

// Настройки игры
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const SNAKE_SPEED = 200; // в миллисекундах

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeFavicon = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path stroke="limegreen" stroke-width="4" stroke-linecap="round" fill="none" d="M4 28 C 4 22, 10 22, 10 16 S 4 10, 10 4 C 16 -2, 22 -2, 28 4 S 22 22, 16 28 S 10 34, 4 28 Z" /><circle cx="25" cy="7" r="2" fill="white" /></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, []);
  useFavicon(snakeFavicon);

  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: -1 }); // Начальное движение вверх
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(JSON.parse(savedHighScore));
    }
  }, []);

  // Cheats
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.resetSnakeGame = () => {
        console.log("--- RESETTING SNAKE GAME ---");
        localStorage.removeItem('snakeHighScore');
        
        // Manually reset state without reloading
        setHighScore(0);
        setScore(0);
        setSnake([{ x: 10, y: 10 }]);
        setFood({ x: 15, y: 15 });
        setDirection({ x: 0, y: -1 });
        setGameOver(false);
        console.log("--- SNAKE GAME RESET COMPLETE ---");
      };
      console.log("--- CHEATS ENABLED (SNAKE) ---");
      console.log("Use window.resetSnakeGame() to reset high score.");
    }
  }, []);

  // Основной игровой цикл
  useEffect(() => {
    if (gameOver) return;

    const gameInterval = setInterval(() => {
      moveSnake();
    }, SNAKE_SPEED);

    return () => clearInterval(gameInterval);
  }, [snake, gameOver]);

  // Отрисовка
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка поля
    ctx.fillStyle = '#1a202c'; // Темно-серый фон
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Отрисовка змейки
    ctx.fillStyle = '#48bb78'; // Зеленый
    snake.forEach(segment => {
      ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });

    // Отрисовка еды
    ctx.fillStyle = '#f56565'; // Красный
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    // Отрисовка счета
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Счет: ${score}`, 10, 25);
    ctx.fillText(`Рекорд: ${highScore}`, CANVAS_WIDTH - 120, 25);

  }, [snake, food, gameOver, score, highScore]);

  // Управление
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) {
            setDirection({ x: 0, y: -1 });
            e.preventDefault();
          }
          break;
        case 'ArrowDown':
          if (direction.y === 0) {
            setDirection({ x: 0, y: 1 });
            e.preventDefault();
          }
          break;
        case 'ArrowLeft':
          if (direction.x === 0) {
            setDirection({ x: -1, y: 0 });
            e.preventDefault();
          }
          break;
        case 'ArrowRight':
          if (direction.x === 0) {
            setDirection({ x: 1, y: 0 });
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);
  
  const generateFood = () => {
    const newFood = {
        x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
    };
    setFood(newFood);
  };

  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

    const endGame = () => {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('snakeHighScore', JSON.stringify(score));
      }
      setGameOver(true);
    }

    // Проверка на столкновение со стеной
    if (head.x < 0 || head.x * GRID_SIZE >= CANVAS_WIDTH || head.y < 0 || head.y * GRID_SIZE >= CANVAS_HEIGHT) {
      endGame();
      return;
    }
    
    // Проверка на столкновение с собой
    for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
            endGame();
            return;
        }
    }

    newSnake.unshift(head);
    
    // Проверка на съедание еды
    if (head.x === food.x && head.y === food.y) {
      generateFood();
      setScore(prevScore => prevScore + 10);
    } else {
      newSnake.pop();
    }
    
    setSnake(newSnake);
  };

  const restartGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 0, y: -1 });
    setGameOver(false);
    setScore(0);
  };


  return (
    <div className="border-4 border-gray-700 rounded-lg">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      />
      {gameOver && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white bg-gray-800 bg-opacity-80 p-6 rounded-lg">
          <h2 className="text-3xl font-bold mb-2">Игра Окончена</h2>
          <p className="text-xl mb-4">Ваш счет: {score}</p>
          <p className="text-lg mb-4">Рекорд: {highScore}</p>
          <button 
            onClick={restartGame}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-bold"
          >
            Начать заново
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame; 