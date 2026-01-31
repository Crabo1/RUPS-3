import type { Level, GameState, Direction } from '../../types/game';

interface LevelGridProps {
  level: Level;
  result: GameState | null;
  rotationRef: React.MutableRefObject<number>;
  lastDirectionRef: React.MutableRefObject<Direction>;
  isDead?: boolean;
}

export function LevelGrid({
  level,
  result,
  rotationRef,
  lastDirectionRef,
  isDead = false,
}: LevelGridProps) {
  return (
    <div
      className="relative grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${level.levelMatrix[0].length}, minmax(0, 1fr))`,
      }}
    >
      {level.levelMatrix.map((row, y) =>
        row.map((cell, x) => {
          const obj = level.objectsMatrix[y][x];
          const currentObj = result ? result.objectsMatrix[y][x] : obj;
          const isStartPosition = obj === 'start';

          return (
            <div
              key={`${x}-${y}`}
              className="relative aspect-square rounded-lg"
              style={{
                backgroundImage: `url(/game_assets/tiles/${cell}.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!result && isStartPosition && (
                <img
                  src="/game_assets/objects/start.svg"
                  alt="Start"
                  className="absolute inset-0 h-full w-full p-2"
                />
              )}
              {result && obj === 'start' && (
                <img
                  src="/game_assets/objects/start.svg"
                  alt="Start"
                  className="absolute inset-0 h-full w-full p-2"
                />
              )}
              {currentObj === 'finish' && (
                <img
                  src="/game_assets/objects/finish.svg"
                  alt="Finish"
                  className="absolute inset-0 h-full w-full p-2"
                />
              )}
              {currentObj === 'key' && (
                <img
                  src="/game_assets/objects/key.svg"
                  alt="Key"
                  className="absolute inset-0 h-full w-full p-4"
                />
              )}
              {currentObj === 'lock' && (
                <img
                  src="/game_assets/objects/lock.svg"
                  alt="Lock"
                  className="absolute inset-0 h-full w-full p-4"
                />
              )}
              {currentObj === 'obstacle' && (
                <img
                  src="/game_assets/objects/obstacle.svg"
                  alt="Obstacle"
                  className="absolute inset-0 h-full w-full p-2"
                />
              )}
            </div>
          );
        }),
      )}

      {(() => {
        const playerPos =
          result?.playerPosition ||
          level.objectsMatrix
            .flatMap((row, y) =>
              row.map((obj, x) => (obj === 'start' ? { x, y } : null)),
            )
            .find((pos) => pos);

        if (!playerPos) return null;

        const cellSize = 100 / level.levelMatrix[0].length;
        const isJumping = result?.isJumping || false;

        const currentDirection = result?.playerDirection || 'right';
        const directionToDegrees: Record<Direction, number> = {
          up: 0,
          right: 90,
          down: 180,
          left: 270,
        };

        if (result && currentDirection !== lastDirectionRef.current) {
          const lastDeg = directionToDegrees[lastDirectionRef.current];
          const currentDeg = directionToDegrees[currentDirection];
          let delta = currentDeg - lastDeg;

          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;

          rotationRef.current += delta;
          lastDirectionRef.current = currentDirection;
        }

        return (
          <>
            {isJumping && (
              <div
                className="bg-primary-500 pointer-events-none absolute animate-pulse rounded-full opacity-80 blur-md"
                style={{
                  left: `calc(${playerPos.x * cellSize}% + 0.25rem)`,
                  top: `calc(${playerPos.y * cellSize}% + 0.25rem)`,
                  width: `calc(${cellSize}% - 0.5rem)`,
                  height: `calc(${cellSize}% - 0.5rem)`,
                }}
              />
            )}

            <img
              src="/game_assets/player/robot.svg"
              alt="Player"
              className="pointer-events-none absolute transition-all duration-300 ease-in-out"
              style={{
                left: `calc(${playerPos.x * cellSize}% + 0.25rem)`,
                top: `calc(${playerPos.y * cellSize}% + 0.25rem)`,
                width: `calc(${cellSize}% - 0.5rem)`,
                height: `calc(${cellSize}% - 0.5rem)`,
                padding: '0.25rem',
                transform: `rotate(${rotationRef.current}deg)`,
                filter: isDead
                  ? 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)'
                  : 'none',
              }}
            />
          </>
        );
      })()}
    </div>
  );
}
