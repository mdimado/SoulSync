import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const JournalEditor = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/journal`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const journalEntries = [];
      snapshot.forEach((doc) => {
        journalEntries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setEntries(journalEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
    if (!currentEntry.trim() || !user) return;

    try {
      await addDoc(collection(db, `users/${user.uid}/journal`), {
        content: currentEntry,
        createdAt: new Date(),
        userId: user.uid
      });
      setCurrentEntry('');
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">Please sign in to access your journal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 bg-white shadow rounded-lg p-4">
        <div className="border-b pb-2 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">My Journal</h2>
        </div>
        <div className="mb-6">
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              disabled={!currentEntry.trim()}
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>

      {/* Previous Entries */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Previous Entries</h2>
        {loading ? (
          <p>Loading entries...</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-600">No journal entries yet. Start writing!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white shadow rounded-lg p-4">
              <div className="border-b pb-2 mb-2 text-sm text-gray-500">
                {format(entry.createdAt.toDate(), 'MMMM d, yyyy - h:mm a')}
              </div>
              <div>
                <p className="whitespace-pre-wrap">{entry.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JournalEditor;
