import { ChatConversation } from './chat.types';

const now = Date.now();
const oneHourAgo = now - 60 * 60 * 1000;
const oneDayAgo = now - 24 * 60 * 60 * 1000;
const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

export const mockChatConversations: ChatConversation[] = [
  {
    id: 'chat-001',
    title: 'Quick Breakfast Ideas',
    isPinned: true,
    lastUpdated: oneHourAgo,
    userId: 'demo',
    messages: [
      {
        id: 'msg-001',
        role: 'user',
        content: 'What are some quick breakfast ideas for busy mornings?',
        timestamp: oneHourAgo - 10000,
        model: null,
      },
      {
        id: 'msg-002',
        role: 'assistant',
        content: 'Here are some quick breakfast ideas perfect for busy mornings:\n\n1. **Overnight Oats** - Prepare the night before with oats, milk, and your favorite toppings\n2. **Smoothie Bowl** - Blend fruits with yogurt and top with granola\n3. **Avocado Toast** - Quick, nutritious, and customizable\n4. **Greek Yogurt Parfait** - Layer yogurt with berries and granola\n5. **Egg Muffins** - Make a batch ahead and reheat as needed\n\nAll of these can be prepared in 5-10 minutes or made ahead!',
        timestamp: oneHourAgo,
        model: null,
      },
    ],
  },
  {
    id: 'chat-002',
    title: 'Meal Prep for the Week',
    isPinned: true,
    lastUpdated: oneDayAgo,
    userId: 'demo',
    messages: [
      {
        id: 'msg-003',
        role: 'user',
        content: 'How can I meal prep for a busy work week?',
        timestamp: oneDayAgo - 15000,
        model: null,
      },
      {
        id: 'msg-004',
        role: 'assistant',
        content: 'Great question! Here\'s a simple meal prep strategy:\n\n**Sunday Prep:**\n- Cook a large batch of grains (rice, quinoa)\n- Roast vegetables (broccoli, sweet potatoes, peppers)\n- Grill or bake proteins (chicken, tofu, fish)\n- Prepare 2-3 sauces or dressings\n\n**Storage Tips:**\n- Use glass containers for better reheating\n- Store proteins separately from veggies to maintain freshness\n- Label everything with dates\n\n**Mix & Match:**\nCombine different proteins, grains, and veggies throughout the week for variety!',
        timestamp: oneDayAgo,
        model: null,
      },
      {
        id: 'msg-005',
        role: 'user',
        content: 'How long will these meals stay fresh?',
        timestamp: oneDayAgo - 5000,
        model: null,
      },
      {
        id: 'msg-006',
        role: 'assistant',
        content: 'Most meal prep foods will stay fresh for 3-4 days in the refrigerator. Here are some guidelines:\n\n- **Cooked grains**: 4-5 days\n- **Cooked chicken**: 3-4 days\n- **Roasted vegetables**: 3-4 days\n- **Raw cut vegetables**: 2-3 days\n- **Cooked fish**: 2-3 days\n\nFor longer storage, freeze portions in individual containers for up to 3 months!',
        timestamp: oneDayAgo,
        model: null,
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
      },
      {
        id: 'msg-008',
        role: 'assistant',
        content: 'Absolutely! Here are some delicious vegetarian dinner ideas:\n\n1. **Vegetable Stir-Fry** with tofu and rice\n2. **Lentil Curry** - hearty and flavorful\n3. **Stuffed Bell Peppers** with quinoa and black beans\n4. **Mushroom Risotto** - creamy and satisfying\n5. **Chickpea Tacos** with fresh toppings\n6. **Eggplant Parmesan** - classic Italian comfort food\n7. **Buddha Bowl** with roasted veggies, grains, and tahini sauce\n\nAll of these are protein-rich and incredibly satisfying!',
        timestamp: twoDaysAgo,
        model: null,
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
      },
      {
        id: 'msg-010',
        role: 'assistant',
        content: 'Welcome to the world of baking! Here are some beginner-friendly recipes to start with:\n\n**Easy Starters:**\n1. **Chocolate Chip Cookies** - Classic and forgiving\n2. **Banana Bread** - Hard to mess up and super moist\n3. **Brownies** - One-bowl wonder\n4. **Muffins** - Great for breakfast\n\n**Essential Tips:**\n- Measure ingredients accurately\n- Use room temperature eggs and butter (unless specified)\n- Don\'t overmix the batter\n- Preheat your oven fully\n- Invest in an oven thermometer\n\nStart with cookies - they\'re the most forgiving for beginners!',
        timestamp: oneWeekAgo,
        model: null,
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
    return "I'd love to help you find the perfect recipe! While I'm still learning, I can suggest checking out our Meals section where you'll find various recipes organized by category. Is there a specific type of meal you're looking for?";
  }
  
  if (userMessage.toLowerCase().includes('ingredient')) {
    return "For ingredient-related questions, I recommend checking out our Ingredients section. You can manage your ingredients there and I'll help you find recipes that match what you have available!";
  }
  
  if (userMessage.toLowerCase().includes('meal prep') || userMessage.toLowerCase().includes('planning')) {
    return "Meal planning is a great way to stay organized! I can help you plan your meals for the week. You might want to check out our Calendar feature to schedule your cooking sessions. What's your main goal with meal planning?";
  }
  
  return randomResponse + " What specific aspect would you like to know more about?";
}
