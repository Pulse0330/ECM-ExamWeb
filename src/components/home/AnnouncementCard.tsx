// components/AnnouncementCard.tsx
import React from "react";
import { DashboardCard } from "@/components/home/Dashboard";
import { ExternalLink } from "lucide-react";

interface AnnouncementCardProps {
  title: string;
  description: string;
  image: string;
  url: string;
}

export const AnnouncementCard = ({
  title,
  description,
  image,
  url,
}: AnnouncementCardProps) => (
  <DashboardCard className="border-l-4 border-indigo-500 hover:translate-y-0 hover:shadow-xl">
    <div className="flex p-4 rounded-2xl transition-all cursor-pointer items-start group bg-indigo-50/70 backdrop-blur-sm dark:bg-gray-800/80 border border-indigo-100 dark:border-gray-700 hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/50">
      <div className="w-24 h-24 flex-shrink-0 mr-4 overflow-hidden rounded-xl border-4 border-indigo-200 dark:border-indigo-700/50 shadow-md">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-col justify-between h-full">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm line-clamp-2 mt-1 text-gray-600 dark:text-gray-400">
          {description.split("#")[0].trim()}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center mt-2 font-bold"
        >
          Дэлгэрэнгүй харах <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  </DashboardCard>
);
