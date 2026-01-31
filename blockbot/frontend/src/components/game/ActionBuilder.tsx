import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip } from 'flowbite-react';
import type { Action, GameAction, LoopAction } from '../../types/game';
import { BlockIcon } from './BlockIcon';

interface ActionBuilderProps {
  availableActions: Action[];
  actions: GameAction[];
  onActionsChange: (actions: GameAction[]) => void;
}

interface ActionBlockProps {
  action: Action;
  isDragging?: boolean;
  isDisplay?: boolean;
  scale?: number;
}

const actionLabels: Record<Action, string> = {
  forward: 'move (1) steps',
  turnLeft: 'turn left (90) degrees',
  turnRight: 'turn right (90) degrees',
  jump: 'jump',
  use: 'use key',
  loop: 'repeat (x)',
};

const actionTooltips: Record<Action, string> = {
  forward: 'Premakni se naprej',
  turnLeft: 'Obrni se levo',
  turnRight: 'Obrni se desno',
  jump: 'Skoči naprej',
  use: 'Uporabi predmet',
  loop: 'Ponavljanje',
};

function ActionBlock({ action, isDragging, isDisplay = true, scale = 1 }: ActionBlockProps) {
  const containerSize = scale === 1 ? 'w-auto' : 'w-12';
  return (
    <div
      className={`${isDragging ? 'opacity-50' : ''} ${containerSize}`}
      style={{ 
        marginLeft: scale === 1 ? '30px' : '0px', 
        transform: `scale(${scale})`,
        transformOrigin: 'left center'
      }}
    >
      {
        isDisplay ?
          (
            <BlockIcon key={action} code={actionLabels[action]} scale={scale} />
          ) : (
            <pre>
              <code>
                {actionLabels[action]}
              </code>
            </pre>
          )
      }
    </div>
  );
}

interface LoopBlockProps {
  loopAction: LoopAction;
  isDragging: boolean;
  loopId: string;
  onNestedRemove: (nestedIndex: number) => void;
  onIterationsChange: (newIterations: number) => void;
}

