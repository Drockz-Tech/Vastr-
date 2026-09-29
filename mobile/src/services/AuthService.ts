import { supabase } from '../db/supabase';
import { createResponse, ServiceResponse } from './BaseService';
import { User, Session } from '@supabase/supabase-js';

export const AuthService = {
  /**
   * Listens to auth state changes (login, logout, token refresh).
   */
  onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },

  /**
   * Retrieves the current user session (useful for app boot).
   */
  async getSession(): Promise<ServiceResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return createResponse<Session>(data.session);
    } catch (error: any) {
      return createResponse<Session>(null, error);
    }
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return createResponse<boolean>(true);
    } catch (error: any) {
      return createResponse<boolean>(false, error);
    }
  }
  /**
   * Signs in a user with email and password.
   */
  async signIn(email: string, password: string): Promise<ServiceResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return createResponse<Session>(data.session);
    } catch (error: any) {
      return createResponse<Session>(null, error);
    }
  },

  /**
   * Signs up a new user.
   */
  async signUp(email: string, password: string): Promise<ServiceResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return createResponse<Session>(data.session);
    } catch (error: any) {
      return createResponse<Session>(null, error);
    }
  }
};
