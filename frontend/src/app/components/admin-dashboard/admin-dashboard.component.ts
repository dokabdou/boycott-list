import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  WritableSignal,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PostService } from '../../services/post.service';
import { TagService } from '../../services/tag.service';
import { SuggestionService } from '../../services/suggestion.service';
import { Suggestion } from '../../models/suggestion.model';
import { Post } from '../../models/post.model';
import { CategoryService } from '../../services/category.service';
import { Tag } from '../../models/tag.model';
import { Category } from '../../models/category.model';
import { HighlightService } from '../../services/highlight.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatExpansionModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css', '../../../styles.css'],
  providers: [HighlightService],
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'post' | 'manage' = 'post';

  // Post tab
  pendingPosts: WritableSignal<Post[]> = signal([]);
  adminForm!: FormGroup;
  selectedTags: string[] = [];
  allTags: string[] = [];
  filteredTags!: Observable<string[]>;
  allCategories: string[] = [];

  // Manage tab
  adminCategories: WritableSignal<Category[]> = signal([]);
  adminTags: WritableSignal<Tag[]> = signal([]);

  // Inline edit state
  editingCategoryId: WritableSignal<string | null> = signal(null);
  editCategoryName = '';
  editingTagId: WritableSignal<string | null> = signal(null);
  editTagName = '';

  suggestions: WritableSignal<Suggestion[]> = signal([]);
  editingSuggestionId: WritableSignal<string | null> = signal(null);
  editSuggestionContent = '';

  banner = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(
    private suggestionService: SuggestionService,
    private postService: PostService,
    private tagService: TagService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    public hs: HighlightService,
  ) {}

  ngOnInit() {
    this.loadPendingPosts();
    this.adminForm = this.fb.group({
      companyName: ['', Validators.required],
      category: [''],
      description: ['', Validators.required],
      sourceLinks: this.fb.array([this.fb.control('', Validators.required)]),
    });

    this.tagService.getTags().subscribe((tags) => {
      this.allTags = tags;
      this.filteredTags = this.adminForm.valueChanges.pipe(
        startWith(''),
        map(() => this.filterTags('')),
      );
    });

    this.categoryService.getCategories().subscribe((categories) => {
      this.allCategories = categories;
    });

    // Preload manage tab data
    this.loadAdminCategories();
    this.loadAdminTags();
  }

  switchTab(tab: 'post' | 'manage') {
    this.activeTab = tab;
    if (tab === 'manage') {
      this.loadAdminCategories();
      this.loadAdminTags();
    }
  }

  // ---------- Manage tab data ----------
  loadAdminCategories() {
    this.categoryService.getAdminCategories().subscribe((cats) => this.adminCategories.set(cats));
  }

  loadAdminTags() {
    this.tagService.getAdminTags().subscribe((tags) => this.adminTags.set(tags));
  }

  // ---------- Category CRUD ----------
  newCategoryName = '';
  addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.categoryService.createCategory(name).subscribe((cat) => {
      this.adminCategories.update((cats) =>
        [...cats, cat].sort((a, b) => a.name.localeCompare(b.name)),
      );
      this.newCategoryName = '';
    });
  }

  startEditCategory(cat: Category) {
    this.editingCategoryId.set(cat.id!);
    this.editCategoryName = cat.name;
  }

  saveEditCategory(id: string) {
    const newName = this.editCategoryName.trim();
    if (!newName) return;
    this.categoryService.editCategory(id, newName).subscribe((updatedCat) => {
      this.adminCategories.update((cats) => cats.map((c) => (c.id === id ? updatedCat : c)));
      this.editingCategoryId.set(null);
    });
  }

  cancelEditCategory() {
    this.editingCategoryId.set(null);
  }

  deleteCategory(id: string) {
    if (confirm('Delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.adminCategories.update((cats) => cats.filter((c) => c.id !== id));
      });
    }
  }

  // ---------- Tag CRUD ----------
  newTagName = '';
  addTagAdmin() {
    const name = this.newTagName.trim();
    if (!name) return;
    this.tagService.createTag(name).subscribe((tag) => {
      this.adminTags.update((tags) => [...tags, tag].sort((a, b) => a.name.localeCompare(b.name)));
      this.newTagName = '';
    });
  }

  startEditTag(tag: Tag) {
    this.editingTagId.set(tag.id!);
    this.editTagName = tag.name;
  }

  saveEditTag(id: string) {
    const newName = this.editTagName.trim();
    if (!newName) return;
    this.tagService.editTag(id, newName).subscribe((updatedTag) => {
      this.adminTags.update((tags) => tags.map((t) => (t.id === id ? updatedTag : t)));
      this.editingTagId.set(null);
    });
  }

  cancelEditTag() {
    this.editingTagId.set(null);
  }

  deleteTag(id: string) {
    if (confirm('Delete this tag?')) {
      this.tagService.deleteTag(id).subscribe(() => {
        this.adminTags.update((tags) => tags.filter((t) => t.id !== id));
      });
    }
  }

  get sourceLinks(): FormArray {
    return this.adminForm.get('sourceLinks') as FormArray;
  }

  addLink() {
    this.sourceLinks.push(this.fb.control('', Validators.required));
  }

  removeLink(index: number) {
    this.sourceLinks.removeAt(index);
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    if (this.tagInput) {
      this.tagInput.nativeElement.value = '';
    }
  }

  private filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter(
      (tag) => tag.toLowerCase().includes(filterValue) && !this.selectedTags.includes(tag),
    );
  }

  onEnter(event: Event) {
    const keyEvent = event as KeyboardEvent;
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' && target.getAttribute('type') === 'submit') return;
    event.preventDefault();
    const form = target.closest('form');
    if (!form) return;
    const focusableSelectors = [
      'input:not([type=hidden]):not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    const elements = Array.from(
      form.querySelectorAll<HTMLElement>(focusableSelectors.join(',')),
    ).filter((el) => el.offsetParent !== null);
    const currentIndex = elements.indexOf(target);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= elements.length) nextIndex = 0;
    elements[nextIndex]?.focus();
  }

  loadPendingPosts() {
    this.postService.getPendingPosts().subscribe((posts) => {
      const sorted = posts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // descending = newest first
      });
      this.pendingPosts.set(sorted);
    });
  }

  refreshPendingPosts() {
    this.loadPendingPosts();
  }

  approve(id: string) {
    const post = this.pendingPosts().find((p) => p.id === id);
    const companyName = post?.companyName || 'Unknown';

    this.postService.approvePost(id).subscribe({
      next: () => {
        this.loadPendingPosts();
        this.banner.set({ type: 'success', message: `Approved: ${companyName}` });
        setTimeout(() => this.banner.set(null), 5000);
      },
      error: (err) => {
        console.error('Approval failed', err);
        this.banner.set({ type: 'error', message: 'Approval failed. Check console.' });
        setTimeout(() => this.banner.set(null), 5000);
      },
    });
  }

  reject(id: string) {
    const post = this.pendingPosts().find((p) => p.id === id);
    const companyName = post?.companyName || 'Unknown';

    this.postService.rejectPost(id).subscribe({
      next: () => {
        this.loadPendingPosts();
        this.banner.set({ type: 'error', message: `Rejected: ${companyName}` });
        setTimeout(() => this.banner.set(null), 5000);
      },
      error: (err) => {
        console.error('Rejection failed', err);
        this.banner.set({ type: 'error', message: 'Rejection failed. Check console.' });
        setTimeout(() => this.banner.set(null), 5000);
      },
    });
  }

  createAdminPost() {
    if (this.adminForm.invalid) return;

    this.postService
      .submitPost(
        this.adminForm.value,
        this.selectedTags,
        this.hs.highlightBoxes(),
        true, // isAdmin = true → auto‑approved, admin endpoint
      )
      .subscribe(() => {
        // Reset form
        this.adminForm.reset();
        this.sourceLinks.clear();
        this.sourceLinks.push(this.fb.control('', Validators.required));
        this.selectedTags = [];
        this.hs.highlightBoxes.set([]);
      });
  }
}
