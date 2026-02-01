// src/CircuitModal.tsx
import React, { useEffect, useRef } from 'react';
import './CircuitModal.css';
import { CircuitGraph } from '../../../circuit-simulator/src/logic/circuit_graph';
import { CircuitVisuals } from '../../../circuit-simulator/src/logic/circuit_visuals';

interface CircuitModalProps {
  isOpen: boolean;
  inventory: any[];
  onComplete: (circuit: any) => void;
  onClose: () => void;
}

export function CircuitModal({
  isOpen,
  inventory,
  onComplete,
  onClose
}: CircuitModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<typeof CircuitGraph | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      // Initialize circuit graph
      graphRef.current = new CircuitGraph();
      const graph = graphRef.current;

      // Draw canvas with your circuit logic
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#e0c9a6';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw grid
        ctx.strokeStyle = '#8b735533';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < canvasRef.current.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvasRef.current.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvasRef.current.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvasRef.current.width, y);
          ctx.stroke();
        }
      }

      // Cleanup
      return () => {
        graphRef.current = null;
      };
    }
  }, [isOpen, inventory]);

  const handleComplete = () => {
    if (graphRef.current) {
      onComplete({
        graph: graphRef.current,
        components: inventory
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Build Your Circuit</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <canvas 
            ref={canvasRef}
            width={800}
            height={600}
            className="circuit-canvas"
          />
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleComplete}>
            Complete Circuit
          </button>
        </div>
      </div>
    </div>
  );
}