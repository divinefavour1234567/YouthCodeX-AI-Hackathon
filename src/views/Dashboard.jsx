import React from 'react';
import { Trophy, Target, Users, TrendingUp } from 'lucide-react';

export default function Dashboard({ setView }) {
  return (
    <div className="p-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 bg-purple-900/50 px-6 py-2 rounded-full mb-4">
          <Trophy className="text-yellow-400" />
          <span className="font-semibold">Senior Specialist • 1,100 XP</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-3">Your Career Quest Awaits</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Explore paths • Master skills • Conquer interviews • Build your future in Nigeria
        </p>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => setView("roadmap")} className="group bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all hover:shadow-2xl hover:shadow-purple-500/30">
          <Target className="w-12 h-12 mb-6 text-purple-300" />
          <h3 className="text-2xl font-bold mb-2">AI Roadmap</h3>
          <p className="text-gray-400">Personalized learning path to your dream role</p>
          <div className="mt-6 text-purple-400 group-hover:underline">Start Quest →</div>
        </div>

        <div onClick={() => setView("resume")} className="group bg-gradient-to-br from-blue-900 to-cyan-900 p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all hover:shadow-2xl hover:shadow-cyan-500/30">
          <TrendingUp className="w-12 h-12 mb-6 text-cyan-300" />
          <h3 className="text-2xl font-bold mb-2">ATS Resume Lab</h3>
          <p className="text-gray-400">Beat the machines. Get recruiter-ready</p>
          <div className="mt-6 text-cyan-400 group-hover:underline">Optimize Now →</div>
        </div>

        <div onClick={() => setView("interview")} className="group bg-gradient-to-br from-pink-900 to-rose-900 p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all hover:shadow-2xl hover:shadow-pink-500/30">
          <Users className="w-12 h-12 mb-6 text-pink-300" />
          <h3 className="text-2xl font-bold mb-2">Interview Arena</h3>
          <p className="text-gray-400">Voice AI coach + real-time feedback</p>
          <div className="mt-6 text-pink-400 group-hover:underline">Train Now →</div>
        </div>

        <div onClick={() => setView("rpg")} className="group bg-gradient-to-br from-amber-900 to-orange-900 p-8 rounded-3xl cursor-pointer hover:scale-105 transition-all hover:shadow-2xl hover:shadow-orange-500/30">
          <Trophy className="w-12 h-12 mb-6 text-amber-300" />
          <h3 className="text-2xl font-bold mb-2">RPG Simulator</h3>
          <p className="text-gray-400">Live the job before you get it</p>
          <div className="mt-6 text-amber-400 group-hover:underline">Enter Simulation →</div>
        </div>
      </div>

      <div className="text-center mt-12 text-gray-500">
        Every quest completed brings you closer to your dream career. Keep going, Pathfinder!
      </div>
    </div>
  );
}