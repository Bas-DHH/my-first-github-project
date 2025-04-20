export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          business_id: string;
          role: 'admin' | 'staff';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          business_id: string;
          role: 'admin' | 'staff';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          business_id?: string;
          role?: 'admin' | 'staff';
          created_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
    };
  };
} 