function LoopBlock({
  loopAction,
  isDragging,
  loopId,
  onNestedRemove,
  onIterationsChange,
}: LoopBlockProps) {
  const { setNodeRef: setDropRef } = useDroppable({ id: `${loopId}-dropzone` });

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIterationsChange(loopAction.iterations + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loopAction.iterations > 1) {
      onIterationsChange(loopAction.iterations - 1);
    }
  };

  return (
    <div
      className={`flex items-center gap-0 p-2 -ml-5 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex h-full flex-shrink-0 flex-col items-center justify-center gap-0.5 px-2">
        <button
          onClick={handleIncrement}
          className="flex h-4 w-4 items-center justify-center text-gray-600 hover:text-gray-900"
          type="button"
        >
          ▲
          {/* + */}
        </button>
        <pre><code>{loopAction.iterations}x</code></pre>
        <button
          onClick={handleDecrement}
          className="flex h-4 w-4 items-center justify-center text-gray-600 hover:text-gray-900"
          type="button"
        >
          ▼
          {/* - */}
        </button>
      </div>
      <SortableContext
        items={loopAction.actions.map(
          (_, index) => `${loopId}-nested-${index}`,
        )}
        strategy={rectSortingStrategy}
      >
        <div
          ref={setDropRef}
          className="flex h-full flex-1 flex-col gap-2 px-2"
        >
          <div>
            <pre>
              <code>
                repeat ({loopAction.iterations})
              </code>
            </pre>

          </div>
          {loopAction.actions.length === 0 ? (
            <span className="text-sm text-gray-400">Vstavi akcijo</span>
          ) : (
            loopAction.actions.map((nestedAction, index) =>
              typeof nestedAction === 'string' ? (
                <NestedAction
                  key={`${loopId}-nested-${index}`}
                  id={`${loopId}-nested-${index}`}
                  action={nestedAction}
                  onRemove={() => onNestedRemove(index)}
                />
              ) : null,
            )
          )}
          <div>
            <pre>
              <code>
                end
              </code>
            </pre>
          </div>
        </div>
      </SortableContext>
    </div>
  );
}

interface NestedActionProps {
  action: Action;
  id: string;
  onRemove: () => void;
}

function NestedAction({ action, id, onRemove }: NestedActionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, transition: null });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="group relative inline-block"
    >
      <div
        className={`${isDragging ? 'opacity-50' : ''}`}
        style={{ marginLeft: '30px' }}
      >
        <pre>
          <code>
            {actionLabels[action]}
          </code>
        </pre>

      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

interface SortableActionProps {
  action: GameAction;
  id: string;
  onRemove: () => void;
  onNestedRemove?: (nestedIndex: number) => void;
  onIterationsChange?: (newIterations: number) => void;
}

function SortableAction({
  action,
  id,
  onRemove,
  onNestedRemove,
  onIterationsChange,
}: SortableActionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isLoop = typeof action === 'object' && action.type === 'loop';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative inline-block"
    >
      {isLoop ? (
      <LoopBlock
        loopAction={action}
        isDragging={isDragging}
        loopId={id}
        onNestedRemove={onNestedRemove || (() => { })}
        onIterationsChange={onIterationsChange || (() => { })}
      />
      ) : (
      <ActionBlock action={action as Action} isDragging={isDragging} isDisplay={false} />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className={`absolute -top-2 -right-6 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 ${isLoop ? 'z-10' : ''}`}
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

// ne rabim gleat
interface DraggableActionProps {
  action: Action;
  id: string;
}

function DraggableAction({ action, id }: DraggableActionProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  return (
    <Tooltip content={actionTooltips[action]}>
      <div
        ref={setNodeRef}
        style={{
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        }}
        {...attributes}
        {...listeners}
      >
        <ActionBlock action={action} isDragging={isDragging} scale={1} />
      </div>
    </Tooltip>
  );
}

export function ActionBuilder({
  availableActions,
  actions,
  onActionsChange,
}: ActionBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const MAX_ACTIONS = 20;

  const totalActionsCount = actions.reduce((total, action) => {
    if (typeof action === 'object' && action.type === 'loop') {
      return total + action.actions.length + 1;
    }
    return total + 1;
  }, 0);

  const calculateNewCount = (newActions: GameAction[]): number => {
    return newActions.reduce((total, action) => {
      if (typeof action === 'object' && action.type === 'loop') {
        return total + action.actions.length + 1;
      }
      return total + 1;
    }, 0);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const isFromPalette = activeId.startsWith('palette-');
    const isFromActions =
      activeId.startsWith('action-') && !activeId.includes('-nested-');
    const isFromNested = activeId.includes('-nested-');
    const isOverDropzone = overId === 'actions-dropzone';
    const isOverAction =
      overId.startsWith('action-') && !overId.includes('-nested-');
    const isOverLoopDropzone =
      overId.endsWith('-dropzone') && overId !== 'actions-dropzone';
    const isOverNested = overId.includes('-nested-');

    if (
      isFromPalette &&
      (isOverDropzone || (isOverAction && !isOverLoopDropzone))
    ) {
      const action = activeId.replace('palette-', '') as Action;
      const newActions = [...actions];

      if (action === 'loop') {
        const loopAction: LoopAction = {
          type: 'loop',
          iterations: 2,
          actions: [],
        };
        if (isOverDropzone) {
          newActions.push(loopAction);
        } else {
          const index = parseInt(overId.replace('action-', ''));
          newActions.splice(index, 0, loopAction);
        }
      } else {
        if (isOverDropzone) {
          newActions.push(action);
        } else {
          const index = parseInt(overId.replace('action-', ''));
          newActions.splice(index, 0, action);
        }
      }

      if (calculateNewCount(newActions) <= MAX_ACTIONS) {
        onActionsChange(newActions);
      }
    } else if (isFromPalette && (isOverLoopDropzone || isOverNested)) {
      const action = activeId.replace('palette-', '') as Action;
      if (action === 'loop') return;

      const loopIdMatch = overId.match(/action-(\d+)/);
      if (!loopIdMatch) return;

      const loopIndex = parseInt(loopIdMatch[1]);
      const newActions = [...actions];
      const loopAction = newActions[loopIndex] as LoopAction;

      if (loopAction?.type === 'loop') {
        if (isOverLoopDropzone) {
          loopAction.actions.push(action);
        } else {
          const nestedIndex = parseInt(overId.split('-nested-')[1]);
          loopAction.actions.splice(nestedIndex, 0, action);
        }

        if (calculateNewCount(newActions) <= MAX_ACTIONS) {
          onActionsChange(newActions);
        }
      }
    } else if (isFromActions && isOverAction && !isOverLoopDropzone) {
      const oldIndex = parseInt(activeId.replace('action-', ''));
      const newIndex = parseInt(overId.replace('action-', ''));

      if (oldIndex === newIndex) return;

      onActionsChange(arrayMove(actions, oldIndex, newIndex));
    } else if (isFromActions && isOverLoopDropzone) {
      const oldIndex = parseInt(activeId.replace('action-', ''));
      const movingAction = actions[oldIndex];

      if (typeof movingAction !== 'string') return;

      const loopIdMatch = overId.match(/action-(\d+)/);
      if (!loopIdMatch) return;

      const loopIndex = parseInt(loopIdMatch[1]);
      const newActions = actions.filter((_, i) => i !== oldIndex);
      const adjustedIndex = oldIndex < loopIndex ? loopIndex - 1 : loopIndex;
      const loopAction = newActions[adjustedIndex] as LoopAction;

      if (loopAction?.type === 'loop') {
        loopAction.actions.push(movingAction);
        onActionsChange(newActions);
      }
    } else if (isFromNested && isOverNested) {
      const activeLoopIndex = parseInt(
        activeId.match(/action-(\d+)-nested/)?.[1] || '0',
      );
      const overLoopIndex = parseInt(
        overId.match(/action-(\d+)-nested/)?.[1] || '0',
      );

      if (activeLoopIndex !== overLoopIndex) return;

      const oldIndex = parseInt(activeId.split('-nested-')[1]);
      const newIndex = parseInt(overId.split('-nested-')[1]);

      if (oldIndex === newIndex) return;

      const newActions = [...actions];
      const loopAction = newActions[activeLoopIndex] as LoopAction;

      if (loopAction?.type === 'loop') {
        loopAction.actions = arrayMove(loopAction.actions, oldIndex, newIndex);
        onActionsChange(newActions);
      }
    }
  };

  const handleRemoveAction = (index: number) => {
    onActionsChange(actions.filter((_, i) => i !== index));
  };

  const handleRemoveNestedAction = (loopIndex: number, nestedIndex: number) => {
    const newActions = [...actions];
    const loopAction = newActions[loopIndex] as LoopAction;

    if (loopAction && loopAction.type === 'loop') {
      loopAction.actions = loopAction.actions.filter(
        (_, i) => i !== nestedIndex,
      );
      onActionsChange(newActions);
    }
  };

  const handleIterationsChange = (loopIndex: number, newIterations: number) => {
    const newActions = [...actions];
    const loopAction = newActions[loopIndex] as LoopAction;

    if (loopAction?.type === 'loop') {
      loopAction.iterations = newIterations;
      onActionsChange(newActions);
    }
  };

  const getActiveAction = (): Action | null => {
    if (!activeId) return null;

    if (activeId.startsWith('palette-')) {
      return activeId.replace('palette-', '') as Action;
    }

    if (activeId.startsWith('action-')) {
      const index = parseInt(activeId.replace('action-', ''));
      const action = actions[index];
      return typeof action === 'string' ? action : null;
    }

    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="border-primary-700 flex h-full flex-col gap-4 rounded-lg border-2 p-4">
        <div className="flex-1 overflow-hidden">
          <ActionsDropZone
            actions={actions}
            onRemove={handleRemoveAction}
            onNestedRemove={handleRemoveNestedAction}
            onIterationsChange={handleIterationsChange}
          />
        </div>

        <div className="border-primary-700 border-t-2"></div>

        <div className="flex flex-shrink-0 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {availableActions.map((action) => (
              <DraggableAction
                key={`palette-${action}`}
                id={`palette-${action}`}
                action={action}
              />
            ))}
          </div>
          <div className="p-2 text-2xl font-bold text-white">
            {totalActionsCount}/{MAX_ACTIONS}
          </div>
        </div>
      </div>

      <DragOverlay>
        {getActiveAction() && <ActionBlock action={getActiveAction()!}/>}
      </DragOverlay>
    </DndContext>
  );
}

function buildScratchCode(actions: GameAction[]): string {
  const build = (act: GameAction | Action): string => {
    if (typeof act === 'string') {
      return actionLabels[act];
    } else {
      // loop
      const inner = act.actions.map((a) => build(a)).join('\n  ');
      return `repeat (${act.iterations}) \n  ${inner}\nend`;
    }
  };

  return actions.map((a) => build(a)).join('\n');
}

interface ActionsDropZoneProps {
  actions: GameAction[];
  onRemove: (index: number) => void;
  onNestedRemove: (loopIndex: number, nestedIndex: number) => void;
  onIterationsChange: (loopIndex: number, newIterations: number) => void;
}

function ActionsDropZone({
  actions,
  onRemove,
  onNestedRemove,
  onIterationsChange,
}: ActionsDropZoneProps) {
  const { setNodeRef } = useDroppable({ id: 'actions-dropzone' });

  return (
    <div className="flex h-full flex-row">
      <div className="w-1/2 h-auto max-h-90 flex justify-center items-start overflow-y-auto">
        {actions.length > 0 && (
          <BlockIcon code={buildScratchCode(actions)} />
        )}
      </div>


      <SortableContext
        items={actions.map((_, index) => `action-${index}`)}
        strategy={rectSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="w-1/2 h-auto max-h-120 text-start gap-2 p-1 bg-gray-50 rounded-xl"
        >
          <div className="h-full w-full flex flex-col p-2 rounded-lg bg-gray-800 text-gray-100 font-mono overflow-y-auto">
            {actions.length === 0 ? (
              <p className="text-xl font-semibold">
                Povleci ukaze sem...
              </p>
            ) : (
              actions.map((action, index) => (
                <SortableAction
                  key={`action-${index}`}
                  id={`action-${index}`}
                  action={action}
                  onRemove={() => onRemove(index)}
                  onNestedRemove={(nestedIndex) =>
                    onNestedRemove(index, nestedIndex)
                  }
                  onIterationsChange={(newIterations) =>
                    onIterationsChange(index, newIterations)
                  }
                />
              ))
            )}
          </div>
        </div>
      </SortableContext>

    </div>
  );

}
