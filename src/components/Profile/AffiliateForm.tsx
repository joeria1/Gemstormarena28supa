
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { Users, RefreshCw } from 'lucide-react';

interface AffiliateFormProps {
  referralCode?: string;
}

const AffiliateForm: React.FC<AffiliateFormProps> = ({ referralCode: existingCode }) => {
  const { toast } = useToast();
  const [code, setCode] = useState<string>("");
  const [validCodes] = useState<string[]>(["DUMP50", "CRYPTO", "WELCOME", "BONUS100"]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(!!existingCode);
  const [userCode] = useState<string>(existingCode || "");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (validCodes.includes(code.toUpperCase())) {
        toast({
          title: "Success!",
          description: `Affiliate code "${code.toUpperCase()}" has been applied to your account.`,
        });
        setHasSubmitted(true);
      } else {
        toast({
          title: "Invalid Code",
          description: "The affiliate code you entered is invalid or has expired.",
          variant: "destructive"
        });
      }
      setIsSubmitting(false);
    }, 1000);
  };
  
  const handleReset = () => {
    setHasSubmitted(false);
    setCode("");
  };
  
  return (
    <Card className="p-6 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <Users size={20} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Affiliate Program</h3>
      </div>
      
      {hasSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4"
        >
          <div className="text-lg font-bold text-white mb-2">Your Affiliate Code</div>
          <div className="bg-gray-700 p-3 rounded-lg text-xl font-bold text-green-400 mb-4">
            {userCode || code.toUpperCase()}
          </div>
          <p className="text-gray-300 mb-4">
            You're now part of our affiliate program! You'll earn rewards when friends use your code.
          </p>
          <Button 
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Change Code
          </Button>
        </motion.div>
      ) : (
        <>
          <p className="text-gray-300 mb-4">
            Enter an affiliate code to receive bonuses and rewards. Join our affiliate program to earn when your friends play.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter affiliate code"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            
            <Button 
              type="submit"
              disabled={isSubmitting || !code}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isSubmitting ? "Submitting..." : "Apply Code"}
            </Button>
          </form>
        </>
      )}
    </Card>
  );
};

export default AffiliateForm;
