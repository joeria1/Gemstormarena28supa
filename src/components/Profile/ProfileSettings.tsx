
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";

interface ProfileSettingsProps {
  onClose?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const { user, updateUser } = useUser();
  const [affiliateCode, setAffiliateCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const handleAffiliateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!affiliateCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an affiliate code",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      // For demonstration, let's assume only "BONUS100" is valid
      if (affiliateCode === "BONUS100") {
        updateUser({
          ...user,
          balance: user.balance + 100
        });
        
        toast({
          title: "Success!",
          description: "Affiliate code redeemed successfully! $100 added to your balance.",
          variant: "default",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "The affiliate code you entered does not exist or has expired",
          variant: "destructive",
        });
      }
      
      setIsProcessing(false);
      setAffiliateCode('');
    }, 1500);
  };

  return (
    <Card className="bg-gray-900 border-none shadow-lg text-white">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Affiliate Code</h3>
          <form onSubmit={handleAffiliateSubmit} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter affiliate code"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Processing..." : "Apply"}
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-2">Enter a valid affiliate code to receive bonus credits (Try "BONUS100" for demo)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
