'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { checkIsAdmin } from '@/lib/auth';
import { getAllUsers, deleteUser, resetUserProgress, exportAllData } from '@/lib/firestore';
import { User } from '@/types';
import { GROUPS, TASKS, RATING_QUESTIONS, RATING_OPTIONS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Shield, Users, Trash2, RotateCcw, Download, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login?mode=admin');
        setLoading(false);
        return;
      }

      const adminStatus = await checkIsAdmin();
      if (!adminStatus) {
        alert('Keine Admin-Berechtigung!');
        router.push('/');
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (err) {
        console.error('Fehler beim Laden der Users:', err);
        alert('Fehler beim Laden der Benutzerdaten: ' + (err as any).message);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`User "${username}" wirklich löschen?`)) return;
    try {
      await deleteUser(userId);
      setAllUsers(await getAllUsers());
      alert('User gelöscht!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Fehler beim Löschen');
    }
  };

  const handleResetUser = async (userId: string, username: string) => {
    if (!confirm(`Fortschritt von "${username}" zurücksetzen?`)) return;
    try {
      await resetUserProgress(userId);
      setAllUsers(await getAllUsers());
      alert('Fortschritt zurückgesetzt!');
    } catch (error) {
      console.error('Error resetting user:', error);
      alert('Fehler beim Zurücksetzen');
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weiterbildung-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Fehler beim Export');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Lädt Admin-Dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalSubtasks = TASKS.reduce((acc, task) => acc + task.subtasks.length, 0);

  // Gefilterte User (nach Gruppe oder alle)
  const filteredUsers = selectedGroup
    ? allUsers.filter(u => u.group === selectedGroup)
    : allUsers;

  // Gruppen-Statistik
  const groupStats = Object.keys(GROUPS).map(groupKey => {
    const groupUsers = allUsers.filter(u => u.group === groupKey);
    let completedCount = 0;
    groupUsers.forEach(u => {
      completedCount += Object.keys(u.completedSubtasks || {}).length;
    });
    const avgProgress = groupUsers.length > 0
      ? Math.round((completedCount / (totalSubtasks * groupUsers.length)) * 100)
      : 0;
    return { group: groupKey, count: groupUsers.length, avgProgress };
  });

  // Aufgaben-Statistik (gefiltert)
  const taskStats = TASKS.map(task => {
    const stats = {
      total: filteredUsers.length,
      completed: 0,
      subtasks: task.subtasks.map(() => ({ completed: 0 })),
      ratings: {
        enjoyed: [0, 0, 0, 0] as number[],
        useful: [0, 0, 0, 0] as number[],
        learned: [0, 0, 0, 0] as number[],
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

  // Gesamt-Fortschritt-Kacheln
  const halfwayCount = allUsers.filter(u => {
    const done = Object.keys(u.completedSubtasks || {}).length;
    return Math.round((done / totalSubtasks) * 100) >= 50;
  }).length;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Verwaltung & Auswertung</p>
            </div>
          </div>
        </motion.div>

        <Navigation />

        {/* Statistik-Kacheln */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card rounded-2xl p-6 text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <div className="text-4xl font-bold gradient-text mb-1">{allUsers.length}</div>
            <div className="text-gray-600 text-sm">Teilnehmende gesamt</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <div className="text-4xl font-bold gradient-text mb-1">{halfwayCount}</div>
            <div className="text-gray-600 text-sm">mit ≥50% Fortschritt</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">👥</div>
            <div className="text-4xl font-bold gradient-text mb-1">{Object.keys(GROUPS).length}</div>
            <div className="text-gray-600 text-sm">Gruppen</div>
          </div>
        </div>

        {/* Gruppenübersicht mit Filter */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <Users className="w-7 h-7 text-primary-600" />
            Gruppenübersicht
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            {groupStats.map(({ group, count, avgProgress }) => {
              const groupInfo = GROUPS[group as keyof typeof GROUPS];
              const isSelected = selectedGroup === group;
              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(isSelected ? null : group)}
                  className={`p-4 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                >
                  <div className="text-3xl mb-2">{groupInfo.emoji}</div>
                  <div className="font-bold text-sm mb-1">{groupInfo.name}</div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs opacity-80 mb-2">Teilnehmende</div>
                  <div className="text-lg font-bold">{avgProgress}%</div>
                  <div className="text-xs opacity-80">Ø Fortschritt</div>
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

        {/* Aufgaben-Auswertung */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary-600" />
            Aufgaben-Auswertung
            {selectedGroup && (
              <span className="text-lg font-normal text-gray-500">
                · {GROUPS[selectedGroup as keyof typeof GROUPS].name}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            🔒 Bewertungen werden anonymisiert angezeigt
          </p>

          <div className="space-y-6">
            {taskStats.map(({ task, stats }, idx) => {
              const percentage = stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0;

              return (
                <div key={task.id} className="bg-white/60 rounded-xl border border-gray-100 p-5">

                  {/* Aufgaben-Kopf */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{task.lionEmoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-800">
                          {idx + 1}. {task.title}
                        </h3>
                        <span className="text-sm font-bold text-primary-600 ml-3 shrink-0">
                          {stats.completed}/{stats.total} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subtask-Details */}
                  <div className="space-y-1 mb-4 pl-10">
                    {task.subtasks.map((subtask, subIdx) => {
                      const subPct = stats.total > 0
                        ? Math.round((stats.subtasks[subIdx].completed / stats.total) * 100)
                        : 0;
                      return (
                        <div key={subIdx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 truncate mr-2">{subtask}</span>
                          <span className="font-semibold text-gray-800 shrink-0">
                            {stats.subtasks[subIdx].completed}/{stats.total} ({subPct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ratings */}
                  {stats.ratings.total > 0 ? (
                    <div className="pt-4 border-t border-gray-100 pl-10">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        📊 Bewertungen ({stats.ratings.total})
                      </h4>
                      <div className="space-y-3">
                        {RATING_QUESTIONS.map(q => (
                          <div key={q.id}>
                            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                              {q.emoji} {q.label}
                            </div>
                            <div className="flex gap-1 h-12 items-end">
                              {RATING_OPTIONS.map(opt => {
                                const count = stats.ratings[q.id][opt.value];
                                const percent = stats.ratings.total > 0
                                  ? Math.round((count / stats.ratings.total) * 100)
                                  : 0;
                                return (
                                  <div key={opt.value} className="flex-1 text-center">
                                    <div
                                      style={{
                                        height: `${Math.max(count * 16, count > 0 ? 24 : 8)}px`,
                                        backgroundColor: opt.color
                                      }}
                                      className="rounded-t mx-auto flex items-end justify-center text-white font-bold text-xs pb-0.5"
                                    >
                                      {count > 0 && count}
                                    </div>
                                    <div className="text-xs mt-1 text-gray-500">
                                      {opt.emoji}
                                      <div>{percent > 0 ? `${percent}%` : ''}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic pl-10 pt-3 border-t border-gray-100">
                      Noch keine Bewertungen eingegangen
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Aktionen */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Aktionen</h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Alle Daten exportieren (JSON)
          </button>
        </div>

        {/* Benutzerverwaltung */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            Benutzerverwaltung
            {selectedGroup && (
              <span className="text-lg font-normal text-gray-500 ml-2">
                · {GROUPS[selectedGroup as keyof typeof GROUPS].name}
              </span>
            )}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold">Name</th>
                  <th className="text-left py-4 px-4 font-semibold">Gruppe</th>
                  <th className="text-left py-4 px-4 font-semibold">Code</th>
                  <th className="text-left py-4 px-4 font-semibold">Fortschritt</th>
                  <th className="text-left py-4 px-4 font-semibold">Registriert</th>
                  <th className="text-right py-4 px-4 font-semibold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {(selectedGroup ? allUsers.filter(u => u.group === selectedGroup) : allUsers).map(user => {
                  const completed = Object.keys(user.completedSubtasks || {}).length;
                  const progress = Math.round((completed / totalSubtasks) * 100);
                  const groupInfo = GROUPS[user.group as keyof typeof GROUPS];

                  return (
                    <tr key={user.userId} className="border-b border-gray-100 hover:bg-white/50">
                      <td className="py-3 px-4 font-medium">{user.username}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{groupInfo?.emoji}</span>
                          <span className="text-sm">{groupInfo?.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                          {user.code}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[100px]">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${progress}%`, backgroundColor: groupInfo?.color }}
                                className="h-full"
                              />
                            </div>
                          </div>
                          <span className="font-semibold text-sm">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleResetUser(user.userId, user.username)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Fortschritt zurücksetzen"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.userId, user.username)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="User löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {allUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Noch keine Benutzer registriert</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
