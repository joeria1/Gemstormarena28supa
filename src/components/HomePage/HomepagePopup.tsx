
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Gift, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface HomepagePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HomepagePopup: React.FC<HomepagePopupProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimationComplete(false);
    }
  }, [isOpen]);

  const handleClaimRewards = () => {
    toast({
      title: "Daily Reward Available!",
      description: "Don't forget to claim your daily free case!"
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-[90%] max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 shadow-2xl border border-purple-500/50"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ 
              scale: 1, 
              y: 0, 
              opacity: 1,
              boxShadow: animationComplete ? [
                "0 0 0 rgba(139, 92, 246, 0)",
                "0 0 20px rgba(139, 92, 246, 0.3)",
                "0 0 10px rgba(139, 92, 246, 0.2)",
                "0 0 20px rgba(139, 92, 246, 0.3)",
                "0 0 0 rgba(139, 92, 246, 0)"
              ] : "0 0 0 rgba(139, 92, 246, 0)"
            }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-transparent"
              onClick={onClose}
            >
              <X size={20} />
            </Button>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-16 h-16 bg-purple-600/20 rounded-full mx-auto mb-4 flex items-center justify-center"
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Gift size={32} className="text-purple-400" />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Welcome Back!</h3>
              <p className="mb-6 text-gray-300">We've missed you! Check out our latest games and rewards.</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-800/60 border border-gray-700/50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <Gift size={20} className="text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-white">Daily Free Case</div>
                      <div className="text-xs text-gray-400">Claim now!</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-500">Available</div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 rounded-lg"
                  onClick={handleClaimRewards}
                >
                  Claim Rewards
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HomepagePopup;
