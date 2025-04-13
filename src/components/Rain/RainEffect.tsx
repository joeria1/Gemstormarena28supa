
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

interface RainDropProps {
  style: React.CSSProperties;
}

const RainDrop: React.FC<RainDropProps> = ({ style }) => {
  return <div className="absolute text-yellow-400 animate-fall" style={style}>💰</div>;
};

const RainEffect: React.FC = () => {
  const { updateBalance } = useUser();
  const [isRaining, setIsRaining] = useState(false);
  const [raindrops, setRaindrops] = useState<React.CSSProperties[]>([]);
  const [canClaim, setCanClaim] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [pendingReward, setPendingReward] = useState(0);

  // Start rain randomly
  useEffect(() => {
    const checkForRain = () => {
      // 10% chance of rain every 2 minutes
      if (Math.random() < 0.1) {
        startRain();
      }
    };
    
    const interval = setInterval(checkForRain, 120000); // Check every 2 minutes
    
    // Trigger rain for testing purposes
    const testTimer = setTimeout(() => {
      startRain();
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(testTimer);
    };
  }, []);

  const startRain = () => {
    if (!isRaining) {
      setIsRaining(true);
      setCanClaim(true);
      setHasClaimed(false);
      setPendingReward(0);
      
      // Create raindrops
      const drops: React.CSSProperties[] = [];
      for (let i = 0; i < 30; i++) {
        drops.push({
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 2 + 2}s`,
          animationDelay: `${Math.random() * 3}s`,
          fontSize: `${Math.random() * 16 + 16}px`,
        });
      }
      
      setRaindrops(drops);
      
      // End rain after 20 seconds
      setTimeout(() => {
        setIsRaining(false);
        setRaindrops([]);
        
        // If user has claimed, give the reward now that the rain is over
        if (hasClaimed && pendingReward > 0) {
          updateBalance(pendingReward);
          toast.success(`Received ${pendingReward} gems from the rain!`);
          setPendingReward(0);
        }
        
        // Cancel claim if not claimed after 60 seconds
        setTimeout(() => {
          if (canClaim) {
            setCanClaim(false);
          }
        }, 60000);
      }, 20000);
    }
  };

  const claimRain = () => {
    if (canClaim && !hasClaimed) {
      // Generate random amount between 50-500 gems
      const amount = Math.floor(Math.random() * 450) + 50;
      
      // Store the pending reward (will be given after rain ends)
      setPendingReward(amount);
      setHasClaimed(true);
      
      toast.success(`Claimed ${amount} gems from the rain!`, {
        description: "Gems will be added to your balance when the rain ends."
      });
    }
  };

  return (
    <>
      {isRaining && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {raindrops.map((style, index) => (
            <RainDrop key={index} style={style} />
          ))}
        </div>
      )}
      
      {canClaim && !hasClaimed && (
        <button
          onClick={claimRain}
          className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-4 py-2 rounded-md z-50 animate-pulse hover:animate-none hover:from-yellow-500 hover:to-yellow-700 transition-all"
        >
          CLAIM RAIN!
        </button>
      )}
      
      {hasClaimed && isRaining && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-green-400 to-green-600 text-black font-bold px-4 py-2 rounded-md z-50">
          CLAIMED! ({pendingReward} gems)
        </div>
      )}
    </>
  );
};

export default RainEffect;
