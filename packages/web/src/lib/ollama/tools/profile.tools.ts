import type { ToolDefinition, ToolContext, ToolResult } from './tool.types';

export const getUserProfileTool: ToolDefinition = {
  name: 'get_user_profile',
  description: 'Get the user\'s profile including dietary restrictions, cuisine preferences, cooking goals, skill level, and household size.',
  parameters: {
    type: 'object',
    required: [],
    properties: {},
  },
  requiresConfirmation: false,
  execute: async (_args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> => {
    const state = context.getState();
    const profile = state.userProfile.profile;

    if (!profile) {
      return {
        success: false,
        data: null,
        displayType: 'error',
        message: 'User profile not found.',
      };
    }

    return {
      success: true,
      data: {
        displayName: profile.displayName,
        dietaryRestrictions: profile.dietaryRestrictions,
        customDietaryRestrictions: profile.customDietaryRestrictions,
        avoidIngredients: profile.avoidIngredients,
        cuisinePreferences: profile.cuisinePreferences,
        cookingGoal: profile.cookingGoal,
        householdSize: profile.householdSize,
        skillLevel: profile.skillLevel,
        cookTimePreference: profile.cookTimePreference,
        lovedMealDescription: profile.lovedMealDescription,
        dislikedMealDescription: profile.dislikedMealDescription,
      },
      displayType: 'text',
      message: `User profile loaded for ${profile.displayName ?? 'user'}.`,
    };
  },
};

export const profileTools: ToolDefinition[] = [
  getUserProfileTool,
];
