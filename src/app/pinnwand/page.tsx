'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser, getUserData } from '@/lib/auth';
import { createComment, getAllComments, deleteComment } from '@/lib/firestore';
import { User, Comment } from '@/types';
import { GROUPS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { MessageSquare, Trash2, Send } from 'lucide-react';

export default function PinnwandPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const [userData, commentsData] = await Promise.all([
        getUserData(currentUser.uid),
        getAllComments()
      ]);

      if (userData) setUser(userData);
      setComments(commentsData);
      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await createComment({
        userId: user.userId,
        username: user.username,
        group: user.group,
        text: newComment.trim(),
        timestamp: new Date().toISOString()
      });

      // Reload comments
      const updatedComments = await getAllComments();
      setComments(updatedComments);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Fehler beim Posten des Kommentars');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Kommentar wirklich löschen?')) return;

    try {
      await deleteComment(commentId);
      const updatedComments = await getAllComments();
      setComments(updatedComments);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Fehler beim Löschen des Kommentars');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Lädt Pinnwand...</div>
      </div>
    );
  }

  if (!user) return null;

  const groupInfo = GROUPS[user.group as keyof typeof GROUPS];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{groupInfo.emoji}</div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-600">{groupInfo.name}</p>
            </div>
          </div>
        </div>

        <Navigation />

        {/* Pinnwand Header */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary-600" />
            Pinnwand
          </h2>
          <p className="text-gray-600">
            Teile deine Gedanken und Feedback zur Weiterbildung mit anderen Teilnehmern!
          </p>
        </div>

        {/* Comment Form */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Schreibe einen Kommentar..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {newComment.length} / 500 Zeichen
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Wird gepostet...' : 'Kommentar posten'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">
            💬 Alle Kommentare ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Noch keine Kommentare vorhanden.</p>
              <p className="text-sm mt-2">Sei der/die Erste und teile deine Gedanken!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, idx) => {
                const commentGroupInfo = GROUPS[comment.group as keyof typeof GROUPS];
                const isOwnComment = comment.userId === user.userId;

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{ borderLeftColor: commentGroupInfo?.color || '#999' }}
                    className="bg-white/50 rounded-xl p-6 border-l-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{commentGroupInfo?.emoji || '👤'}</span>
                        <div>
                          <div className="font-bold">{comment.username}</div>
                          <div className="text-sm text-gray-600">
                            {commentGroupInfo?.name || 'Unbekannt'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isOwnComment && (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {comment.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
