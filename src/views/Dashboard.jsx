import React from 'react';
import { Trophy, Target, Users, TrendingUp, Award, Zap } from 'lucide-react';

export default function Dashboard({ setView }) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Hero Welcome */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-900/60 px-5 py-1.5 rounded-full mb-4 border border-purple-500/30">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-sm tracking-wider">SENIOR SPECIALIST • 1,100 XP</span>
        </div>
        
        <h1 className="text-6xl font-bold tracking-tighter mb-3">Your Career Quest Awaits</h1>
        <p className="text-2xl text-gray-400">Master skills. Conquer interviews. Build your future in Nigeria.</p>
      </div>

      {/* Quick Action Cards - Different from AI Career Coach */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div 
          onClick={() => setView("roadmap")} 
          className="group bg-zinc-900 hover:bg-zinc-800 border border-purple-500/20 hover:border-purple-500/40 p-8 rounded-3xl cursor-pointer transition-all active:scale-[0.985]"
        >
          <Target className="w-10 h-10 mb-6 text-purple-400" />
          <h3 className="text-2xl font-semibold mb-2">AI Career Roadmap</h3>
          <p className="text-gray-400">Generate personalized learning paths tailored to Nigerian opportunities</p>
          <div className="mt-8 text-purple-400 group-hover:underline flex items-center gap-2">
            Start Quest <Zap className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => setView("resume")} 
          className="group bg-zinc-900 hover:bg-zinc-800 border border-blue-500/20 hover:border-blue-500/40 p-8 rounded-3xl cursor-pointer transition-all active:scale-[0.985]"
        >
          <TrendingUp className="w-10 h-10 mb-6 text-blue-400" />
          <h3 className="text-2xl font-semibold mb-2">ATS Resume Lab</h3>
          <p className="text-gray-400">Optimize your resume to beat Applicant Tracking Systems</p>
          <div className="mt-8 text-blue-400 group-hover:underline flex items-center gap-2">
            Optimize Now <Zap className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => setView("interview")} 
          className="group bg-zinc-900 hover:bg-zinc-800 border border-pink-500/20 hover:border-pink-500/40 p-8 rounded-3xl cursor-pointer transition-all active:scale-[0.985]"
        >
          <Users className="w-10 h-10 mb-6 text-pink-400" />
          <h3 className="text-2xl font-semibold mb-2">Interview Arena</h3>
          <p className="text-gray-400">Practice with AI voice coach + real-time scoring</p>
          <div className="mt-8 text-pink-400 group-hover:underline flex items-center gap-2">
            Train Now <Zap className="w-4 h-4" />
          </div>
        </div>

        <div 
          onClick={() => setView("rpg")} 
          className="group bg-zinc-900 hover:bg-zinc-800 border border-amber-500/20 hover:border-amber-500/40 p-8 rounded-3xl cursor-pointer transition-all active:scale-[0.985]"
        >
          <Award className="w-10 h-10 mb-6 text-amber-400" />
          <h3 className="text-2xl font-semibold mb-2">Day-in-the-Life RPG</h3>
          <p className="text-gray-400">Experience real workplace scenarios before you get the job</p>
          <div className="mt-8 text-amber-400 group-hover:underline flex items-center gap-2">
            Enter Simulation <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Progress & Motivation Section */}
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold">Your Progress</h3>
            <p className="text-gray-400">Keep completing quests to unlock new ranks and features</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">1,100 <span className="text-lg text-gray-400">/ 3000 XP</span></div>
            <div className="text-sm text-gray-400">Next rank: Career Navigator</div>
          </div>
        </div>

        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-3 bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 w-[37%]" />
        </div>
      </div>

      <p className="text-center text-gray-500 mt-10 text-sm">
        Every quest completed brings you closer to your dream career. Keep going, Pathfinder!
      </p>
    </div>
  );
}