import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SuggestionService } from '../../services/suggestion.service';
import { Suggestion } from '../../models/suggestion.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-suggestion-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './suggestion-section.component.html',
  styleUrls: ['./suggestion-section.component.css', '../../../styles.css'],
})
export class SuggestionSectionComponent {
  @Input() postId!: string;

  suggestions = signal<Suggestion[]>([]);
  collapsed = signal(false);
  readonly ANON_NAME = 'anon wolf';

  constructor(
    private suggestionService: SuggestionService,
    private authService: AuthService,
  ) {}

  editingSuggestionId = signal<string | null>(null);
  editSuggestionContent = '';
  isAdmin: boolean = false;

  newContent = signal('');

  ngOnInit(): void {
    this.isAdmin = this.authService.isLoggedIn();
    this.loadSuggestions();
  }

  toggleCollapse() {
    this.collapsed.update((v) => !v);
  }

  startEditSuggestion(sugg: Suggestion) {
    this.editingSuggestionId.set(sugg.id!);
    this.editSuggestionContent = sugg.content;
  }

  cancelEditSuggestion() {
    this.editingSuggestionId.set(null);
  }

  saveEditSuggestion(id: string) {
    const newContent = this.editSuggestionContent.trim();
    if (!newContent) return;
    this.suggestionService.updateSuggestion(id, newContent).subscribe((updated) => {
      this.suggestions.update((s) =>
        s.map((item) => (item.id === id ? { ...item, content: updated.content } : item)),
      );
      this.editingSuggestionId.set(null);
    });
  }

  deleteSuggestion(id: string) {
    if (confirm('Delete this suggestion?')) {
      this.suggestionService.deleteSuggestion(id).subscribe(() => {
        this.suggestions.update((s) => s.filter((item) => item.id !== id));
      });
    }
  }

  loadSuggestions() {
    this.suggestionService.getSuggestions(this.postId).subscribe((s) => {
      this.suggestions.set(s);
    });
  }

  addSuggestion() {
    const content = this.newContent().trim();
    if (!content) return;

    this.suggestionService
      .addSuggestion(this.postId, this.ANON_NAME, content)
      .subscribe((newSuggestion) => {
        this.suggestions.update((s) => [newSuggestion, ...s]);
        this.newContent.set('');
      });
  }
}
