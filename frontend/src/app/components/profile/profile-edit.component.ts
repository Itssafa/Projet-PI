// Profile Edit Component - Now replaced by ProfileSectionsComponent
// This is kept for backward compatibility

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUser } from '../../core/models';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-edit-deprecated">
      <div class="deprecation-notice">
        <h3>⚠️ Component Replaced</h3>
        <p>This profile editing component has been replaced by a new sectioned version.</p>
        <p>Please use <code>&lt;app-profile-sections&gt;</code> instead.</p>
        <button type="button" class="btn btn-secondary" (click)="onCancel()">
          Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-edit-deprecated {
      padding: 2rem;
      text-align: center;
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
    }
    .deprecation-notice h3 {
      color: #856404;
      margin-bottom: 1rem;
    }
    .deprecation-notice p {
      margin-bottom: 0.5rem;
      color: #6c757d;
    }
    .btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      background: #fff;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class ProfileEditComponent {
  @Input() user: AuthUser | null = null;
  @Output() saved = new EventEmitter<AuthUser>();
  @Output() cancelled = new EventEmitter<void>();

  onCancel(): void {
    this.cancelled.emit();
  }
}