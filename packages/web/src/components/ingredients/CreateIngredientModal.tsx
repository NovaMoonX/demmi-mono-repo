import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';

interface CreateIngredientOption {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

interface CreateIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectBarcode: () => void;
  onSelectBarcodeEntry: () => void;
}

export function CreateIngredientModal({
  isOpen,
  onClose,
  onSelectManual,
  // onSelectBarcode, // hidden until camera scanning is implemented
  onSelectBarcodeEntry,
}: CreateIngredientModalProps) {
  const options: CreateIngredientOption[] = [
    {
      icon: '✍️',
      title: 'Manual Entry',
      description: 'Know the ingredient details? Fill everything in yourself.',
      onClick: onSelectManual,
    },
    // {
    //   icon: '📷',
    //   title: 'Scan Barcode',
    //   description: 'Have a product in hand? Scan its barcode to get started.',
    //   onClick: onSelectBarcode,
    // },
    {
      icon: '🔢',
      title: 'Enter Barcode',
      description: 'Have a barcode number? Enter it to look up the product.',
      onClick: onSelectBarcodeEntry,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='How would you like to create this ingredient?'>
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
