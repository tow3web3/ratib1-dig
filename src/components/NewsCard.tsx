import React from 'react';
import { ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <article className="border-b border-neon-green py-6">
      <div className="grid grid-cols-3 gap-6">
        {article.urlToImage && (
          <div className="col-span-1">
            <img 
              src={article.urlToImage} 
              alt={article.title}
              className="w-full h-48 object-cover grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        )}
        <div className={article.urlToImage ? 'col-span-2' : 'col-span-3'}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-mono text-neon-green">{article.title}</h3>
            <span className="text-sm text-neon-blue font-mono">
              {format(new Date(article.publishedAt), 'MMMM dd, yyyy', { locale: enUS })}
            </span>
          </div>
          <p className="text-neon-green opacity-80 mb-4 font-mono">{article.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm font-mono text-neon-blue">{article.source.name}</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-button px-4 py-2 text-sm flex items-center gap-2"
            >
              LAUNCH.exe
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};