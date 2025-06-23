export {};

declare global {
  interface Window {
    // Clicker Game Cheats
    addScore: (amount: number) => void;
    addPrestige: (amount: number) => void;
    resetClickerGame: () => void;

    // Snake Game Cheats
    resetSnakeGame: () => void;
  }
} 