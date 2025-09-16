import { useState, useEffect } from 'react';
import { Note, NoteCreate, NoteUpdate } from '@/types/note';
import { notesApi, ApiError } from '@/lib/api';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedNotes = await notesApi.getAll();
      setNotes(fetchedNotes);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const createNote = async (noteData: NoteCreate) => {
    try {
      setError(null);
      const newNote = await notesApi.create(noteData);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (error: any) {
      setError(error.message || 'Failed to create note');
      throw error;
    }
  };

  const updateNote = async (id: number, noteData: NoteUpdate) => {
    try {
      setError(null);
      const updatedNote = await notesApi.update(id, noteData);
      setNotes(prev => prev.map(note => 
        note.id === id ? updatedNote : note
      ));
      return updatedNote;
    } catch (error: any) {
      setError(error.message || 'Failed to update note');
      throw error;
    }
  };

  const deleteNote = async (id: number) => {
    try {
      setError(null);
      await notesApi.delete(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error: any) {
      setError(error.message || 'Failed to delete note');
      throw error;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    noteCount: notes.length
  };
}