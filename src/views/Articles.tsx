import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const articles = [
  { id: '1', title: 'Why Movie Title Cards Matter in Cinema' },
  { id: '2', title: 'Top 10 Best Title Cards in Movies' },
  { id: '3', title: 'Hidden Details in Famous Movie Title Cards' },
  { id: '4', title: 'How Directors Use Title Cards Creatively' },
  { id: '5', title: 'Best Malayalam Movie Title Cards' },
];

export function Articles() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      <h1 className="text-4xl font-heading font-extrabold text-foreground">Insights & Articles</h1>
      <div className="grid gap-6">
        {articles.map((article) => (
          <Link 
            key={article.id} 
            to={`/articles/${article.id}`}
            className="block p-6 bg-white rounded-2xl border-2 border-foreground shadow-pop hover:shadow-pop-hover transition-all"
          >
            <h2 className="text-2xl font-heading font-bold text-foreground">{article.title}</h2>
            <p className="text-muted-foreground mt-2">Read more...</p>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
