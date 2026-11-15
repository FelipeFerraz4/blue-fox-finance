import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { storageGet, storageSet } from '../../utils/browser-storage';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly storageKey = 'bluefox_sidebar_collapsed';

  private readonly collapsedSubject = new BehaviorSubject<boolean>(
    storageGet(this.storageKey) === 'true',
  );
  readonly isCollapsed$ = this.collapsedSubject.asObservable();

  private readonly mobileOpenSubject = new BehaviorSubject<boolean>(false);
  readonly isMobileOpen$ = this.mobileOpenSubject.asObservable();

  get isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }

  get isMobileOpen(): boolean {
    return this.mobileOpenSubject.value;
  }

  toggleCollapse(): void {
    const next = !this.collapsedSubject.value;
    this.collapsedSubject.next(next);
    storageSet(this.storageKey, String(next));
  }

  toggleMobile(): void {
    this.mobileOpenSubject.next(!this.mobileOpenSubject.value);
  }

  closeMobile(): void {
    this.mobileOpenSubject.next(false);
  }
}
