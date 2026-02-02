import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

// Import circuit scenes - adjust paths based on your structure
// Note: Adjust the number of ../ based on where CircuitSimulator.tsx is located
// If in frontend/src/components/, use ../../../src/circuit/scenes/
// If path issues occur, check console and adjust
import MenuScene from '../../../src/circuit/scenes/menuScene';
import LabScene from '../../../src/circuit/scenes/labScene';
import LoginScene from '../../../src/circuit/scenes/loginScene';
import ScoreboardScene from '../../../src/circuit/scenes/scoreboardScene';
import LevelScene from '../../../src/circuit/scenes/levelScene';
import WorkspaceScene from '../../../src/circuit/scenes/workspaceScene';

interface CircuitSimulatorProps {
  inventory?: string[];
  onClose?: () => void;
}

export default function CircuitSimulator({ inventory = [], onClose }: CircuitSimulatorProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!gameContainerRef.current) return;

    try {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth * 0.95,
        height: window.innerHeight * 0.95,
        backgroundColor: '#f4f6fa',
        parent: gameContainerRef.current,
        scene: [
          MenuScene,
          LabScene,
          WorkspaceScene,
          LevelScene,
          LoginScene,
          ScoreboardScene,
        ],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      };

      console.log('Initializing Circuit Phaser game...');
      gameRef.current = new Phaser.Game(config);
      
      // Pass inventory to the game if needed
      if (gameRef.current.registry) {
        gameRef.current.registry.set('blockbotInventory', inventory);
      }

      console.log('Circuit game initialized successfully');

    } catch (err) {
      console.error('Error initializing circuit:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }

    return () => {
      if (gameRef.current) {
        console.log('Destroying Circuit Phaser game...');
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [inventory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-[98vw] h-[98vh] bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[60] bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-colors text-lg"
        >
          ✕ Zapri Circuit
        </button>
        
        {/* Error display */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg z-[60]">
            Napaka: {error}
          </div>
        )}
        
        {/* Game container */}
        <div 
          ref={gameContainerRef} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
}