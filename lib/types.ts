export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      profile: {
        Row: {
          id: string; // referencia auth.users.id
          name: string;
          created_at: string;
        };
        Insert: {
          id: string; // precisa ser o mesmo do auth.users
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profile_user_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users'; // auth.users
            referencedColumns: ['id'];
          },
        ];
      };

      rooms: {
        Row: {
          id: string;
          created_by: string; // profile.id
          password?: string | null;
          private_room: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          password?: string | null;
          private_room?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          password?: string | null;
          private_room?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rooms_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profile';
            referencedColumns: ['id'];
          },
        ];
      };

      room_participants: {
        Row: {
          id: string;
          room_id: string; // rooms.id
          user_id: string; // profile.id, não pode ser null
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'room_participants_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'room_participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profile';
            referencedColumns: ['id'];
          },
        ];
      };

      stories: {
        Row: {
          id: string;
          room_id: string;
          title: string;
          description?: string | null;
          created_at: string;
          is_current: boolean;
        };
        Insert: {
          id?: string;
          room_id: string;
          title: string;
          description?: string | null;
          created_at?: string;
          is_current?: boolean;
        };
        Update: {
          id?: string;
          room_id?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
          is_current?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'stories_room_id_fkey';
            columns: ['room_id'];
            isOneToOne: false;
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
        ];
      };

      votes: {
        Row: {
          id: string;
          story_id: string;
          participant_id: string;
          vote_value: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          participant_id: string;
          vote_value: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          participant_id?: string;
          vote_value?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'votes_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'room_participants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'votes_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<
  Database,
  '__InternalSupabase'
>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

// type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

// type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends
    DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends
    DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends
    DefaultSchemaTableNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
      : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends
    PublicCompositeTypeNameOrOptions extends {
      schema: keyof DatabaseWithoutInternals;
    }
      ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
      : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
