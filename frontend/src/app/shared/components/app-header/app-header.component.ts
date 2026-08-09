import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  @Input() title = '';
  @Input() icon = 'notifications';
  @Input() showSettings = false;
  @Input() showSearch = false;
  @Input() showBack = false;
  @Input() backRoute = '';

  @Output() search = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/dashboard']);
  }

  navigateSettings() {
    this.router.navigate(['/configuracion']);
  }

  triggerSearch() {
    this.search.emit();
  }

  goBack() {
    this.back.emit();
    if (this.backRoute) {
      this.router.navigate([this.backRoute]);
      return;
    }
    window.history.back();
  }
}