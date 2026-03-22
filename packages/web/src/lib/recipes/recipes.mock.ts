import { Recipe } from './recipes.types';

export const mockRecipes: Recipe[] = [
  {
    id: 'recipe-001',
    userId: 'demo',
    title: 'Classic Pancakes',
    // ingredients: whole milk (ing-003) x2 servings
    ingredients: [{ ingredientId: 'ing-003', servings: 2 }],
    description: 'Fluffy, golden pancakes perfect for a weekend breakfast. Light and delicious with your favorite toppings.',
    category: 'breakfast',
    prepTime: 10,
    cookTime: 15,
    servingSize: 4,
    imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
    share: null,
    instructions: [
      'Mix flour, sugar, baking powder, and salt in a large bowl',
      'In another bowl, whisk together milk, eggs, and melted butter',
      'Pour wet ingredients into dry ingredients and stir until just combined',
      'Heat a non-stick pan over medium heat',
      'Pour 1/4 cup batter for each pancake',
      'Cook until bubbles form on surface, then flip and cook until golden brown',
      'Serve hot with maple syrup and fresh berries'
    ]
  },
  {
    id: 'recipe-002',
    userId: 'demo',
    title: 'Grilled Chicken Caesar Salad',
    // ingredients: chicken breast (ing-001) x2 servings, olive oil (ing-006) x1 serving, tomatoes (ing-010) x1 serving
    ingredients: [
      { ingredientId: 'ing-001', servings: 2 },
      { ingredientId: 'ing-006', servings: 1 },
      { ingredientId: 'ing-010', servings: 1 },
    ],
    description: 'A healthy and satisfying lunch featuring grilled chicken breast, crispy romaine lettuce, and creamy Caesar dressing.',
    category: 'lunch',
    prepTime: 15,
    cookTime: 20,
    servingSize: 2,
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80',
    share: null,
    instructions: [
      'Season chicken breasts with salt, pepper, and olive oil',
      'Grill chicken over medium-high heat for 6-8 minutes per side',
      'Let chicken rest for 5 minutes, then slice',
      'Wash and chop romaine lettuce',
      'Toss lettuce with Caesar dressing',
      'Top with sliced chicken, croutons, and parmesan cheese',
      'Serve immediately'
    ]
  },
  {
    id: 'recipe-003',
    userId: 'demo',
    title: 'Spaghetti Carbonara',
    // ingredients: olive oil (ing-006) x1 serving, garlic powder (ing-007) x1 serving, cheddar cheese (ing-012) x2 servings
    ingredients: [
      { ingredientId: 'ing-006', servings: 1 },
      { ingredientId: 'ing-007', servings: 1 },
      { ingredientId: 'ing-012', servings: 2 },
    ],
    description: 'Rich and creamy Italian pasta dish made with eggs, cheese, pancetta, and black pepper. A classic comfort food.',
    category: 'dinner',
    prepTime: 10,
    cookTime: 20,
    servingSize: 4,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
    share: null,
    instructions: [
      'Cook spaghetti in salted boiling water until al dente',
      'While pasta cooks, crisp pancetta in a large pan',
      'In a bowl, whisk together eggs, parmesan, and black pepper',
      'Drain pasta, reserving 1 cup pasta water',
      'Add hot pasta to pancetta pan off heat',
      'Quickly stir in egg mixture, adding pasta water to create creamy sauce',
      'Serve immediately with extra parmesan and black pepper'
    ]
  },
  {
    id: 'recipe-004',
    userId: 'demo',
    title: 'Trail Mix Energy Balls',
    // ingredients: almonds (ing-008) x1 serving
    ingredients: [{ ingredientId: 'ing-008', servings: 1 }],
    description: 'No-bake energy bites packed with oats, nuts, and dried fruit. Perfect for a quick snack on the go.',
    category: 'snack',
    prepTime: 15,
    cookTime: 0,
    servingSize: 12,
    imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80',
    share: null,
    instructions: [
      'Combine oats, almonds, and dried cranberries in a food processor',
      'Pulse until mixture is finely chopped',
      'Add honey, peanut butter, and vanilla extract',
      'Process until mixture holds together',
      'Roll into 1-inch balls',
      'Refrigerate for at least 30 minutes before serving',
      'Store in an airtight container in the fridge for up to 2 weeks'
    ]
  },
  {
    id: 'recipe-005',
    userId: 'demo',
    title: 'Chocolate Lava Cake',
    ingredients: [],
    description: 'Decadent individual chocolate cakes with a molten center. A restaurant-quality dessert made at home.',
    category: 'dessert',
    prepTime: 15,
    cookTime: 12,
    servingSize: 4,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
    share: null,
    instructions: [
      'Preheat oven to 425°F (220°C)',
      'Butter and flour four ramekins',
      'Melt chocolate and butter together in a double boiler',
      'Whisk in sugar, eggs, and vanilla until smooth',
      'Fold in flour until just combined',
      'Divide batter among ramekins',
      'Bake for 12 minutes until edges are firm but center is soft',
      'Let cool for 1 minute, then invert onto plates',
      'Serve immediately with vanilla ice cream'
    ]
  },
  {
    id: 'recipe-006',
    userId: 'demo',
    title: 'Mango Smoothie',
    // ingredients: whole milk (ing-003) x1 serving
    ingredients: [{ ingredientId: 'ing-003', servings: 1 }],
    description: 'Refreshing tropical smoothie made with ripe mangoes, yogurt, and a hint of honey. Perfect for breakfast or a snack.',
    category: 'drink',
    prepTime: 5,
    cookTime: 0,
    servingSize: 2,
    imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80',
    share: null,
    instructions: [
      'Peel and cube fresh mango',
      'Add mango, yogurt, milk, and honey to blender',
      'Add ice cubes for a chilled smoothie',
      'Blend on high until smooth and creamy',
      'Taste and add more honey if desired',
      'Pour into glasses and serve immediately',
      'Garnish with fresh mint leaves if desired'
    ]
  },
  {
    id: 'recipe-007',
    userId: 'demo',
    title: 'Avocado Toast',
    // ingredients: olive oil (ing-006) x0.5 servings
    ingredients: [{ ingredientId: 'ing-006', servings: 0.5 }],
    description: 'Simple yet delicious breakfast featuring creamy avocado on crispy toast with a perfect soft-boiled egg.',
    category: 'breakfast',
    prepTime: 5,
    cookTime: 10,
    servingSize: 2,
    imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80',
    share: null,
    instructions: [
      'Toast bread slices until golden and crispy',
      'Mash ripe avocado with salt, pepper, and lemon juice',
      'Soft-boil eggs for 6-7 minutes',
      'Spread avocado mixture on toast',
      'Peel and halve soft-boiled eggs',
      'Place egg halves on top of avocado toast',
      'Sprinkle with red pepper flakes and fresh herbs',
      'Serve immediately'
    ]
  },
  {
    id: 'recipe-008',
    userId: 'demo',
    title: 'Beef Tacos',
    // ingredients: ground beef (ing-011) x4 servings, cheddar cheese (ing-012) x2 servings, tomatoes (ing-010) x2 servings
    ingredients: [
      { ingredientId: 'ing-011', servings: 4 },
      { ingredientId: 'ing-012', servings: 2 },
      { ingredientId: 'ing-010', servings: 2 },
    ],
    description: 'Flavorful seasoned beef in crispy taco shells with fresh toppings. A crowd-pleasing dinner option.',
    category: 'dinner',
    prepTime: 15,
    cookTime: 20,
    servingSize: 6,
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    share: null,
    instructions: [
      'Brown ground beef in a large skillet over medium-high heat',
      'Drain excess fat and add taco seasoning with water',
      'Simmer for 5 minutes until sauce thickens',
      'Warm taco shells in the oven',
      'Prepare toppings: shred lettuce, dice tomatoes, grate cheese',
      'Fill taco shells with seasoned beef',
      'Top with lettuce, tomatoes, cheese, and sour cream',
      'Serve with lime wedges'
    ]
  }
];
