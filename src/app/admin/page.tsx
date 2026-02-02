'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { checkIsAdmin } from '@/lib/auth';
import { getAllUsers, deleteUser, resetUserProgress, exportAllData } from '@/lib/firestore';
import { User } from '@/types';
import { GROUPS, TASKS } from '@/lib/constants';
import Navigation from '@/components/Navigation';
import { Shield, Users, Trash2, RotateCcw, Download, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
      const users = await getAllUsers();
      setAllUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`User "${username}" wirklich löschen?`)) return;

    try {
      await deleteUser(userId);
      const updatedUsers = await getAllUsers();
      setAllUsers(updatedUsers);
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
      const updatedUsers = await getAllUsers();
      setAllUsers(updatedUsers);
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

  // Group statistics
  const groupStats = Object.keys(GROUPS).map(groupKey => {
    const groupUsers = allUsers.filter(u => u.group === groupKey);
    return {
      group: groupKey,
      count: groupUsers.length
    };
  });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Verwaltung & Übersicht</p>
            </div>
          </div>
        </div>

        <Navigation />

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card rounded-2xl p-6">
            <Users className="w-8 h-8 text-primary-600 mb-3" />
            <div className="text-4xl font-bold mb-2">{allUsers.length}</div>
            <div className="text-gray-600">Teilnehmer gesamt</div>
          </div>
          
          {groupStats.slice(0, 2).map(({ group, count }) => {
            const groupInfo = GROUPS[group as keyof typeof GROUPS];
            return (
              <div key={group} className="glass-card rounded-2xl p-6">
                <div className="text-4xl mb-3">{groupInfo.emoji}</div>
                <div className="text-3xl font-bold mb-2">{count}</div>
                <div className="text-gray-600">{groupInfo.name}</div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Aktionen</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Daten exportieren (JSON)
            </button>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 flex-1">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Hinweis:</strong> PDF-Upload wird über Firebase Storage verwaltet.
                  Siehe <code>src/lib/firestore.ts</code> für PDF-Funktionen.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Benutzerverwaltung</h2>
          
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
                {allUsers.map(user => {
                  const completed = Object.keys(user.completedSubtasks || {}).length;
                  const progress = Math.round((completed / totalSubtasks) * 100);
                  const groupInfo = GROUPS[user.group as keyof typeof GROUPS];

                  return (
                    <tr key={user.userId} className="border-b border-gray-100 hover:bg-white/50">
                      <td className="py-4 px-4 font-medium">{user.username}</td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{groupInfo.emoji}</span>
                          {groupInfo.name}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                          {user.code}
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[120px]">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${progress}%`, backgroundColor: groupInfo.color }}
                                className="h-full"
                              />
                            </div>
                          </div>
                          <span className="font-semibold text-sm">{progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-4 px-4">
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
