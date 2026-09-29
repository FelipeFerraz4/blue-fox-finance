import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  avatarId: string;
  avatarColor: string;
  keycloakId?: string;
  keycloakStatus: 'pending' | 'connected' | 'disabled';
}

export interface SystemAvatar {
  id: string;
  name: string;
  color: string;
  iconType: 'fox-blue' | 'fox-cyan' | 'fox-shield' | 'fox-star' | 'fox-bolt' | 'fox-chart';
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly STORAGE_KEY = 'bluefox_spend_user_profile';
  private readonly LEGACY_STORAGE_KEY = 'bluefox_costs_user_profile';

  public readonly availableAvatars: SystemAvatar[] = [
    { id: 'avatar-1', name: 'Blue Fox Oficial', color: '#004aad', iconType: 'fox-blue' },
    { id: 'avatar-2', name: 'Cyan Spark', color: '#38b6ff', iconType: 'fox-cyan' },
    { id: 'avatar-3', name: 'Shield Security', color: '#0b132b', iconType: 'fox-shield' },
    { id: 'avatar-4', name: 'Star Leader', color: '#f59e0b', iconType: 'fox-star' },
    { id: 'avatar-5', name: 'Energy Bolt', color: '#10b981', iconType: 'fox-bolt' },
    { id: 'avatar-6', name: 'Financial Analyst', color: '#8b5cf6', iconType: 'fox-chart' },
  ];

  private readonly defaultProfile: UserProfile = {
    id: 'user-default-admin',
    name: 'Felipe Ferraz',
    username: 'felipe.ferraz',
    email: 'felipe.ferraz@bluefox.com.br',
    phone: '(11) 98765-4321',
    role: 'Administrador do Sistema',
    avatarId: 'avatar-1',
    avatarColor: '#004aad',
    keycloakId: 'keycloak-sub-pending',
    keycloakStatus: 'pending',
  };

  private profileSubject = new BehaviorSubject<UserProfile>(this.loadProfile());
  public profile$: Observable<UserProfile> = this.profileSubject.asObservable();

  constructor() {}

  public get currentProfile(): UserProfile {
    return this.profileSubject.value;
  }

  private loadProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY) || localStorage.getItem(this.LEGACY_STORAGE_KEY);
      if (stored) {
        return { ...this.defaultProfile, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return this.defaultProfile;
  }

  public updateProfile(updated: Partial<UserProfile>): UserProfile {
    const newProfile = { ...this.currentProfile, ...updated };
    // update avatar color if avatar changed
    if (updated.avatarId) {
      const found = this.availableAvatars.find((a) => a.id === updated.avatarId);
      if (found) {
        newProfile.avatarColor = found.color;
      }
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newProfile));
    } catch {}
    this.profileSubject.next(newProfile);
    return newProfile;
  }

  public getAvatarById(id: string): SystemAvatar {
    return this.availableAvatars.find((a) => a.id === id) || this.availableAvatars[0];
  }
}
