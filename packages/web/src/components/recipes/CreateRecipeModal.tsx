import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';

interface CreateRecipeOption {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectFromText: () => void;
  onSelectFromUrl: () => void;
}

export function CreateRecipeModal({
  isOpen,
  onClose,
  onSelectManual,
  onSelectFromText,
  onSelectFromUrl,
}: CreateRecipeModalProps) {
  const options: CreateRecipeOption[] = [
    {
      icon: '✍️',
      title: 'Manual Entry',
      description: 'Have a recipe in mind? Fill in every detail yourself.',
      onClick: onSelectManual,
    },
    {
      icon: '💬',
      title: 'From Text',
      description: "Someone sent you a recipe? Paste it once and we'll handle the rest.",
      onClick: onSelectFromText,
    },
    {
      icon: '🌐',
      title: 'From URL',
      description: 'Found this recipe online? Just drop the link.',
      onClick: onSelectFromUrl,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='How would you like to add this recipe?'>
      <div className='flex flex-col gap-3 pt-2'>
        {options.map((option) => (
          <button
            key={option.title}
            onClick={() => {
              onClose();
              option.onClick();
            }}
            className={join(
              'flex items-start gap-4 rounded-xl border p-4 text-left transition-colors',
              'border-border hover:border-accent hover:bg-accent/5',
            )}
          >
            <span className='mt-0.5 text-2xl'>{option.icon}</span>
            <div className='flex flex-col gap-0.5'>
              <span className='text-foreground font-semibold'>{option.title}</span>
              <span className='text-muted-foreground text-sm'>{option.description}</span>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
