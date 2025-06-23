# Исследование: Создание игры "2048" на React

Этот документ содержит ключевые концепции и фрагменты кода из официального туториала React по созданию игры "Крестики-нолики". Мы будем использовать эти принципы в качестве основы для разработки нашей игры "2048".

## 1. Компонентная структура

Мы можем позаимствовать модульную структуру, разделив игру на несколько компонентов.

-   `Game.tsx`: Корневой компонент, который будет управлять общим состоянием игры (счет, статус "game over" и т.д.).
-   `Board.tsx`: Компонент, отвечающий за отрисовку игровой сетки 4x4.
-   `Tile.tsx`: Компонент для отдельной плитки, будет отображать число и иметь свой уникальный стиль в зависимости от значения.

**Пример структуры (адаптировано из туториала):**

```javascript
// Game.tsx
export default function Game() {
  return (
    <div className="game">
      <div className="game-board">
        <Board />
      </div>
      <div className="game-info">{/* Здесь будет счет и кнопка "Новая игра" */}</div>
    </div>
  );
}

// Board.tsx
export default function Board() {
  // Логика отрисовки сетки 4x4 с компонентами Tile
  return (
    <>
      <div className="board-row">
        <Tile value={2} />
        <Tile value={4} />
        {/* ... и так далее */}
      </div>
      {/* ... остальные ряды */}
    </>
  );
}

// Tile.tsx
function Tile({ value }) {
  // Стиль плитки будет зависеть от 'value'
  const style = TILE_STYLES[value] || 'bg-gray-400';
  return <div className={`tile ${style}`}>{value > 0 ? value : ''}</div>;
}
```

---

## 2. Управление состоянием (State Management)

Ключевая часть игры — это управление состоянием игрового поля. Мы будем использовать хук `useState` для хранения двумерного массива (4x4), представляющего сетку.

```javascript
// Внутри компонента Board.tsx
const [board, setBoard] = useState(initialBoard); // initialBoard - функция для создания стартовой сетки

// initialBoard может выглядеть так:
function createInitialBoard() {
  const board = Array(4)
    .fill(null)
    .map(() => Array(4).fill(0));
  // Добавляем две случайные плитки (2 или 4) на поле
  addRandomTile(board);
  addRandomTile(board);
  return board;
}
```

---

## 3. Игровая логика

Основная логика будет обрабатывать нажатия клавиш (вверх, вниз, влево, вправо). Каждое нажатие будет:

1.  Создавать глубокую копию текущего состояния доски.
2.  Перемещать и объединять плитки в соответствующем направлении.
3.  Проверять, изменилось ли состояние доски после хода.
4.  Если изменилось, добавлять новую случайную плитку (2 или 4) на пустое место.
5.  Обновлять состояние с помощью `setBoard`.
6.  Проверять, не наступил ли "game over".

**Пример обработчика нажатий:**

```javascript
// Внутри компонента Game.tsx или Board.tsx
useEffect(() => {
  const handleKeyDown = (event) => {
    // Создаем копию доски
    const newBoard = JSON.parse(JSON.stringify(board));

    let boardChanged = false;
    if (event.key === 'ArrowUp') {
      boardChanged = moveUp(newBoard);
    } else if (event.key === 'ArrowDown') {
      boardChanged = moveDown(newBoard);
    } // ... и так далее для ArrowLeft, ArrowRight

    if (boardChanged) {
      addRandomTile(newBoard);
      setBoard(newBoard);
      // Проверка на game over
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [board]); // Зависимость от 'board', чтобы функция всегда имела доступ к актуальному состоянию
```

---

## 4. Стилизация

Мы будем использовать Tailwind CSS для стилизации, как и в остальном проекте. Можно будет создать объект для маппинга значений плиток на CSS-классы, чтобы легко менять их внешний вид.

```javascript
const TILE_STYLES = {
  2: 'bg-gray-200 text-gray-800',
  4: 'bg-yellow-200 text-yellow-800',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  // ... и так далее
};

// В компоненте Tile.tsx
function Tile({ value }) {
  const style = TILE_STYLES[value] || 'bg-gray-400';
  return <div className={`tile ${style}`}>{value > 0 ? value : ''}</div>;
}
```

---

## 5. Анимации с помощью Framer Motion

Для создания плавных и приятных анимаций мы будем использовать `Framer Motion`. Ключевые моменты:

1.  **Анимация появления:** Новые плитки будут появляться с эффектом `scale` или `opacity`. Для этого обернем наши плитки в компонент `motion.div`.
2.  **Анимация движения:** Самое сложное — анимировать движение и слияние плиток. Вместо того чтобы просто менять массив данных, мы можем использовать проп `layout` у `motion.div`. Этот проп автоматически анимирует изменение позиции элемента на экране.
3.  **Ключи (`key`):** Чтобы React и Framer Motion правильно отслеживали, какая плитка куда переместилась или какая слилась, крайне важно будет использовать уникальные и стабильные `key` для каждой плитки. Ключ должен быть связан с самой плиткой, а не с ее позицией в сетке.

**Пример компонента `Tile.tsx` с анимацией:**

```javascript
import { motion } from 'framer-motion';

function Tile({ tile }) {
  // tile - это объект, например { id: 1, value: 2, position: [0, 1] }
  // Уникальный id нужен для пропа 'key' и 'layoutId'

  const style = TILE_STYLES[tile.value] || 'bg-gray-400';

  return (
    <motion.div
      key={tile.id}
      layoutId={tile.id.toString()} // Анимируем изменение позиции по этому ID
      className={`tile ${style}`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {tile.value}
    </motion.div>
  );
}
```

Эти наработки из туториала по "Крестикам-ноликам" дают нам отличный план и архитектурную основу для создания игры "2048". 