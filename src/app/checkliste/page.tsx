'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser, getUserData } from '@/lib/auth';
import { updateUserSubtasks, updateUserRatings } from '@/lib/firestore';
import { User, TaskRating } from '@/types';
import { GROUPS, TASKS, RATING_QUESTIONS, RATING_OPTIONS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { ExternalLink } from 'lucide-react';

export default function ChecklistePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState<number | null>(null);
  const [tempRating, setTempRating] = useState<Record<string, number>>({});

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userData = await getUserData(currentUser.uid);
      if (userData) {
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const toggleSubtask = async (taskId: number, subtaskIndex: number) => {
    if (!user) return;

    const key = `${taskId}-${subtaskIndex}`;
    const newSubtasks = { ...user.completedSubtasks };

    if (newSubtasks[key]) {
      delete newSubtasks[key];
    } else {
      newSubtasks[key] = new Date().toISOString();
    }

    setUser({ ...user, completedSubtasks: newSubtasks });
    await updateUserSubtasks(user.userId, newSubtasks);

    // Check if task is fully completed
    const task = TASKS.find(t => t.id === taskId);
    if (task) {
      const allCompleted = task.subtasks.every((_, i) => newSubtasks[`${taskId}-${i}`]);
      if (allCompleted && !user.ratings[taskId]) {
        setTimeout(() => {
          setShowRatingModal(taskId);
          setTempRating({});
        }, 300);
      }
    }
  };

  const submitRating = async () => {
    if (!user || showRatingModal === null) return;

    // Ensure all rating fields exist
    const ratingData: TaskRating = {
      enjoyed: tempRating['enjoyed'] ?? 0,
      useful: tempRating['useful'] ?? 0,
      learned: tempRating['learned'] ?? 0,
      timestamp: new Date().toISOString()
    };

    const newRatings = {
      ...user.ratings,
      [showRatingModal]: ratingData
    };

    setUser({ ...user, ratings: newRatings });
    await updateUserRatings(user.userId, newRatings);
    setShowRatingModal(null);
    setTempRating({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Lädt...</div>
      </div>
    );
  }

  if (!user) return null;

  const groupInfo = GROUPS[user.group as keyof typeof GROUPS];
  const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);
  const completedSubtasks = Object.keys(user.completedSubtasks).length;
  const progress = Math.round((completedSubtasks / totalSubtasks) * 100);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{groupInfo.emoji}</div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-600">{groupInfo.name} • Code: {user.code}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>Fortschritt: {completedSubtasks} / {totalSubtasks}</span>
              <span className="text-primary-600">{progress}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-primary-600 to-accent-600"
              />
            </div>
          </div>
        </div>

        <Navigation />

        {/* Tasks */}
        <div className="space-y-6">
          {TASKS.map((task, idx) => {
            const taskCompleted = task.subtasks.every((_, i) => 
              user.completedSubtasks[`${task.id}-${i}`]
            );
            const taskSubtasksCompleted = task.subtasks.filter((_, i) => 
              user.completedSubtasks[`${task.id}-${i}`]
            ).length;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`glass-card rounded-2xl p-6 ${
                  taskCompleted ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {/* Task Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{task.lionEmoji}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">
                      {idx + 1}. {task.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        task.type === 'group' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {task.type === 'group' ? '👥 Gruppenarbeit' : '🦁 Einzelarbeit'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {taskSubtasksCompleted} / {task.subtasks.length} abgehakt
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subtasks */}
                <div className="space-y-2">
                  {task.subtasks.map((subtask, subIdx) => {
                    const isCompleted = !!user.completedSubtasks[`${task.id}-${subIdx}`];
                    return (
                      <label
                        key={subIdx}
                        className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                          isCompleted
                            ? 'bg-green-50 border-2 border-green-300'
                            : 'bg-white/70 hover:bg-white border-2 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => toggleSubtask(task.id, subIdx)}
                          className="w-5 h-5 mt-0.5 cursor-pointer accent-primary-600"
                        />
                        <span className={`flex-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {subtask}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* External Links */}
                {(task.whiteboardUrl || task.padletUrl || task.padletUrlEBA || task.padletUrlEFZ || task.pdfUrl) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3 flex-wrap">
                    {task.pdfUrl && (
                      <a
                        href={task.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        PDF-Anleitung
                      </a>
                    )}
                    {task.whiteboardUrl && (
                      <a
                        href={task.whiteboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Whiteboard
                      </a>
                    )}
                    {task.padletUrl && (
                      <a
                        href={task.padletUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Padlet
                      </a>
                    )}
                    {task.padletUrlEBA && (
                      <a
                        href={task.padletUrlEBA}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Padlet EBA
                      </a>
                    )}
                    {task.padletUrlEFZ && (
                      <a
                        href={task.padletUrlEFZ}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Padlet EFZ
                      </a>
                    )}
                  </div>
                )}

                {/* Rating Display */}
                {user.ratings[task.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-semibold mb-2 text-sm text-gray-700">✅ Deine Bewertung:</p>
                    <div className="flex gap-4 text-sm flex-wrap">
                      {RATING_QUESTIONS.map(q => {
                        const rating = user.ratings[task.id]?.[q.id];
                        const option = RATING_OPTIONS.find(opt => opt.value === rating);
                        return option ? (
                          <span key={q.id} className="flex items-center gap-1">
                            <span>{q.emoji}</span>
                            <span>{option.emoji}</span>
                            <span className="text-gray-600">{option.label}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Rating Modal */}
        {showRatingModal !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowRatingModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-2">🎉 Aufgabe geschafft!</h2>
              <p className="text-gray-600 mb-6">
                {TASKS.find(t => t.id === showRatingModal)?.title}
              </p>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Hinweis:</strong> Deine Bewertungen werden anonymisiert mit anderen Teilnehmern geteilt.
                </p>
              </div>

              <div className="space-y-6">
                {RATING_QUESTIONS.map(q => (
                  <div key={q.id}>
                    <label className="block font-semibold mb-3 text-gray-800">
                      {q.emoji} {q.label}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {RATING_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setTempRating({ ...tempRating, [q.id]: opt.value })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            tempRating[q.id] === opt.value
                              ? 'border-primary-600 bg-primary-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{opt.emoji}</div>
                          <div className="text-sm font-semibold">{opt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowRatingModal(null)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Überspringen
                </button>
                <button
                  onClick={submitRating}
                  disabled={Object.keys(tempRating).length === 0}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Speichern
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
