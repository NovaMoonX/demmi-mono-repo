import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@moondreamsdev/dreamer-ui/components';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { APP_TITLE } from '@lib/app';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { startDemoSession } from '@store/slices/demoSlice';
import { useAuth } from '@hooks/useAuth';
import {
  TodaysMeals,
  LowStockAlert,
  QuickAskDemi,
  RecipeOfTheDay,
} from '@components/dashboard';

function MarketingHome() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleTryDemo = async () => {
    await dispatch(startDemoSession());
    navigate('/chat');
  };

  const features = [
    {
      emoji: '💬',
      title: 'AI Chat Assistant',
      description: 'Get cooking advice and recipe suggestions from your personal AI sous chef',
    },
    {
      emoji: '🍽️',
      title: 'Recipe Management',
      description: 'Create, organize, and save your favorite recipes with detailed instructions',
    },
    {
      emoji: '🍎',
      title: 'Ingredient Tracking',
      description: 'Keep track of your inventory with nutritional info and pricing',
    },
    {
      emoji: '📅',
      title: 'Meal Planning',
      description: 'Plan your meals for the week with smart calendar integration',
    },
    {
      emoji: '🛒',
      title: 'Shopping Lists',
      description: 'Auto-generate shopping lists from your meal plans and recipes',
    },
    {
      emoji: '🎭',
      title: 'Try Demo Mode',
      description: 'Explore all features with pre-loaded sample data before signing up',
    },
  ];

  return (
    <div className="page overflow-y-auto">
      <div className="min-h-full flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20">
          <div className="text-center space-y-8 max-w-4xl">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="/logo.svg"
                  alt="Demmi logo"
                  className="h-24 w-24 md:h-32 md:w-32 drop-shadow-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
              <p className="text-xl md:text-2xl text-foreground/70 max-w-2xl mx-auto">
                Your intelligent kitchen companion for recipes, meal planning, and cooking inspiration
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="min-w-50"
              >
                Get Started
              </Button>
              <Button
                onClick={handleTryDemo}
                variant="outline"
                size="lg"
                className="min-w-50"
              >
                🎭 Try Demo Mode
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Cook Smart
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Demmi combines AI-powered assistance with practical kitchen tools to make cooking easier and more enjoyable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={join(
                    'p-6 hover:shadow-lg transition-shadow cursor-default',
                    'bg-card border-border',
                  )}
                >
                  <div className="space-y-3">
                    <div className="text-4xl">{feature.emoji}</div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-foreground/70">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Kitchen?
            </h2>
            <p className="text-lg text-foreground/70">
              Join Demmi today and discover a smarter way to plan, shop, and cook
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="min-w-50"
              >
                Sign Up Free
              </Button>
              <Button
                href="/about"
                variant="outline"
                size="lg"
                className="min-w-50"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="page overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Welcome back 👋</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <TodaysMeals />
            <LowStockAlert />
          </div>
          <div className="space-y-6">
            <QuickAskDemi />
            <RecipeOfTheDay />
          </div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const isDemoActive = useAppSelector((state) => state.demo.isActive);

  const isAuthenticated = !!user || isDemoActive;

  if (!isAuthenticated) {
    return <MarketingHome />;
  }

  return <Dashboard />;
}

export default Home;
