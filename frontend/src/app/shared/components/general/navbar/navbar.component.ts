import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NoticeModalComponent } from '../notice-modal/notice-modal.component';
import { UserService, UserProfile, SystemAvatar } from '../../../../core/services/user/user.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NoticeModalComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  loginModalOpen = false;
  profile: UserProfile;
  currentAvatar: SystemAvatar;

  constructor(
    public readonly authService: AuthService,
    public readonly userService: UserService,
    private readonly router: Router,
  ) {
    this.profile = this.userService.currentProfile;
    this.currentAvatar = this.userService.getAvatarById(this.profile.avatarId);

    // Fecha o menu mobile automaticamente ao navegar
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  ngOnInit(): void {
    this.userService.profile$.subscribe((p) => {
      this.profile = p;
      this.currentAvatar = this.userService.getAvatarById(p.avatarId);
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }

  openLoginNotice(): void {
    this.loginModalOpen = true;
  }
}
