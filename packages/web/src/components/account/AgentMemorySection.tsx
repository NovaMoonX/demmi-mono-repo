import { Badge, Button } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { deleteMemoryAsync } from '@store/actions/memoryActions';
import {
  MEMORY_CATEGORY_LABELS,
  MEMORY_CATEGORY_COLORS,
  MEMORY_CATEGORY_EMOJIS,
} from '@lib/memory';
import type { AgentMemory } from '@lib/memory';

export function AgentMemorySection() {
  const dispatch = useAppDispatch();
  const memories = useAppSelector((state) => state.memory.items);

  const handleDelete = async (id: string) => {
    await dispatch(deleteMemoryAsync(id));
  };

  if (memories.length === 0) {
    return (
      <div className='space-y-2'>
        <h3 className='text-foreground text-lg font-semibold'>🧠 Agent Memory</h3>
        <p className='text-muted-foreground text-sm'>
          No memories stored yet. As you chat with Demmi, it will remember key details to personalize your experience.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-foreground text-lg font-semibold'>🧠 Agent Memory</h3>
        <span className='text-muted-foreground text-xs'>
          {memories.length} memor{memories.length === 1 ? 'y' : 'ies'}
        </span>
      </div>
      <p className='text-muted-foreground text-sm'>
        Key facts Demmi remembers to personalize your experience. You can delete any memory at any time.
      </p>
      <ul className='space-y-2'>
        {memories.map((memory) => (
          <MemoryItem
            key={memory.id}
            memory={memory}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}

function MemoryItem({ memory, onDelete }: { memory: AgentMemory; onDelete: (id: string) => void }) {
  const categoryLabel = MEMORY_CATEGORY_LABELS[memory.category];
  const categoryColor = MEMORY_CATEGORY_COLORS[memory.category];
  const categoryEmoji = MEMORY_CATEGORY_EMOJIS[memory.category];

  return (
    <li
      className={join(
        'border-border bg-card flex items-start justify-between gap-3 rounded-lg border p-3',
      )}
    >
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm'>{categoryEmoji}</span>
          <Badge className={categoryColor}>{categoryLabel}</Badge>
          <span className='text-muted-foreground text-xs'>
            {new Date(memory.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className='text-foreground text-sm'>{memory.content}</p>
      </div>
      <Button
        size='sm'
        variant='base'
        onClick={() => onDelete(memory.id)}
        aria-label={`Delete memory: ${memory.content.slice(0, 30)}`}
      >
        Delete
      </Button>
    </li>
  );
}
