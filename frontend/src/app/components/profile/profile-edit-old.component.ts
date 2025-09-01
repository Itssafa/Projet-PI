// Old profile edit component - replaced by ProfileSectionsComponent
// This file is kept for compatibility but is no longer used

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-edit-old',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="deprecated-component">
      <p>This component has been replaced by ProfileSectionsComponent</p>
    </div>
  `
})
export class ProfileEditOldComponent {
  // Deprecated - use ProfileSectionsComponent instead
}