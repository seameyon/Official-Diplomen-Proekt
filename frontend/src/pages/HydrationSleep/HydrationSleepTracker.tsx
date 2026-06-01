import { useEffect, useState } from 'react';
import { Droplets } from 'lucide-react';

const GLASS_SIZE = 250;
const DAILY_GOAL = 2000;
const TOTAL_GLASSES = DAILY_GOAL / GLASS_SIZE;

const SLEEP_GOAL = 8;

export default function HydrationTracker() {
  const today = new Date().toISOString().split('T')[0];

  const waterKey = `hydration-${today}`;
  const sleepKey = `sleep-${today}`;

  const [glasses, setGlasses] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(waterKey);
    return saved ? JSON.parse(saved) : Array(TOTAL_GLASSES).fill(false);
  });

  const [sleepHours, setSleepHours] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(sleepKey);
    return saved ? JSON.parse(saved) : Array(SLEEP_GOAL).fill(false);
  });

  useEffect(() => {
    localStorage.setItem(waterKey, JSON.stringify(glasses));
  }, [glasses, waterKey]);

  useEffect(() => {
    localStorage.setItem(sleepKey, JSON.stringify(sleepHours));
  }, [sleepHours, sleepKey]);

  const toggleGlass = (index: number) => {
    setGlasses((prev) =>
      prev.map((glass, i) => (i === index ? !glass : glass))
    );
  };

  const toggleSleepHour = (index: number) => {
    setSleepHours((prev) =>
      prev.map((hour, i) => (i === index ? !hour : hour))
    );
  };

  const resetAll = () => {
    const resetGlasses = Array(TOTAL_GLASSES).fill(false);
    const resetSleep = Array(SLEEP_GOAL).fill(false);

    setGlasses(resetGlasses);
    setSleepHours(resetSleep);

    localStorage.setItem(waterKey, JSON.stringify(resetGlasses));
    localStorage.setItem(sleepKey, JSON.stringify(resetSleep));
  };

  const completed = glasses.filter(Boolean).length;
  const currentAmount = completed * GLASS_SIZE;
  const isGoalCompleted = completed === TOTAL_GLASSES;

  const sleptHours = sleepHours.filter(Boolean).length;
  const sleepCompleted = sleptHours === SLEEP_GOAL;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto bg-cream-100 dark:bg-wood-800 rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Droplets className="w-12 h-12 mx-auto text-blue-500 mb-3" />
          <h1 className="text-3xl font-bold text-wood-900 dark:text-cream-100">
            Здравни навици
          </h1>
          <p className="text-wood-600 dark:text-cream-300 mt-2">
            Проследи дневния си прием на вода и часовете сън.
          </p>
        </div>

        <section className="mb-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-wood-900 dark:text-cream-100">
              Дневен прием на течности
            </h2>
            <p className="text-lg text-wood-700 dark:text-cream-200 mt-3">
              Цел за деня: <strong>{DAILY_GOAL} мл</strong>
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {currentAmount} / {DAILY_GOAL} мл
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {glasses.map((filled, index) => (
              <button
                key={index}
                onClick={() => toggleGlass(index)}
                className={`h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                  filled
                    ? 'bg-blue-500 border-blue-600 text-white'
                    : 'bg-white dark:bg-wood-700 border-blue-300 text-blue-500'
                }`}
              >
                <Droplets className="w-8 h-8 mb-1" />
                <span className="text-sm">{GLASS_SIZE} мл</span>
              </button>
            ))}
          </div>

          {isGoalCompleted && (
            <div className="text-center bg-green-100 text-green-700 rounded-2xl p-4 font-semibold">
              Поздравления! Изпълнихте дневната си доза вода.
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-wood-900 dark:text-cream-100">
              Сън
            </h2>
            <p className="text-lg text-wood-700 dark:text-cream-200 mt-3">
              Цел за деня: <strong>{SLEEP_GOAL} часа</strong>
            </p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {sleptHours} / {SLEEP_GOAL} часа
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {sleepHours.map((filled, index) => (
              <button
                key={index}
                onClick={() => toggleSleepHour(index)}
                className={`h-20 rounded-2xl border-2 flex items-center justify-center text-3xl transition-all ${
                  filled
                    ? 'bg-purple-500 border-purple-600 text-white'
                    : 'bg-white dark:bg-wood-700 border-purple-300 text-purple-500'
                }`}
              >
                🛏️
              </button>
            ))}
          </div>

          {sleepCompleted && (
            <div className="text-center bg-purple-100 text-purple-700 rounded-2xl p-4 font-semibold">
              Отлично! Постигнахте препоръчителния сън за деня.
            </div>
          )}
        </section>

        <div className="text-center mt-10">
          <button
            onClick={resetAll}
            className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            Нулирай дневните данни
          </button>
        </div>
      </div>
    </div>
  );
}