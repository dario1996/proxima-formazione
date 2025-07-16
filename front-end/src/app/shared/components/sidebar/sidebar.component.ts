import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../../../core/avatar/avatar.component';
import { AuthJwtService } from '../../../core/services/authJwt.service';

export interface MenuItem {
  title: string;
  icon: string;
  links: {
    label: string;
    url: string;
    icon: string;
  }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() isSidebarOpen: boolean = false;
  @Input() selectedLink: any = null;
  
  @Output() linkSelected = new EventEmitter<any>();
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  get isMobileView(): boolean {
    return window.innerWidth <= 991;
  }

  constructor(public BasicAuth: AuthJwtService) {}

  selectLink(link: any): void {
    this.linkSelected.emit(link);
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 991.98) {
      this.sidebarToggle.emit();
    }
  }

  onLogout(): void {
    this.logoutClicked.emit();
  }

  onToggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  onOverlayClick(): void {
    this.sidebarToggle.emit();
  }
}