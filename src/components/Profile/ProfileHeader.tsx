
import React from 'react';
import { motion } from 'framer-motion';
import { User, Star, Gift, Clock, Award, ExternalLink } from 'lucide-react';
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";

interface ProfileHeaderProps {
  username: string;
  avatarUrl: string;
  level: number;
  xp: number;
  joinDate: string;
  totalWagered: number;
  onViewFullProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  avatarUrl,
  level,
  xp,
  joinDate,
  totalWagered,
  onViewFullProfile
}) => {
  const { toast } = useToast();
  
  // Calculate XP needed for next level (simple formula: 100 * current level)
  const nextLevelXp = level * 100;
  const xpProgress = (xp / nextLevelXp) * 100;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <User size={40} className="text-gray-400" />
              </div>
            )}
          </motion.div>
          
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold py-1 px-2 rounded-full">
            Lvl {level}
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-1">{username}</h2>
          
          {/* Level Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-300 mb-1">
              <Star size={16} className="text-yellow-400" />
              <span>Level {level} • {xp}/{nextLevelXp} XP</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500" 
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Joined</div>
                <div className="text-white font-medium">{formatDate(joinDate)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award size={18} className="text-green-400" />
              <div>
                <div className="text-sm text-gray-400">Total Wagered</div>
                <div className="text-white font-medium">${totalWagered.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline"
          onClick={onViewFullProfile}
          className="flex items-center gap-2"
        >
          <ExternalLink size={16} />
          View Full Profile
        </Button>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
