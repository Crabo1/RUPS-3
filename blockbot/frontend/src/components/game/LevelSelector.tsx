import { Button } from 'flowbite-react';
import type { Level, Action } from '../../types/game';
import { useState, useMemo } from 'react';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import { FaStar } from 'react-icons/fa';
import { BlockIcon } from './BlockIcon';

interface LevelSelectProps {
  levels: Level[];
  onLevelSelect: (levelIndex: number) => void;
  loading?: boolean;
  error?: string | null;
}

const ACTION_BLOCKS: Record<Action, string> = {
  forward: 'forward',
  turnLeft: 'turn left',
  turnRight: 'turn right',
  jump: 'jump',
  use: 'use',
  loop: 'repeat',
};


const ACTION_NAMES: Record<Action, string> = {
  forward: 'move (1) steps',
  turnLeft: 'turn left (90) degrees',
  turnRight: 'turn right (90) degrees',
  jump: 'jump',
  use: 'use key',
  loop: 'repeat (x)',
};

export function LevelSelector({
  levels,
  onLevelSelect,
  loading,
  error,
}: LevelSelectProps) {
  const { completedGames } = useGameCompletion();
  const defaultLevel = useMemo(
    () => (levels.length > 0 ? levels[0] : null),
    [levels],
  );
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const currentLevel = selectedLevel || defaultLevel;

  const completedLevelsMap = useMemo(() => {
    console.log('Completed games:', completedGames);
    const map = new Map<number, number>();
    completedGames.forEach((game) => {
      const levelNum = Number(game.level);
      const starsNum = Number(game.stars);
      console.log(`Mapping level ${levelNum} with ${starsNum} stars`);
      map.set(levelNum, starsNum);
    });
    console.log('Completed levels map:', map);
    return map;
  }, [completedGames]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Stopnje se nalagajo...
        </h2>
        <div className="flex justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="mb-8 text-center text-3xl font-bold text-red-600">
          Napaka pri nalaganju stopenj
        </h2>
        <p className="text-center text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-7 flex min-h-[calc(100vh-120px)] items-center justify-center p-8">
      <div
        className="relative mx-auto overflow-hidden rounded-[8rem] bg-[#0F2F2C]"
        style={{
          aspectRatio: '344/216',
          width: 'min(calc(100vw - 240px), calc((100vh - 240px) * 344/216))',
          height: 'min(calc(100vw - 240px) * 216/344, calc(100vh - 240px))',
          boxShadow: `
            0 0 0 8px #C2CED9,
            0 0 0 48px #EBEEF3
          `,
        }}
      >
        {/* Screen Content */}
        <div className="flex h-full w-full flex-col items-center justify-between p-16">
          <div className="flex h-full w-full items-center justify-between">
            <div className="w-[50%] overflow-y-auto pr-3">
              {currentLevel ? (
                <div className="text-white">
                  <div className="mb-3">
                    <span className="bg-primary-700 inline-block rounded-full px-2 py-1 text-xs font-bold text-white">
                      Stopnja {currentLevel.index}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold">
                      {currentLevel.name}
                    </h3>
                    <p className="mt-1 text-gray-300">
                      {currentLevel.description}
                    </p>
                  </div>

                  <div className="mb-3">
                    <h4 className="mb-2 text-sm font-medium text-gray-200">
                      Ukazi:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {
                        // currentLevel.actions.map((action) => (
                        //   <BlockIcon key={action} code={ACTION_NAMES[action]} />
                        // ))

                        currentLevel.actions.map((action) => {
                          console.log("CODE:", ACTION_NAMES[action]);
                          return <BlockIcon key={action} code={ACTION_NAMES[action]} scale={0.8} />;
                        })

                      }
                    </div>
                  </div>

                  {completedLevelsMap.get(currentLevel.index) !== undefined && (
                    <div className="mb-3">
                      <h4 className="mb-2 text-sm font-medium text-gray-200">
                        Najboljši rezultat:
                      </h4>
                      <div className="text-primary-600 flex items-center gap-2 text-2xl font-bold">
                        <FaStar />
                        {completedLevelsMap.get(currentLevel.index)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-lg text-white">
                  Izberi stopnjo na desni
                </div>
              )}
            </div>

            <div className="flex w-[50%] flex-col items-center justify-end">
              <div className="grid grid-cols-5 gap-0">
                {levels.slice(0, 12).map((level) => {
                  const stars = completedLevelsMap.get(level.index);
                  const isCompleted = stars !== undefined;

                  return (
                    <div key={level.index} className="relative m-2">
                      <Button
                        onClick={() => setSelectedLevel(level)}
                        outline={currentLevel?.index !== level.index}
                        className={`h-12 w-12 border-2 text-lg font-bold ${currentLevel?.index === level.index
                          ? 'bg-primary-600 hover:bg-primary-700'
                          : isCompleted
                            ? 'bg-primary-800 hover:bg-primary-900'
                            : ''
                          } text-white`}
                      >
                        {level.index}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {currentLevel && (
            <Button
              onClick={() => onLevelSelect(currentLevel.index)}
              className="w-full max-w-32 font-bold"
            >
              Začni
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
