import React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '../common/Card';
import { cn } from '../../lib/utils';

interface Project {
  id: string;
  name: string;
  team: string[];
  progress: number;
  date: string;
  color: string;
  stroke: string;
}

// Circular Progress Component
const CircularProgress = ({ percentage, strokeColor }: { percentage: number, strokeColor: string }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100" />
        <circle cx="24" cy="24" r={radius} stroke={strokeColor} strokeWidth="3" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700">{percentage}%</span>
    </div>
  );
};

export const OngoingProjects = ({ projects }: { projects: Project[] }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 px-1">
        <h3 className="font-bold text-slate-800 text-sm">Ongoing Project</h3>
        <ChevronRight size={16} className="text-slate-400 rotate-90" />
      </div>
      
      <div className="space-y-4">
        {projects.map(project => (
          <Card key={project.id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden relative">
            {/* Left color border accent */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", `bg-[${project.stroke}]`)} style={{ backgroundColor: project.stroke }}></div>
            
            <CardContent className="p-4 pl-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex -space-x-2">
                  {project.team.map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {initials}
                    </div>
                  ))}
                </div>
                <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-1">{project.date}</div>
                  <div className="font-bold text-slate-700 text-sm">{project.name}</div>
                </div>
                <CircularProgress percentage={project.progress} strokeColor={project.stroke} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
