import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className='page flex flex-col items-center overflow-y-auto'>
      <div className='w-full max-w-4xl px-6 py-16 md:py-24 space-y-16'>
        {/* Brand Header - Top Left */}
        <header className='flex items-start justify-start'>
          <Link to='/' className='flex items-center gap-3 hover:opacity-80 transition-opacity'>
            <img src='/logo.svg' alt='Demmi logo' className='w-12 h-12 md:w-14 md:h-14' />
            <span className='text-2xl md:text-3xl font-bold text-foreground'>Demmi</span>
          </Link>
        </header>

        {/* Page Title */}
        <div className='text-center space-y-4'>
          <h1 className='text-4xl md:text-5xl font-bold'>Why Demmi Exists</h1>
          <p className='text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto'>
            Bridging the gap between AI assistance and actionable kitchen management.
          </p>
        </div>

        {/* Introduction - The Disconnection Problem */}
        <section className='space-y-4'>
          <p className='text-lg text-foreground/80 leading-relaxed'>
            I got tired of starting new threads with ChatGPT every time I needed cooking help. Each conversation existed in isolation—no memory of what ingredients I mentioned yesterday, no connection to the recipes I'd already found, no awareness of my dietary preferences or budget constraints.
          </p>
          <p className='text-lg text-foreground/80 leading-relaxed'>
            The AI was smart, but it was blind. It couldn't see my kitchen inventory. It didn't know what recipes I'd already saved. It had no idea what I'd asked about last week. Every conversation started from zero, forcing me to re-explain context that should have been obvious.
          </p>
        </section>

        {/* Section 1: The Thread Problem */}
        <section className='space-y-6'>
          <h2 className='text-3xl md:text-4xl font-bold'>The Thread Problem</h2>
          <div className='space-y-4'>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              Modern AI tools like ChatGPT operate in distinct, isolated threads. You ask about chicken recipes in one conversation. You discuss recipe prep strategies in another. You request ingredient substitutions in a third. None of these conversations talk to each other.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              But cooking isn't isolated. It's interconnected. The chicken you bought yesterday affects what you can make today. The recipe prep conversation influences your shopping list. The ingredient substitution discussion should update your saved recipes.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              Even worse, none of these AI conversations connect to actionable data. ChatGPT can suggest recipes, but it can't tell you which ones you can actually make with what's in your fridge. It can estimate nutrition, but it can't calculate exact macros based on your ingredient inventory. It can recommend meal plans, but it can't track pricing or generate shopping lists.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              The AI is helpful, but it's not useful. There's no mutual connection tying everything together.
            </p>
          </div>
        </section>

        {/* Section 2: Connected Context */}
        <section className='space-y-6'>
          <h2 className='text-3xl md:text-4xl font-bold'>Connected Context</h2>
          <div className='space-y-4'>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              Demmi solves this by giving AI access to what matters: your actual kitchen data. Not in isolated threads, but in a unified context where everything connects.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              Your ingredient inventory lives in the system. When you ask "What can I make for dinner?" the AI sees what you actually have—chicken breast, broccoli, rice, whatever's in your fridge. It suggests recipes from your saved collection that you can make right now, not theoretical recipes that require a shopping trip.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              Your recipe library is connected. When the AI recommends something, it can pull from recipes you've already created or saved. It knows which recipes you've planned for the week. It understands your cooking patterns because it has access to your calendar and recipe history.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              Pricing and nutrition aren't estimates—they're calculations. Each ingredient has real cost data and nutrient profiles. When you plan a recipe, Demmi calculates exactly how much it costs and what macros it provides. When you need to shop, it generates a list with quantities and pricing already figured out.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              Everything ties together. Your AI conversations inform your ingredient tracking. Your meal planning updates your shopping list. Your calendar drives your prep schedule. It's not just assistance—it's actionable intelligence.
            </p>
          </div>
        </section>

        {/* Section 3: Local AI, Real Privacy */}
        <section className='space-y-6'>
          <h2 className='text-3xl md:text-4xl font-bold'>Local AI, Real Privacy</h2>
          <div className='space-y-4'>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              Demmi uses Ollama—a local LLM that runs entirely on your device. No cloud API calls. No data leaving your machine. No corporate servers analyzing your eating habits.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              This matters for two reasons: privacy and control. Your meal plans, ingredient inventory, dietary preferences, and spending patterns stay on your device. Period. No company is building a profile of what you eat. No algorithm is learning from your kitchen to sell you supplements or recipe kits.
            </p>
            <p className='text-lg text-foreground/80 leading-relaxed'>
              But it's also about practical control. Local AI means instant responses without internet dependency. No usage limits. No monthly subscription fees. No service outages when the cloud provider has issues. The AI works for you because it literally runs on your hardware.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className='space-y-8'>
          <h2 className='text-3xl md:text-4xl font-bold text-center'>The Difference</h2>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse'>
              <thead>
                <tr className='border-b-2 border-foreground/20'>
                  <th className='text-left py-4 px-4 font-semibold text-foreground'></th>
                  <th className='text-center py-4 px-4 font-semibold text-foreground'>Generic AI Tools</th>
                  <th className='text-center py-4 px-4 font-bold text-accent'>Demmi</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-foreground/10'>
                  <td className='py-4 px-4 font-semibold text-foreground'>Context</td>
                  <td className='text-center py-4 px-4 text-foreground/70'>Isolated threads with no memory or connection to real data</td>
                  <td className='text-center py-4 px-4 text-foreground/70'>Unified context connected to your ingredients, recipes, and plans</td>
                </tr>
                <tr className='border-b border-foreground/10'>
                  <td className='py-4 px-4 font-semibold text-foreground'>Actionability</td>
                  <td className='text-center py-4 px-4 text-foreground/70'>Suggestions based on nothing—helpful but not useful</td>
                  <td className='text-center py-4 px-4 text-foreground/70'>Recommendations based on what you actually have and can make</td>
                </tr>
                <tr className='border-b border-foreground/10'>
                  <td className='py-4 px-4 font-semibold text-foreground'>Data Privacy</td>
                  <td className='text-center py-4 px-4 text-foreground/70'>Cloud-based processing—your kitchen data trains corporate models</td>
                  <td className='text-center py-4 px-4 text-foreground/70'>Local LLM on your device—nothing leaves your machine</td>
                </tr>
                <tr className='border-b border-foreground/10'>
                  <td className='py-4 px-4 font-semibold text-foreground'>Integration</td>
                  <td className='text-center py-4 px-4 text-foreground/70'>No connection to inventory, pricing, nutrition, or planning</td>
                  <td className='text-center py-4 px-4 text-foreground/70'>Everything connected—ingredients, recipes, calendar, shopping, nutrition</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className='text-sm text-center text-foreground/60 italic'>
            AI that knows your kitchen, not just recipes.
          </p>
        </section>

        {/* Footer CTA */}
        <section className='text-center space-y-6 pt-8 border-t border-foreground/10'>
          <p className='text-lg text-foreground/70'>
            Ready for AI that actually understands your kitchen?
          </p>
          <Button
            href='/'
            variant='secondary'
            size='lg'
          >
            ← Back to Home
          </Button>
        </section>
      </div>
    </div>
  );
}

export default About;

