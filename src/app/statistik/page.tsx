'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserData } from '@/lib/auth';
import { getAllUsers } from '@/lib/firestore';
import { User } from '@/types';
import { GROUPS, TASKS, RATING_QUESTIONS, RATING_OPTIONS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Users, TrendingUp } from 'lucide-react';

export default function StatistikPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        setLoading(false);
        return;
      }

      const [userData, users] = await Promise.all([
        getUserData(firebaseUser.uid),
        getAllUsers()
      ]);

      if (userData) setUser(userData);
      setAllUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Lädt Statistiken...</div>
      </div>
    );
  }

  if (!user) return null;

  const filteredUsers = selectedGroup 
    ? allUsers.filter(u => u.group === selectedGroup)
    : allUsers;

  // Calculate group stats
  const groupStats = Object.keys(GROUPS).map(groupKey => {
    const groupUsers = allUsers.filter(u => u.group === groupKey);
    const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);
    let completedCount = 0;

    groupUsers.forEach(u => {
      completedCount += Object.keys(u.completedSubtasks || {}).length;
    });

    const avgProgress = groupUsers.length > 0 
      ? Math.round((completedCount / (totalSubtasks * groupUsers.length)) * 100)
      : 0;

    return {
      group: groupKey,
      count: groupUsers.length,
      avgProgress
    };
  });

  // Calculate task stats
  const taskStats = TASKS.map(task => {
    const stats = {
      total: filteredUsers.length,
      completed: 0,
      subtasks: task.subtasks.map(() => ({ completed: 0 })),
      ratings: {
        enjoyed: [0, 0, 0, 0],
        useful: [0, 0, 0, 0],
        learned: [0, 0, 0, 0],
        total: 0
      }
    };

    filteredUsers.forEach(u => {
      let taskCompleted = true;
      task.subtasks.forEach((_, subIdx) => {
        const key = `${task.id}-${subIdx}`;
        if (u.completedSubtasks?.[key]) {
          stats.subtasks[subIdx].completed++;
        } else {
          taskCompleted = false;
        }
      });
      if (taskCompleted) stats.completed++;

      // Collect ratings
      if (u.ratings?.[task.id]) {
        stats.ratings.total++;
        RATING_QUESTIONS.forEach(q => {
          const rating = u.ratings[task.id][q.id];
          if (rating !== null && rating !== undefined) {
            stats.ratings[q.id][rating]++;
          }
        });
      }
    });

    return { task, stats };
  });

  const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{GROUPS[user.group as keyof typeof GROUPS].emoji}</div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-600">{GROUPS[user.group as keyof typeof GROUPS].name}</p>
            </div>
          </div>
        </div>

        <Navigation />

        {/* Group Overview */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-7 h-7 text-primary-600" />
            Gruppenübersicht
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {groupStats.map(({ group, count, avgProgress }) => {
              const groupInfo = GROUPS[group as keyof typeof GROUPS];
              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(selectedGroup === group ? null : group)}
                  className={`p-6 rounded-xl transition-all ${
                    selectedGroup === group
                      ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                >
                  <div className="text-4xl mb-3">{groupInfo.emoji}</div>
                  <h3 className="font-bold mb-2">{groupInfo.name}</h3>
                  <div className="text-3xl font-bold mb-1">{count}</div>
                  <div className="text-sm opacity-90">Teilnehmer</div>
                  <div className="mt-3 pt-3 border-t border-current/20">
                    <div className="text-2xl font-bold">{avgProgress}%</div>
                    <div className="text-xs opacity-90">Ø Fortschritt</div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedGroup && (
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-sm text-primary-600 hover:underline"
            >
              ← Alle Gruppen anzeigen
            </button>
          )}
        </div>

        {/* Task Statistics */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Aufgabenstatistik
            {selectedGroup && (
              <span className="text-lg font-normal text-gray-600">
                • {GROUPS[selectedGroup as keyof typeof GROUPS].name}
              </span>
            )}
          </h2>
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>🔒 Datenschutz:</strong> Alle Bewertungen werden anonymisiert angezeigt.
            </p>
          </div>

          <div className="space-y-6">
            {taskStats.map(({ task, stats }, idx) => {
              const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

              return (
                <div key={task.id} className="bg-white/50 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{task.lionEmoji}</span>
                      <div>
                        <h3 className="font-bold text-lg">{idx + 1}. {task.title}</h3>
                        <p className="text-sm text-gray-600">
                          {stats.completed} / {stats.total} vollständig ({percentage}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    />
                  </div>

                  {/* Subtask Stats */}
                  <div className="space-y-2 mb-4">
                    {task.subtasks.map((subtask, subIdx) => {
                      const subPercentage = stats.total > 0 
                        ? Math.round((stats.subtasks[subIdx].completed / stats.total) * 100)
                        : 0;
                      return (
                        <div key={subIdx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{subtask}</span>
                          <span className="font-semibold text-gray-900">
                            {stats.subtasks[subIdx].completed}/{stats.total} ({subPercentage}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ratings */}
                  {stats.ratings.total > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold mb-3 text-sm">
                        📊 Anonymisierte Bewertungen ({stats.ratings.total})
                      </h4>
                      <div className="space-y-3">
                        {RATING_QUESTIONS.map(q => (
                          <div key={q.id}>
                            <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                              {q.emoji} {q.label}
                            </div>
                            <div className="flex gap-1">
                              {RATING_OPTIONS.map(opt => {
                                const count = stats.ratings[q.id][opt.value];
                                const percent = stats.ratings.total > 0 
                                  ? Math.round((count / stats.ratings.total) * 100)
                                  : 0;
                                return (
                                  <div
                                    key={opt.value}
                                    className="flex-1 text-center"
                                  >
                                    <div
                                      style={{
                                        height: `${Math.max(count * 20, count > 0 ? 30 : 10)}px`,
                                        backgroundColor: opt.color
                                      }}
                                      className="rounded-t mx-auto transition-all flex items-end justify-center text-white font-bold text-sm pb-1"
                                    >
                                      {count > 0 && count}
                                    </div>
                                    <div className="text-xs mt-1 text-gray-600">
                                      {opt.emoji}
                                      <div>{percent}%</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* User List */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            👥 Teilnehmer ({filteredUsers.length})
          </h2>
          <div className="space-y-3">
            {filteredUsers.map(u => {
              const completed = Object.keys(u.completedSubtasks || {}).length;
              const progress = Math.round((completed / totalSubtasks) * 100);
              const groupInfo = GROUPS[u.group as keyof typeof GROUPS];

              return (
                <div key={u.userId} className="bg-white/50 rounded-xl p-4 flex items-center gap-4">
                  <div className="text-3xl">{groupInfo.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{u.username}</div>
                    <div className="text-sm text-gray-600">{groupInfo.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{progress}%</div>
                    <div className="text-xs text-gray-600">{completed}/{totalSubtasks}</div>
                  </div>
                  <div className="w-32">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progress}%`, backgroundColor: groupInfo.color }}
                        className="h-full transition-all"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
