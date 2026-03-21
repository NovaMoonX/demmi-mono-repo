import {
  INTENT_ACTION_SHORT_DESCRIPTIONS,
  INTENT_ACTIONS,
} from '../ollama.constants';

export const INTENT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['action'],
  properties: {
    action: {
      type: 'string',
      enum: INTENT_ACTIONS,
      description: `The type of user intent:\n{${INTENT_ACTIONS.map((a) => `— "${a}": ${INTENT_ACTION_SHORT_DESCRIPTIONS[a]}`).join('\n')}}`,
    },
  },
};
