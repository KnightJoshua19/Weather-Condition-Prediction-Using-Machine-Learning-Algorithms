import { motion } from 'motion/react';
import { theme } from '../config/theme';

export function SkeletonLoader() {
  const skeletonLines = [
    { width: '95%', delay: 0 },
    { width: '88%', delay: 0.1 },
    { width: '92%', delay: 0.2 },
    { width: '78%', delay: 0.3 },
    { width: '85%', delay: 0.4 },
    { width: '90%', delay: 0.5 },
    { width: '82%', delay: 0.6 },
    { width: '88%', delay: 0.7 },
    { width: '75%', delay: 0.8 },
    { width: '92%', delay: 0.9 },
    { width: '85%', delay: 1.0 },
    { width: '80%', delay: 1.1 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full space-y-4"
    >
      {/* AI Avatar Skeleton */}
      <div className="flex items-start gap-3">
        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: theme.colors.theme }}
        />
        
        <div className="flex-1 space-y-3">
          {skeletonLines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                x: 0,
              }}
              transition={{
                opacity: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: line.delay,
                },
                x: {
                  duration: 0.3,
                  delay: line.delay,
                },
              }}
              className="h-4 rounded"
              style={{
                width: line.width,
                backgroundColor: theme.colors.theme,
              }}
            />
          ))}
        </div>
      </div>

      {/* Additional content blocks */}
      <div className="space-y-3 pt-4">
        {[1, 2, 3].map((block) => (
          <motion.div
            key={block}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              y: 0,
            }}
            transition={{
              opacity: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: block * 0.2,
              },
              y: {
                duration: 0.3,
                delay: block * 0.2,
              },
            }}
            className="space-y-2"
          >
            <div
              className="h-4 rounded"
              style={{
                width: `${90 - block * 5}%`,
                backgroundColor: theme.colors.theme,
              }}
            />
            <div
              className="h-4 rounded"
              style={{
                width: `${85 - block * 3}%`,
                backgroundColor: theme.colors.theme,
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
