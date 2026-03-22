import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { VoiceIndicator } from './VoiceIndicator';

describe('VoiceIndicator', () => {
  const onToggle = jest.fn();

  it('returns null when unsupported', () => {
    const { container } = render(
      <VoiceIndicator voiceState="unsupported" enabled={false} onToggle={onToggle} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders voice toggle', () => {
    render(
      <VoiceIndicator voiceState="wake_word" enabled={false} onToggle={onToggle} />,
    );
    expect(screen.getByText(/Voice/)).toBeInTheDocument();
  });

  it('shows wake word notice when enabled', () => {
    render(
      <VoiceIndicator voiceState="wake_word" enabled={true} onToggle={onToggle} />,
    );
    expect(screen.getByText(/Hey Demmi/i)).toBeInTheDocument();
  });

  it('shows listening UI when in listening state', () => {
    render(
      <VoiceIndicator voiceState="listening" enabled={true} onToggle={onToggle} />,
    );
    expect(screen.getByText('Listening…')).toBeInTheDocument();
  });
});
