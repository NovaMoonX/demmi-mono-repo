import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@moondreamsdev/dreamer-ui/components';
import { useRuntimeEnvironment } from '@hooks/useRuntimeEnvironment';

export function QuickAskDemi() {
  const navigate = useNavigate();
  const { canInstallOllama } = useRuntimeEnvironment();
  const [question, setQuestion] = useState('');

  if (!canInstallOllama) {
    return null;
  }

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    navigate('/chat', { state: { prefill: trimmed } });
    setQuestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Ask Demi</h2>
      <div className="flex gap-2">
        <Input
          placeholder="Ask Demi anything…"
          value={question}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleSubmit} disabled={!question.trim()}>
          Send
        </Button>
      </div>
    </Card>
  );
}
