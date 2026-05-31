import { useEffect, useState } from 'react';
import { Droplets } from 'lucide-react';

const GLASS_SIZE = 250;
const DAILY_GOAL = 2000;
const TOTAL_GLASSES = DAILY_GOAL / GLASS_SIZE;

export default function HydrationTracker() {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `hydration-${today}`;

  const [glasses, setGlasses] = useState<boolean[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : Array(TOTAL_GLASSES).fill(false);
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(glasses));
  }, [glasses, storageKey]);

  const toggleGlass = (index: number) => {
    setGlasses((prev) =>
      prev.map((glass, i) => (i === index ? !glass : glass))
    );
  };

  const completed = glasses.filter(Boolean).length;
  const currentAmount = completed * GLASS_SIZE;
  const isGoalCompleted = completed === TOTAL_GLASSES;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto bg-cream-100 dark:bg-wood-800 rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Droplets className="w-12 h-12 mx-auto text-blue-500 mb-3" />
          <h1 className="text-3xl font-bold text-wood-900 dark:text-cream-100">
            Дневен прием на вода
          </h1>
          <p className="text-wood-600 dark:text-cream-300 mt-2">
            Проследи колко вода си изпил днес.
          </p>
        </div>

        <div className="text-center mb-8">
          <p className="text-lg text-wood-700 dark:text-cream-200">
            Цел за днес: <strong>{DAILY_GOAL} мл</strong>
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {currentAmount} / {DAILY_GOAL} мл
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
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
      </div>
    </div>
  );
}