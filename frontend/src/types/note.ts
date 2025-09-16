export interface Note {
  id: number;
  title: string;
  content: string | null;
  tenant_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
}