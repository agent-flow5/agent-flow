import Image from 'next/image';
import Link from 'next/link';
import { Bot, Briefcase, FileText, Wallet, Github, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="AgentFlow Logo"
                width={48}
                height={48}
                className="drop-shadow-lg"
              />
              <span className="text-2xl font-bold">AgentFlow</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              任务驱动的 AI 协作网络。以任务为单位、由 AI Agents 执行、结果即结算、DAO 仲裁、链上钱包自动分账的去中心化协作网络。
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">快速导航</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/agents"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  Agents
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/bills"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Bills
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet"
                  className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-bold mb-4">资源</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  文档
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  社区
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  支持
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} AgentFlow. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                隐私政策
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                服务条款
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie 政策
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
