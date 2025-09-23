export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "13.0.5";
	};
	public: {
		Tables: {
			participants: {
				Row: {
					id: string;
					is_active: boolean;
					joined_at: string;
					name: string;
					room_id: string;
					user_id: string | null;
				};
				Insert: {
					id?: string;
					is_active?: boolean;
					joined_at?: string;
					name: string;
					room_id: string;
					user_id?: string | null;
				};
				Update: {
					id?: string;
					is_active?: boolean;
					joined_at?: string;
					name?: string;
					room_id?: string;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "participants_room_id_fkey";
						columns: ["room_id"];
						isOneToOne: false;
						referencedRelation: "rooms";
						referencedColumns: ["id"];
					}
				];
			};
			rooms: {
				Row: {
					created_at: string;
					created_by: string | null;
					id: string;
					is_active: boolean;
					name: string;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					created_by?: string | null;
					id?: string;
					is_active?: boolean;
					name: string;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					created_by?: string | null;
					id?: string;
					is_active?: boolean;
					name?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			stories: {
				Row: {
					created_at: string;
					description: string | null;
					id: string;
					is_current: boolean;
					room_id: string;
					title: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					id?: string;
					is_current?: boolean;
					room_id: string;
					title: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					id?: string;
					is_current?: boolean;
					room_id?: string;
					title?: string;
				};
				Relationships: [
					{
						foreignKeyName: "stories_room_id_fkey";
						columns: ["room_id"];
						isOneToOne: false;
						referencedRelation: "rooms";
						referencedColumns: ["id"];
					}
				];
			};
			usuario: {
				Row: {
					data_criacao: string | null;
					email: string;
					id: string;
					inativo: number;
					nome: string;
				};
				Insert: {
					data_criacao?: string | null;
					email: string;
					id?: string;
					inativo?: number;
					nome: string;
				};
				Update: {
					data_criacao?: string | null;
					email?: string;
					id?: string;
					inativo?: number;
					nome?: string;
				};
				Relationships: [];
			};
			votes: {
				Row: {
					created_at: string;
					id: string;
					participant_id: string;
					story_id: string;
					vote_value: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					participant_id: string;
					story_id: string;
					vote_value: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					participant_id?: string;
					story_id?: string;
					vote_value?: string;
				};
				Relationships: [
					{
						foreignKeyName: "votes_participant_id_fkey";
						columns: ["participant_id"];
						isOneToOne: false;
						referencedRelation: "participants";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "votes_story_id_fkey";
						columns: ["story_id"];
						isOneToOne: false;
						referencedRelation: "stories";
						referencedColumns: ["id"];
					}
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
	? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
	? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
	? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
