import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import { SkeletonLoader } from './skeleton-loader';
import { theme } from '../config/theme';
import { useState, useEffect } from 'react';

interface OutputViewProps {
  prompt: string;
  isAuthenticated: boolean;
  onSignIn: () => void;
  onLogin: () => void;
  /** Font size in px for AI output text (controlled by Settings) */
  outputFontSize?: number;
}

export function OutputView({
  prompt,
  isAuthenticated,
  onSignIn,
  onLogin,
  outputFontSize = 15,
}: OutputViewProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, theme.animation.skeletonDuration * 1000);
    return () => clearTimeout(timer);
  }, [prompt]);

  const mockOutput = `Based on your query about "${prompt}", here are comprehensive policy recommendations for non-biodegradable waste management:

1. Regulatory Framework Enhancement
   - Implement stricter regulations on single-use plastics
   - Establish mandatory Extended Producer Responsibility (EPR) programs
   - Create standardized waste classification systems aligned with international standards
   - Introduce mandatory labeling for non-biodegradable products

2. Infrastructure Development
   - Invest in modern waste processing facilities with advanced sorting technology
   - Deploy smart waste bins with IoT sensors for efficient real-time collection data
   - Establish dedicated recycling centers in urban and peri-urban areas
   - Develop materials recovery facilities (MRFs) at the barangay level

3. Public Awareness Campaigns
   - Launch educational programs in schools, communities, and local government units
   - Utilize digital platforms and social media for waste management awareness drives
   - Implement reward and recognition systems for proper waste segregation practices
   - Partner with NGOs and civil society for grassroots campaigns

4. Economic Incentives
   - Provide tax benefits and rebates for eco-friendly packaging alternatives
   - Introduce deposit-refund schemes for recyclable materials and containers
   - Support green startups and SMEs in the waste management and upcycling sector
   - Establish green public procurement policies favoring sustainable products

5. Monitoring and Compliance
   - Deploy AI-powered tracking and verification systems for waste diversion
   - Conduct regular third-party environmental impact assessments
   - Establish transparent public reporting mechanisms and open data dashboards
   - Impose proportional sanctions for non-compliance with progressive penalties

6. Inter-Agency Coordination
   - Strengthen DENR-LGU partnerships for unified enforcement
   - Align national policies with ASEAN and UN sustainable development frameworks
   - Create a dedicated inter-agency task force on non-biodegradable waste
   - Establish a centralized national waste registry and monitoring platform`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto px-4 md:px-0"
    >
      {/* Output Container */}
      <div
        className="rounded-xl shadow-lg relative"
        style={{ backgroundColor: theme.colors.outputBackground }}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <SkeletonLoader />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Scrollable content — blurred if not authenticated */}
              <div
                className={isAuthenticated ? '' : 'blur-sm select-none pointer-events-none'}
                style={{ color: theme.colors.outputText }}
              >
                {/* Scrollable output area */}
                <div
                  className="p-6 overflow-y-auto"
                  style={{
                    maxHeight: '480px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.colors.theme} transparent`,
                  }}
                >
                  <p
                    className="whitespace-pre-wrap"
                    style={{
                      fontSize: `${outputFontSize}px`,
                      lineHeight: 1.75,
                      transition: 'font-size 0.2s ease',
                    }}
                  >
                    {mockOutput}
                  </p>
                </div>

                {/* Bottom fade gradient to hint at scrollability */}
                {isAuthenticated && (
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-xl"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${theme.colors.outputBackground})`,
                    }}
                  />
                )}
              </div>

              {/* Sign In/Login Overlay */}
              {!isAuthenticated && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${theme.colors.dominant}BF` }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-center p-8 rounded-xl max-w-md mx-4"
                    style={{ backgroundColor: theme.colors.theme }}
                  >
                    <div className="mb-6 flex justify-center">
                      <div className="p-4 rounded-full" style={{ backgroundColor: theme.colors.accent }}>
                        <Lock className="size-12" style={{ color: theme.colors.outputText }} />
                      </div>
                    </div>

                    <h3
                      className="text-2xl sm:text-3xl mb-3"
                      style={{ fontFamily: theme.fonts.heading, color: theme.colors.outputText }}
                    >
                      Sign In to View Results
                    </h3>

                    <p className="mb-6 text-sm sm:text-base" style={{ color: theme.colors.outputText }}>
                      Create an account or log in to access AI-generated policy recommendations
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={onSignIn}
                        className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
                        style={{ backgroundColor: theme.colors.accent, color: theme.colors.outputText }}
                      >
                        <UserPlus className="size-5" />
                        <span>Sign In</span>
                      </button>
                      <button
                        onClick={onLogin}
                        className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
                        style={{ backgroundColor: theme.colors.dominant, color: theme.colors.font }}
                      >
                        <LogIn className="size-5" />
                        <span>Login</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}