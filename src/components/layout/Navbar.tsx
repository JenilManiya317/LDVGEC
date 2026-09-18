import React, { useState } from 'react';
import { Sprout, Menu, X, Sparkles } from 'lucide-react';
import { useRouter } from '../../lib/router';
import { GlassButton } from '../common/GlassButton';

export const Navbar: React.FC = () => {
  const { navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-8 py-3.5 transition-all duration-300">
      <div className="max-w-7xl mx-auto glass-surface-elevated rounded-2xl px-6 py-3.5 flex items-center justify-between transition-all duration-300 border border-white/20">
        {/* Left: Brand Identity */}
        <div
          id="agrisetu-logo-btn"
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300 border border-white/30">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              AGRI<span className="text-white">SETU</span>
            </span>
            <span className="block text-[10px] font-bold tracking-widest uppercase text-white/70 -mt-0.5">
              Smart AgriTech Platform
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-white/90">
          <button
            onClick={() => navigate('/')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Impact
          </button>
        </nav>

        {/* Right: Focused Single Action Flow */}
        <div className="hidden md:flex items-center gap-3">
          <GlassButton
            id="nav-access-portal-btn"
            variant="primary"
            size="sm"
            onClick={() => navigate('/choose-user')}
            icon={<Sparkles className="w-3.5 h-3.5 text-white" />}
          >
            Get Started
          </GlassButton>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl glass-btn-secondary text-white cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 glass-surface-elevated rounded-2xl p-5 border border-white/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3 font-bold text-white text-sm">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left py-2 hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-left py-2 hover:text-white transition-colors"
            >
              Impact
            </button>

            <div className="pt-3 border-t border-white/15">
              <GlassButton
                id="mobile-access-portal-btn"
                variant="primary"
                className="w-full"
                onClick={() => {
                  navigate('/choose-user');
                  setMobileMenuOpen(false);
                }}
              >
                Access Platform
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
