import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Footer Component
 * Displays Human Habitat branding and CoralShades development credit
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#333322] border-t-2 border-primary py-3">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span>PolicyAi for Human Habitat •</span>
            <span>
              Developed by{' '}
              <a
                href="https://coralshades.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-[#FF6655] hover:underline inline-flex items-center gap-1 transition-colors"
              >
                CoralShades
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>© {currentYear} Human Habitat</span>
            <span>•</span>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
