import { Component, OnInit, ViewChild, ElementRef, WritableSignal, signal } from '@angular/core';
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
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'post' | 'manage' = 'post';
  categories: WritableSignal<string[]> = signal([]);
  tags: WritableSignal<Tag[]> = signal([]);

  pendingPosts: WritableSignal<Post[]> = signal([]);
  adminForm!: FormGroup;

  selectedTags: string[] = [];
  allTags: string[] = [];
  filteredTags!: Observable<string[]>;
  highlightBoxes: string[][] = [];

  allCategories: string[] = [];

  suggestions: WritableSignal<Suggestion[]> = signal([]);
  editingSuggestionId: WritableSignal<string | null> = signal(null);
  editSuggestionContent = '';

  banner = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  editingHighlight: WritableSignal<{ boxIndex: number; itemIndex: number; value: string } | null> =
    signal(null);
	
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(
    private suggestionService: SuggestionService,
    private postService: PostService,
    private tagService: TagService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    console.log('AdminDashboardComponent initialized');
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
  }

  /* loadCategories() {
    this.postService.getCategories().subscribe((cats) => this.categories.set(cats));
  }

  loadTags() {
    this.tagService.getAdminTags().subscribe((tags) => this.tags.set(tags));
  }

  addCategory() {
    // Categories are just strings, we create them by creating a new tag? Actually, categories come from post.category; to add a new one we just need to have it appear in the autocomplete – we can add it via tag creation? But categories are not tags. The best way is to allow the admin to create a new category by directly adding it to the list and persisting it as a "dummy" post or by providing an endpoint to add a category. For simplicity, we'll implement a local add: the admin can type a new category name and we'll add it to the local list; however, it won't be saved until a post uses it. That's acceptable.
    const name = this.newCategoryName.trim();
    if (!name) return;
    // Add locally; will be available in autocomplete next time categories are loaded from existing posts
    if (!this.categories().includes(name)) {
      this.categories.update((cats) => [...cats, name].sort());
    }
    this.newCategoryName = '';
  }

  startEditCategory(cat: string) {
    this.editingCategoryId.set(cat); // use the name as ID for categories
    this.editCategoryName = cat;
  }

  saveEditCategory(oldName: string) {
    const newName = this.editCategoryName.trim();
    if (!newName || newName === oldName) return;
    this.categoryService.renameCategory(oldName, newName).subscribe(() => {
      this.editingCategoryId.set(null);
      this.loadCategories();
    });
  }

  deleteCategory(name: string) {
    if (confirm('Delete this category?')) {
      this.categoryService.deleteCategory(name).subscribe(() => this.loadCategories());
    }
  }

  refreshData() {
    // get the tags and categories, edit and update or delete the allTags and allCategories arrays
  }

  switchTab(tab: 'post' | 'manage') {
    this.activeTab = tab;
    if (tab === 'manage') {
      this.loadSuggestions();
    }
  } */

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

  addHighlightBox() {
    if (this.highlightBoxes.length < 3) {
      this.highlightBoxes.push([]);
    }
  }

  removeHighlightBox(index: number) {
    this.highlightBoxes.splice(index, 1);
  }

  addHighlightItem(boxIndex: number, input: HTMLInputElement) {
    const value = input.value.trim();
    if (value && this.highlightBoxes[boxIndex].length < 4) {
      this.highlightBoxes[boxIndex].push(value);
      input.value = '';
    }
  }

  removeHighlightItem(boxIndex: number, itemIndex: number) {
    this.highlightBoxes[boxIndex].splice(itemIndex, 1);
  }

  startEditHighlightItem(boxIndex: number, itemIndex: number) {
    this.editingHighlight.set({
      boxIndex,
      itemIndex,
      value: this.highlightBoxes[boxIndex][itemIndex],
    });
    // Focus the input after it appears – dynamic ID as before
    setTimeout(() => {
      const el = document.getElementById(
        `highlight-input-${boxIndex}-${itemIndex}`,
      ) as HTMLInputElement;
      el?.focus();
    }, 0);
  }

  saveEditHighlightItem() {
    const highlight = this.editingHighlight();
    if (!highlight) return;
    const { boxIndex, itemIndex, value } = highlight;
    const trimmed = value.trim();
    if (trimmed) {
      this.highlightBoxes[boxIndex][itemIndex] = trimmed;
    } else {
      this.highlightBoxes[boxIndex].splice(itemIndex, 1);
    }
    this.editingHighlight.set(null);
  }

  cancelEditHighlightItem() {
    this.editingHighlight.set(null);
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
        console.log('Banner set to success');
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
        console.log('Banner set to error');
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
        this.highlightBoxes,
        true, // isAdmin = true → auto‑approved, admin endpoint
      )
      .subscribe(() => {
        // Reset form
        this.adminForm.reset();
        this.sourceLinks.clear();
        this.sourceLinks.push(this.fb.control('', Validators.required));
        this.selectedTags = [];
        this.highlightBoxes = [];
      });
  }
}
