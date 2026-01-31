import { Button } from 'flowbite-react';
import { HiChevronRight, HiRefresh } from 'react-icons/hi';

interface GameControlsProps {
  onExecute: () => void;
  onReset: () => void;
  onUndo: () => void;
  isExecuting: boolean;
  hasActions: boolean;
  canUndo: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function GameControls({
  onExecute,
  onReset,
  onUndo,
  isExecuting,
  hasActions,
  canUndo,
  speed,
  onSpeedChange,
}: GameControlsProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
      <span className="text-sm font-semibold text-white">Hitrost:</span>
      <div className="relative flex items-center gap-3">
        <input
          type="range"
          min="1"
          max="5"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          disabled={isExecuting}
          className="h-2 w-40 cursor-pointer appearance-none rounded-lg bg-gray-600 accent-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, #0e7490 0%, #0e7490 ${((speed - 1) / 4) * 100}%, #4b5563 ${((speed - 1) / 4) * 100}%, #4b5563 100%)`
          }}
        />
        <div className="flex min-w-[3rem] items-center justify-center rounded-md bg-primary-600 px-2 py-1">
          <span className="text-sm font-bold text-white">{speed}x</span>
        </div>
      </div>
      
    <div className="flex w-full justify-center gap-4">
      <Button
        onClick={onUndo}
        outline
        className="border-2 border-yellow-500 bg-transparent text-yellow-500 hover:bg-yellow-500/10"
        disabled={!canUndo || isExecuting}
      >
        <HiRefresh className="mr-2 h-5 w-5 rotate-180" />
        Razveljavi
      </Button>

      <Button
        onClick={onExecute}
        outline
        className="border-primary-500 bg-primary-600 hover:bg-primary-600 w-48 border-2 font-bold text-white"
        disabled={isExecuting || !hasActions}
      >
        <HiChevronRight className="mr-2 h-5 w-5" />
        {isExecuting ? 'Izvajanje...' : 'Zaženi kodo'}
      </Button>
      <Button
        onClick={onReset}
        outline
        className="w-48 border-2 border-white bg-transparent text-white hover:bg-white/10"
        disabled={isExecuting}
      >
        <HiRefresh className="mr-2 h-5 w-5" />
        Ponastavi
      </Button>
    </div>
  </div>
  );
}
