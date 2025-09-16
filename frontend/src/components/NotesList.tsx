'use client';

import { useState } from 'react';
import { Note } from '@/types/note';
import { useNotes } from '@/hooks/useNotes';
import { Trash2, Edit, Plus } from 'lucide-react';
import NoteForm from './NoteForm';

interface NotesListProps {
  notes: Note[];
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, data: { title?: string; content?: string }) => Promise<void>;
  onCreate: (data: { title: string; content?: string }) => Promise<Note>;
  canCreateMore: boolean;
}

export default function NotesList({ 
  notes, 
  onDelete, 
  onUpdate, 
  onCreate, 
  canCreateMore 
}: NotesListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setLoadingDelete(id);
      try {
        await onDelete(id);
      } finally {
        setLoadingDelete(null);
      }
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
  };

  const handleSaveEdit = async (id: number, data: { title: string; content: string }) => {
    await onUpdate(id, data);
    setEditingId(null);
  };

  const handleCreate = async (data: { title: string; content: string }) => {
    await onCreate(data);
    setShowCreateForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Create Note Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Notes</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={!canCreateMore}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Note
        </button>
      </div>

      {/* Note Limit Warning */}
      {!canCreateMore && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="text-sm text-yellow-700">
            You've reached your note limit. Upgrade to Pro for unlimited notes!
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No notes yet</div>
          <div className="text-gray-400 text-sm mt-2">
            Create your first note to get started
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {editingId === note.id ? (
                <NoteForm
                  initialData={{
                    title: note.title,
                    content: note.content || ''
                  }}
                  onSubmit={(data) => handleSaveEdit(note.id, data)}
                  onCancel={() => setEditingId(null)}
                  submitText="Update Note"
                />
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {note.title}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        disabled={loadingDelete === note.id}
                        className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {note.content && (
                    <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Created: {formatDate(note.created_at)}
                    {note.updated_at !== note.created_at && (
                      <span className="ml-4">
                        Updated: {formatDate(note.updated_at)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateForm(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Note</h3>
            <NoteForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              submitText="Create Note"
            />
          </div>
        </div>
      )}
    </div>
  );
}