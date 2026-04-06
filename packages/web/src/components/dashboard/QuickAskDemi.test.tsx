import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';
import { QuickAskDemi } from './QuickAskDemi';

const mockUseRuntimeEnvironment = vi.fn(() => ({
  isElectron: false,
  isMobileWebView: false,
  canInstallOllama: true,
}));

vi.mock('@hooks/useRuntimeEnvironment', () => ({
  useRuntimeEnvironment: () => mockUseRuntimeEnvironment(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseRuntimeEnvironment.mockReturnValue({
    isElectron: false,
    isMobileWebView: false,
    canInstallOllama: true,
  });
});

describe('QuickAskDemi', () => {
  it('renders the input and send button', () => {
    const { wrapper } = generateTestWrapper();
    render(<QuickAskDemi />, { wrapper });
    expect(screen.getByText('Ask Demi')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask Demi anything…')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('renders nothing when canInstallOllama is false (mobile WebView)', () => {
    mockUseRuntimeEnvironment.mockReturnValue({
      isElectron: false,
      isMobileWebView: true,
      canInstallOllama: false,
    });

    const { wrapper } = generateTestWrapper();
    const { container } = render(<QuickAskDemi />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it('disables send button when input is empty', () => {
    const { wrapper } = generateTestWrapper();
    render(<QuickAskDemi />, { wrapper });
    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', () => {
    const { wrapper } = generateTestWrapper();
    render(<QuickAskDemi />, { wrapper });
    const input = screen.getByPlaceholderText('Ask Demi anything…');
    fireEvent.change(input, { target: { value: 'What can I cook?' } });
    const sendButton = screen.getByText('Send');
    expect(sendButton).not.toBeDisabled();
  });
});
