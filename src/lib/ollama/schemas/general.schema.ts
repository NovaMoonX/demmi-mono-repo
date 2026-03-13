export const GENERAL_SCHEMA: Record<string, unknown> = {
  type: 'object',
  required: ['response'],
  properties: {
    response: {
      type: 'string',
      description: 'Your message to the user (supports markdown)',
    },
  },
};
