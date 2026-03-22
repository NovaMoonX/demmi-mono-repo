import { ChatConversation } from './chat.types';

const now = Date.now();
const oneHourAgo = now - 60 * 60 * 1000;
const twoHoursAgo = now - 2 * 60 * 60 * 1000;
const oneDayAgo = now - 24 * 60 * 60 * 1000;
const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

export const mockChatConversations: ChatConversation[] = [
  {
    id: 'chat-005',
    title: 'Salmon Bowl Ready to Save',
    isPinned: true,
    lastUpdated: oneHourAgo - 5 * 60 * 1000,
    userId: 'demo',
    messages: [
      {
        id: 'msg-011',
        role: 'user',
        content: 'Create a lemon garlic salmon bowl recipe with rice and broccoli.',
        timestamp: oneHourAgo - 20 * 60 * 1000,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      },
      {
        id: 'msg-012',
        role: 'assistant',
        content: 'Great idea. I drafted a complete recipe for review before saving.',
        timestamp: oneHourAgo - 5 * 60 * 1000,
        model: null,
        rawContent: null,
        agentAction: {
          type: 'create_recipe',
          status: 'pending_approval',
          proposedName: 'Lemon Garlic Salmon Bowl',
          recipes: [
            {
              title: 'Lemon Garlic Salmon Bowl',
              description: 'A balanced dinner bowl with baked salmon, fluffy rice, and roasted broccoli finished with a bright lemon garlic drizzle.',
              category: 'dinner',
              prepTime: 15,
              cookTime: 20,
              servingSize: 2,
              instructions: [
                'Cook rice according to package directions and keep warm.',
                'Season salmon with salt, pepper, garlic, and lemon zest, then bake at 400F for 12 to 14 minutes.',
                'Roast broccoli with olive oil, salt, and pepper until tender and lightly charred.',
                'Whisk lemon juice, minced garlic, and olive oil to make a quick drizzle.',
                'Assemble bowls with rice, salmon, and broccoli, then finish with the lemon garlic drizzle.',
              ],
              imageUrl: '',
              ingredients: [
                {
                  name: 'Salmon Fillet',
                  type: 'seafood',
                  unit: 'piece',
                  servings: 2,
                  isNew: false,
                  existingIngredientId: 'ing-009',
                },
                {
                  name: 'Brown Rice',
                  type: 'grains',
                  unit: 'cup',
                  servings: 1,
                  isNew: false,
                  existingIngredientId: 'ing-004',
                },
                {
                  name: 'Broccoli',
                  type: 'produce',
                  unit: 'cup',
                  servings: 2,
                  isNew: false,
                  existingIngredientId: 'ing-002',
                },
                {
                  name: 'Lemon',
                  type: 'produce',
                  unit: 'piece',
                  servings: 1,
                  isNew: true,
                  existingIngredientId: null,
                },
              ],
            },
          ],
          recipe: null,
          completedSteps: [
            'name',
            'info',
            'description',
            'ingredients',
            'instructions',
          ],
          updatingFields: null,
          shoppingListDecision: null,
          shoppingListItemsAdded: null,
        },
        summary: 'User asked for a lemon garlic salmon bowl recipe. Assistant generated a full create-recipe proposal and is waiting for approval before saving it to recipes.',
        iterationInvalid: null,
      },
    ],
  },
  {
    id: 'chat-000',
    title: 'Creamy Tomato Pasta Request',
    isPinned: true,
    lastUpdated: twoHoursAgo,
    userId: 'demo',
    messages: [
      {
        id: 'msg-000',
        role: 'user',
        content: 'Can you create a creamy tomato pasta recipe for dinner tonight?',
        timestamp: twoHoursAgo - 15000,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      },
      {
        id: 'msg-000a',
        role: 'assistant',
        content: 'I can help with that. Before I generate the full recipe, I want to confirm your request.',
        timestamp: twoHoursAgo,
        model: null,
        rawContent: null,
        agentAction: {
          type: 'create_recipe',
          status: 'pending_confirmation',
          proposedName: 'Creamy Tomato Pasta',
          recipes: [
            {
              title: 'Creamy Tomato Pasta',
              description: '',
              category: 'dinner',
              prepTime: 0,
              cookTime: 0,
              servingSize: 2,
              instructions: [],
              imageUrl: '',
              ingredients: [],
            },
          ],
          recipe: null,
          completedSteps: null,
          updatingFields: null,
          shoppingListDecision: null,
          shoppingListItemsAdded: null,
        },
        summary: 'User asked the assistant to create a creamy tomato pasta recipe for dinner. Assistant detected a create-recipe intent and is waiting for user confirmation before generating the recipe.',
        iterationInvalid: null,
      },
    ],
  },
  {
    id: 'chat-001',
    title: 'Quick Breakfast Ideas',
    isPinned: false,
    lastUpdated: oneHourAgo,
    userId: 'demo',
    messages: [
      {
        id: 'msg-001',
        role: 'user',
        content: 'What are some quick breakfast ideas for busy mornings?',
        timestamp: oneHourAgo - 10000,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      },
      {
        id: 'msg-002',
        role: 'assistant',
        content: 'Here are some quick breakfast ideas perfect for busy mornings:\n\n1. **Overnight Oats** - Prepare the night before with oats, milk, and your favorite toppings\n2. **Smoothie Bowl** - Blend fruits with yogurt and top with granola\n3. **Avocado Toast** - Quick, nutritious, and customizable\n4. **Greek Yogurt Parfait** - Layer yogurt with berries and granola\n5. **Egg Muffins** - Make a batch ahead and reheat as needed\n\nAll of these can be prepared in 5-10 minutes or made ahead!',
        timestamp: oneHourAgo,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: 'User requested quick breakfast ideas for busy mornings. Assistant provided five practical options including overnight oats, smoothie bowls, avocado toast, yogurt parfaits, and egg muffins, all requiring 5-10 minutes or can be prepared ahead.',
        iterationInvalid: null,
      },
    ],
  },
  {
    id: 'chat-002',
    title: 'Recipe Prep for the Week',
    isPinned: true,
    lastUpdated: oneDayAgo,
    userId: 'demo',
    messages: [
      {
        id: 'msg-003',
        role: 'user',
        content: 'How can I recipe prep for a busy work week?',
        timestamp: oneDayAgo - 15000,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      },
      {
        id: 'msg-004',
        role: 'assistant',
        content: 'Great question! Here\'s a simple recipe prep strategy:\n\n**Sunday Prep:**\n- Cook a large batch of grains (rice, quinoa)\n- Roast vegetables (broccoli, sweet potatoes, peppers)\n- Grill or bake proteins (chicken, tofu, fish)\n- Prepare 2-4 sauces or dressings\n\n**Storage Tips:**\n- Use glass containers for better reheating\n- Store proteins separately from veggies to maintain freshness\n- Label everything with dates\n\n**Mix & Match:**\nCombine different proteins, grains, and veggies throughout the week for variety!',
        timestamp: oneDayAgo,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: 'User asked about recipe prep strategies for a busy work week. Assistant provided a comprehensive Sunday prep plan including batch cooking grains, roasting vegetables, preparing proteins, and storage tips using glass containers with proper labeling.',
        iterationInvalid: null,
      },
      {
        id: 'msg-005',
        role: 'user',
        content: 'How long will these recipes stay fresh?',
        timestamp: oneDayAgo - 5000,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      },
      {
        id: 'msg-006',
        role: 'assistant',
        content: 'Most recipe prep foods will stay fresh for 3-4 days in the refrigerator. Here are some guidelines:\n\n- **Cooked grains**: 4-5 days\n- **Cooked chicken**: 3-4 days\n- **Roasted vegetables**: 3-4 days\n- **Raw cut vegetables**: 2-4 days\n- **Cooked fish**: 2-4 days\n\nFor longer storage, freeze portions in individual containers for up to 3 months!',
        timestamp: oneDayAgo,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: 'User inquired about recipe prep food freshness duration. Assistant provided specific storage timelines for different food types (3-5 days refrigerated depending on item) and suggested freezing portions for up to 3 months for longer storage.',
        iterationInvalid: null,
      },
    ],
  },
  {
    id: 'chat-003',
    title: 'Vegetarian Dinner Options',
    isPinned: false,
    lastUpdated: twoDaysAgo,
    userId: 'demo',
    messages: [
      {
        id: 'msg-007',
        role: 'user',
        content: 'I want to try more vegetarian dinners. Any suggestions?',
        timestamp: twoDaysAgo - 8000,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      },
      {
        id: 'msg-008',
        role: 'assistant',
        content: 'Absolutely! Here are some delicious vegetarian dinner ideas:\n\n1. **Vegetable Stir-Fry** with tofu and rice\n2. **Lentil Curry** - hearty and flavorful\n3. **Stuffed Bell Peppers** with quinoa and black beans\n4. **Mushroom Risotto** - creamy and satisfying\n5. **Chickpea Tacos** with fresh toppings\n6. **Eggplant Parmesan** - classic Italian comfort food\n7. **Buddha Bowl** with roasted veggies, grains, and tahini sauce\n\nAll of these are protein-rich and incredibly satisfying!',
        timestamp: twoDaysAgo,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: 'User expressed interest in trying more vegetarian dinners. Assistant suggested seven protein-rich vegetarian options including stir-fry, lentil curry, stuffed peppers, risotto, tacos, eggplant parmesan, and buddha bowls.',
        iterationInvalid: null,
      },
    ],
  },
  {
    id: 'chat-004',
    title: 'Baking Tips for Beginners',
    isPinned: false,
    lastUpdated: oneWeekAgo,
    userId: 'demo',
    messages: [
      {
        id: 'msg-009',
        role: 'user',
        content: 'I\'m new to baking. What should I start with?',
        timestamp: oneWeekAgo - 12000,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: null,
        iterationInvalid: null,
      },
      {
        id: 'msg-010',
        role: 'assistant',
        content: 'Welcome to the world of baking! Here are some beginner-friendly recipes to start with:\n\n**Easy Starters:**\n1. **Chocolate Chip Cookies** - Classic and forgiving\n2. **Banana Bread** - Hard to mess up and super moist\n3. **Brownies** - One-bowl wonder\n4. **Muffins** - Great for breakfast\n\n**Essential Tips:**\n- Measure ingredients accurately\n- Use room temperature eggs and butter (unless specified)\n- Don\'t overmix the batter\n- Preheat your oven fully\n- Invest in an oven thermometer\n\nStart with cookies - they\'re the most forgiving for beginners!',
        timestamp: oneWeekAgo,
        model: null,
        rawContent: null,
        agentAction: null,
        summary: 'New baker asked what to start with. Assistant recommended beginner-friendly recipes like chocolate chip cookies, banana bread, brownies, and muffins, along with essential baking tips about measuring, temperature, mixing, and oven preparation.',
        iterationInvalid: null,
      },
    ],
  },
];

export const mockAIResponses = [
  "That's a great question! Let me help you with that.",
  "I'd be happy to provide some suggestions based on your needs.",
  "Here are some ideas that might work well for you.",
  "Let me share some tips that could be useful.",
  "That sounds like an interesting challenge! Here's what I recommend.",
];

export function generateMockResponse(userMessage: string): string {
  const responses = mockAIResponses;
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Add some context-aware mock responses
  if (userMessage.toLowerCase().includes('recipe')) {
    return "I'd love to help you find the perfect recipe! While I'm still learning, I can suggest checking out our Recipes section where you'll find various recipes organized by category. Is there a specific type of recipe you're looking for?";
  }
  
  if (userMessage.toLowerCase().includes('ingredient')) {
    return "For ingredient-related questions, I recommend checking out our Ingredients section. You can manage your ingredients there and I'll help you find recipes that match what you have available!";
  }
  
  if (userMessage.toLowerCase().includes('recipe prep') || userMessage.toLowerCase().includes('planning')) {
    return "Recipe planning is a great way to stay organized! I can help you plan your recipes for the week. You might want to check out our Calendar feature to schedule your cooking sessions. What's your main goal with recipe planning?";
  }
  
  return randomResponse + " What specific aspect would you like to know more about?";
}
