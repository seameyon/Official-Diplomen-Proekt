import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ChefHat } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-32 h-32 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <ChefHat className="w-16 h-16 text-primary-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl sm:text-8xl font-display font-bold gradient-text mb-4"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-600 dark:text-gray-400 mb-2"
        >
          Oops! This page got lost in the kitchen
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 dark:text-gray-500 mb-8"
        >
          The recipe you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/" className="btn-primary w-full sm:w-auto">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link to="/recipes" className="btn-outline w-full sm:w-auto">
            <Search className="w-4 h-4" />
            Browse Recipes
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
