
import React from 'react';
import { Link } from 'react-router-dom';
import { RocketLogo } from './RocketLogo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/50 backdrop-blur-md py-8 mt-16">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <RocketLogo className="h-6 w-auto mr-2" />
              <span className="font-bold text-xl">
                <span className="text-white">DUMP</span>
                <span className="text-primary">.FUN</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Exciting case battles, mines games, and more to test your luck and strategy.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Games</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/cases" className="text-sm text-muted-foreground hover:text-white">Case Battles</Link>
              </li>
              <li>
                <Link to="/mines" className="text-sm text-muted-foreground hover:text-white">Mines</Link>
              </li>
              <li>
                <Link to="/rainbot" className="text-sm text-muted-foreground hover:text-white">Rain Bot</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Information</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/affiliates" className="text-sm text-muted-foreground hover:text-white">Affiliates</Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-white">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-white">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-white">FAQ</Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-muted-foreground hover:text-white">Contact Support</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 mt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DUMP.FUN. All rights reserved.</p>
          <p className="mt-2">Please gamble responsibly. Players must be 18 years or older.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
