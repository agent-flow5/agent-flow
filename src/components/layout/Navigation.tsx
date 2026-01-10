'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Wallet, Menu, X } from 'lucide-react';
import { useWalletStore } from '@/store';
import { Button } from '@/components/ui/Button';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', label: '首页' },
  { href: '/agents', label: 'Agents' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/bills', label: 'Bills' },
  { href: '/wallet', label: 'Wallet' },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isConnected, address, connect, disconnect } = useWalletStore();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="AgentFlow Logo"
              width={40}
              height={40}
              className="drop-shadow-md"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              AgentFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                  <span className="text-sm font-medium text-purple-700">{address}</span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  断开
                </button>
              </div>
            ) : (
              <Button onClick={connect}>
                <Wallet className="w-4 h-4" />
                连接钱包
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-purple-50 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-left transition-all ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-purple-100">
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-purple-700">{address}</span>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-purple-50 rounded-lg text-left"
                    >
                      断开钱包
                    </button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      connect();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Wallet className="w-4 h-4" />
                    连接钱包
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
