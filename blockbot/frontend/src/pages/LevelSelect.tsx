import { useState } from 'react';
import { LevelSelector } from '../components/game/LevelSelector';
import { GamePlay } from '../components/game/GamePlay';
import { useLevels } from '../hooks/useLevels';
import type { Level } from '../types/game';

export default function LevelSelect() {
  const { levels, loading, error } = useLevels();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const handleLevelSelect = (levelIndex: number) => {
    const level = levels.find((l) => l.index === levelIndex);
    if (level) {
      setSelectedLevel(level);
    }
  };

  const handleBack = () => {
    setSelectedLevel(null);
  };

  const handleNextLevel = () => {
    if (selectedLevel) {
      const currentIndex = levels.findIndex(
        (l) => l.index === selectedLevel.index,
      );
      if (currentIndex !== -1 && currentIndex < levels.length - 1) {
        setSelectedLevel(levels[currentIndex + 1]);
      }
    }
  };

  const hasNextLevel = selectedLevel
    ? levels.findIndex((l) => l.index === selectedLevel.index) <
      levels.length - 1
    : false;

  if (selectedLevel) {
    return (
      <GamePlay
        level={selectedLevel}
        onBack={handleBack}
        onNextLevel={handleNextLevel}
        hasNextLevel={hasNextLevel}
      />
    );
  }

  return (
    <LevelSelector
      levels={levels}
      onLevelSelect={handleLevelSelect}
      loading={loading}
      error={error}
    />
  );
}
