import { useState, useRef } from 'react';
import { Button, Modal, ModalBody, ModalHeader } from 'flowbite-react';
import { FaArrowLeft } from 'react-icons/fa';
import { executeActions } from '../../game/engine';
import { ActionBuilder } from './ActionBuilder';
import { LevelGrid } from './LevelGrid';
import { GameControls } from './GameControls';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import type { Level, GameAction, GameState, Direction } from '../../types/game';

interface GamePlayProps {
  level: Level;
  onBack: () => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
}

export function GamePlay({
  level,
  onBack,
  onNextLevel,
  hasNextLevel,
}: GamePlayProps) {
  const [actions, setActions] = useState<GameAction[]>([]);
  const [result, setResult] = useState<GameState | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const rotationRef = useRef(90);
  const lastDirectionRef = useRef<Direction>('right');
  const { completeGame } = useGameCompletion();
  const [executionSpeed, setExecutionSpeed] = useState(1);
  const [actionHistory, setActionHistory] = useState<GameAction[][]>([]);

  const MAX_ACTIONS = 20;

  const calculateActionsUsed = (actions: GameAction[]): number => {
    return actions.reduce((total, action) => {
      if (typeof action === 'object' && action.type === 'loop') {
        return total + action.actions.length + 1;
      }
      return total + 1;
    }, 0);
  };

  const handleActionsChange = (newActions: GameAction[]) => {
    setActionHistory([...actionHistory, actions]);
    setActions(newActions);
  }

  const handleUndo = () => {
    if (actionHistory.length > 0) {
      const previousActions = actionHistory[actionHistory.length - 1];
      setActions(previousActions);
      setActionHistory(actionHistory.slice(0, -1));
    }
  }

  const handleExecute = async () => {
    setIsExecuting(true);
    const delay = 1000 / executionSpeed;
    console.log('Execution speed:', executionSpeed, 'Delay:', delay);

    const finalState = await executeActions(level, actions, (state) => {
      setResult({ ...state });
    }, Date.now(), delay);
    setIsExecuting(false);

    if (finalState.isFailed) {
      setIsDead(true);
      await new Promise((resolve) => setTimeout(resolve, delay));
      setIsDead(false);

      await new Promise((resolve) => setTimeout(resolve, delay));
      setResult(null);
      rotationRef.current = 90;
      lastDirectionRef.current = 'right';
    } else if (finalState.isComplete) {
      const confetti = () => {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        for (let i = 0; i < 150; i++) {
          const particle = document.createElement('div');
          particle.style.position = 'fixed';
          particle.style.left = '50%';
          particle.style.top = '20%';
          particle.style.width = '7px';
          particle.style.height = '7px';
          particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          particle.style.borderRadius = '50%';
          particle.style.pointerEvents = 'none';
          particle.style.zIndex = '9999';
          document.body.appendChild(particle);

          const angle = Math.random() * Math.PI * 2;
          const velocity = 5 + Math.random() * 10;
          let x = 0,
            y = 0,
            vy = -velocity;

          const gravity = 0.9;

          const animate = () => {
            x += Math.cos(angle) * velocity;
            y += vy;
            vy += gravity;
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = String(1 - y / 900);
            if (y < 800) requestAnimationFrame(animate);
            else particle.remove();
          };
          animate();
        }
      };
      confetti();

      const actionsUsed = calculateActionsUsed(actions);
      const stars = MAX_ACTIONS - actionsUsed;

      try {
        await completeGame({
          gameId: level.index,
          data: {
            blocks_used: JSON.stringify(actions),
            stars: stars,
            completed: true,
          },
        });
      } catch (error) {
        console.error('Failed to save game completion:', error);
      }

      setShowWinModal(true);
    }
  };

  const handleReset = () => {
    setActions([]);
    setResult(null);
    setIsDead(false);
    rotationRef.current = 90;
    lastDirectionRef.current = 'right';
  };

  const handleNextLevel = () => {
    setShowWinModal(false);
    handleReset();
    onNextLevel();
  };

  return (
    <div className="relative z-0 flex h-[calc(100vh-64px)] items-center justify-center p-8">
      <div
        className="relative h-full w-full overflow-hidden rounded-[8rem] bg-[#0F2F2C]"
        style={{
          boxShadow: `
            0 0 0 8px #C2CED9,
            0 0 0 128px #EBEEF3
          `,
        }}
      >
        <div className="flex h-full w-full flex-col justify-center gap-4 p-12">
          <Button onClick={onBack} outline size="lg" className="mt-4">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Nazaj na izbiro stopnje
          </Button>
          <div className="flex items-start justify-between gap-8">
            <div className="w-[40%]">
              <LevelGrid
                level={level}
                result={result}
                rotationRef={rotationRef}
                lastDirectionRef={lastDirectionRef}
                isDead={isDead}
              />
            </div>

            <div className="flex h-full w-[60%]">
              <div className="w-full">
                <ActionBuilder
                  availableActions={level.actions}
                  actions={actions}
                  onActionsChange={handleActionsChange}
                />
              </div>
            </div>
          </div>

          <GameControls
            onExecute={handleExecute}
            onReset={handleReset}
            onUndo={handleUndo}
            isExecuting={isExecuting}
            hasActions={actions.length > 0}
            canUndo={actionHistory.length > 0}
            speed={executionSpeed}
            onSpeedChange={setExecutionSpeed}
          />

          {result && (
            <>
              {result.isComplete && (
                <Modal
                  show={showWinModal}
                  size="md"
                  onClose={() => setShowWinModal(false)}
                  popup
                >
                  <ModalHeader />
                  <ModalBody>
                    <div className="text-center">
                      <h3 className="mb-5 text-2xl font-bold text-gray-900">
                        Čestitke!
                      </h3>
                      <p className="mb-5 text-base text-gray-500">
                        Uspešno si zaključil stopnjo {level.index}!
                      </p>
                      <div className="flex flex-col gap-3">
                        {hasNextLevel && (
                          <Button onClick={handleNextLevel}>
                            Nadaljuj na naslednjo stopnjo
                          </Button>
                        )}
                        <Button color="alternative" onClick={onBack}>
                          Nazaj na izbiro stopenj
                        </Button>
                      </div>
                    </div>
                  </ModalBody>
                </Modal>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
