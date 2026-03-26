import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateTestWrapper } from '@/__tests__/generateTestWrapper';

const mockListLocalModels = vi.fn();
const mockOllamaChat = vi.fn();

vi.mock('@lib/ollama', () => ({
  listLocalModels: (...args: unknown[]) => mockListLocalModels(...args),
  ollamaClient: {
    chat: (...args: unknown[]) => mockOllamaChat(...args),
  },
}));

vi.mock('@components/onboarding', () => ({
  StepWelcome: () => <div><span>StepWelcome</span></div>,
  StepGoal: ({ next }: { next: () => void }) => (
    <div>
      <span>StepGoal</span>
      <button onClick={next}>Next →</button>
    </div>
  ),
  StepDietary: () => <div><span>StepDietary</span></div>,
  StepCuisines: () => <div><span>StepCuisines</span></div>,
  StepHousehold: () => <div><span>StepHousehold</span></div>,
  StepSkill: () => <div><span>StepSkill</span></div>,
  StepCookTime: () => <div><span>StepCookTime</span></div>,
  StepGoalDetails: () => <div><span>StepGoalDetails</span></div>,
  StepStarterIngredients: ({ next, skip, back }: { next: () => void; skip: () => void; back: () => void }) => (
    <div>
      <span>StepStarterIngredients</span>
      <button onClick={back}>← Back</button>
      <button onClick={next}>Add to my kitchen</button>
      <button onClick={skip}>Skip for now</button>
    </div>
  ),
  StepLovedMeal: () => <div><span>StepLovedMeal</span></div>,
  StepDislikedMeal: () => <div><span>StepDislikedMeal</span></div>,
  StepProfileSummary: () => <div><span>StepProfileSummary</span></div>,
  StepAISuggestions: ({ next, skip }: { next: () => void; skip: () => void }) => (
    <div>
      <span>StepAISuggestions</span>
      <button onClick={next}>Save all recipes</button>
      <button onClick={skip}>Skip all</button>
    </div>
  ),
  StepComplete: ({ next }: { next: () => void }) => (
    <div>
      <span>StepComplete</span>
      <button onClick={next}>Go to my kitchen →</button>
    </div>
  ),
}));

vi.mock('@hooks/useOnboardingStep', () => ({
  useOnboardingStep: () => ({ visible: true }),
}));

import { Onboarding } from './Onboarding';

describe('Onboarding', () => {
  it('renders StepWelcome on step 0', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    expect(screen.getByText('StepWelcome')).toBeInTheDocument();
  });

  it('shows "Let\'s go" and "Skip setup" on step 0', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    expect(screen.getByText("Let's go")).toBeInTheDocument();
    expect(screen.getByText('Skip setup')).toBeInTheDocument();
  });

  it('advances to StepGoal when "Let\'s go" is clicked', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(screen.getByText('StepGoal')).toBeInTheDocument();
  });

  it('shows progress bar and step count after step 0', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });

  it('hides Skip button on Goal step', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    // Skip is hidden on the goal step — only footer ← Previous and Next → exist
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
  });

  it('shows Next, Previous but no Skip in footer on Goal step', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go"));
    // Footer has ← Previous and Next → but no Skip
    expect(screen.getAllByText('Next →')[0]).toBeInTheDocument();
    expect(screen.getByText('← Previous')).toBeInTheDocument();
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
  });

  it('advances from Goal step using Next → via mock', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go")); // → Goal
    // The mock StepGoal has its own Next → button; use that to advance
    const nextButtons = screen.getAllByText('Next →');
    fireEvent.click(nextButtons[0]); // advance from Goal
    expect(screen.getByText('StepDietary')).toBeInTheDocument();
  });

  it('shows Skip button on Dietary step', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go")); // → Goal
    const nextButtons = screen.getAllByText('Next →');
    fireEvent.click(nextButtons[0]); // → Dietary
    expect(screen.getByText('Skip')).toBeInTheDocument();
  });

  it('advances through steps with Next → after Goal', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go")); // → Goal
    const nextButtons = screen.getAllByText('Next →');
    fireEvent.click(nextButtons[0]); // → Dietary
    fireEvent.click(screen.getByText('Next →')); // → Cuisines
    expect(screen.getByText('StepCuisines')).toBeInTheDocument();
  });

  it('goes back with ← Previous', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go")); // → Goal
    const nextButtons = screen.getAllByText('Next →');
    fireEvent.click(nextButtons[0]); // → Dietary
    fireEvent.click(screen.getByText('← Previous')); // → Goal
    expect(screen.getByText('StepGoal')).toBeInTheDocument();
  });

  it('hides standard footer on StepStarterIngredients step', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    // Navigate: Welcome → Goal → Dietary → Cuisines → Household → Skill → CookTime → StarterIngredients
    fireEvent.click(screen.getByText("Let's go")); // step 1 (Goal)
    // Use mock Goal's own Next button to advance
    fireEvent.click(screen.getAllByText('Next →')[0]); // → Dietary (step 2)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText('Skip')); // Dietary → CookTime
    }
    expect(screen.getByText('StepStarterIngredients')).toBeInTheDocument();
    // Standard footer should be hidden (self-navigating step)
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });

  it('goes back from StepStarterIngredients using its own ← Back button', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go")); // → Goal
    fireEvent.click(screen.getAllByText('Next →')[0]); // → Dietary
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText('Skip'));
    }
    expect(screen.getByText('StepStarterIngredients')).toBeInTheDocument();
    fireEvent.click(screen.getByText('← Back'));
    expect(screen.getByText('StepCookTime')).toBeInTheDocument();
  });

  it('shows StepProfileSummary before StepAISuggestions', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go")); // → Goal
    fireEvent.click(screen.getAllByText('Next →')[0]); // → Dietary
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText('Skip')); // through Dietary…CookTime
    }
    // StarterIngredients
    fireEvent.click(screen.getByText('Skip for now'));
    // LovedMeal
    fireEvent.click(screen.getByText('Skip'));
    // DislikedMeal
    fireEvent.click(screen.getByText('Skip'));
    // Now at ProfileSummary
    expect(screen.getByText('StepProfileSummary')).toBeInTheDocument();
    // Advance to AISuggestions
    fireEvent.click(screen.getByText('Next →'));
    expect(screen.getByText('StepAISuggestions')).toBeInTheDocument();
  });

  it('hides standard footer on StepComplete (last step)', () => {
    mockListLocalModels.mockResolvedValue([]);
    const { wrapper } = generateTestWrapper();
    render(<Onboarding />, { wrapper });
    fireEvent.click(screen.getByText("Let's go")); // → Goal
    fireEvent.click(screen.getAllByText('Next →')[0]); // → Dietary
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText('Skip'));
    }
    fireEvent.click(screen.getByText('Skip for now')); // StarterIngredients
    fireEvent.click(screen.getByText('Skip')); // LovedMeal
    fireEvent.click(screen.getByText('Skip')); // DislikedMeal
    fireEvent.click(screen.getByText('Next →')); // ProfileSummary → AISuggestions
    fireEvent.click(screen.getByText('Skip all')); // AISuggestions → Complete
    expect(screen.getByText('StepComplete')).toBeInTheDocument();
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });
});
