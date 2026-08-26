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
import { HomeDescriptionService } from '../../services/home-description.service';
import { NgxEditorComponent, Editor } from 'ngx-editor';

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
		NgxEditorComponent,
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

	allPosts: WritableSignal<Post[]> = signal([]);
	selectedPostIds: WritableSignal<string[]> = signal([]);

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

	manageTab: WritableSignal<'categories' | 'tags' | 'data' | 'description'> =
		signal('categories');

	@ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

	@ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

	homeDescription = signal('');
	editHomeDescription = '';

	editor!: Editor;

	constructor(
		private suggestionService: SuggestionService,
		private postService: PostService,
		private tagService: TagService,
		private categoryService: CategoryService,
		private homeDescriptionService: HomeDescriptionService,
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
		this.loadHomeDescription();

		this.editor = new Editor();
	}

	ngOnDestroy() {
		if (this.editor) {
			this.editor.destroy();
		}
	}

	switchTab(tab: 'post' | 'manage') {
		this.activeTab = tab;
		if (tab === 'manage') {
			this.loadData();
		}
	}

	loadData() {
		this.loadAdminCategories();
		this.loadAdminTags();
		this.loadAllPosts();
	}

	switchManageTab(tab: 'categories' | 'tags' | 'data' | 'description') {
		this.manageTab.set(tab);
	}

	loadHomeDescription() {
		this.homeDescriptionService.getHomeDescription().subscribe((res) => {
			this.homeDescription.set(res.content);
			this.editHomeDescription = res.content;
		});
	}

	saveHomeDescription() {
		if (this.editHomeDescription.trim()) {
			this.homeDescriptionService
				.updateHomeDescription(this.editHomeDescription)
				.subscribe((res) => {
					this.homeDescription.set(res.content);
					this.showBanner('success', 'Home description updated.');
				});
		}
	}

	loadAllPosts() {
		this.postService.getAllPosts().subscribe((posts) => {
			this.allPosts.set(posts);
			this.selectedPostIds.set([]);
		});
	}

	togglePostSelection(id: string) {
		const selected = [...this.selectedPostIds()];
		const index = selected.indexOf(id);
		if (index === -1) {
			selected.push(id);
		} else {
			selected.splice(index, 1);
		}
		this.selectedPostIds.set(selected);
	}

	toggleSelectAll() {
		if (this.selectedPostIds().length === this.allPosts().length) {
			this.selectedPostIds.set([]);
		} else {
			this.selectedPostIds.set(this.allPosts().map((p) => p.id!));
		}
	}

	bulkDeleteSelected() {
		const ids = this.selectedPostIds();
		if (ids.length === 0) return;
		if (confirm(`Delete ${ids.length} selected posts?`)) {
			this.postService.deletePosts(ids).subscribe(() => {
				this.loadAllPosts();
				this.showBanner('success', `Deleted ${ids.length} posts.`);
			});
		}
	}

	createNowBackup() {
		this.postService.createNowBackup().subscribe({
			next: (res) => {
				this.showBanner('success', `Backup created: ${res.path}`);
			},
			error: () => {
				this.showBanner('error', 'Backup failed.');
			},
		});
	}

	createMonthlyBackup() {
		this.postService.createMonthlyBackup().subscribe({
			next: (res) => {
				this.showBanner('success', `Backup created: ${res.path}`);
			},
			error: () => {
				this.showBanner('error', 'Backup failed.');
			},
		});
	}

	// ---------- Manage tab data ----------
	loadAdminCategories() {
		this.categoryService
			.getAdminCategories()
			.subscribe((cats) => this.adminCategories.set(cats));
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
			this.adminTags.update((tags) =>
				[...tags, tag].sort((a, b) => a.name.localeCompare(b.name)),
			);
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

	/**
		 * BLOCKS THE FORM SUBMIT WHEN ENTER IS PRESSED ON KEYBOARD
		 * => <form [formGroup]="submitForm">
		 * => <button
				mat-raised-button
				color="primary"
				type="button"
				[disabled]="submitForm.invalid"
				(click)="onSubmit()"
				>
				Submit Anonymously
			</button>
	*/
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

	exportAllPosts() {
		this.postService.exportAllPosts().subscribe((posts) => {
			const json = JSON.stringify(posts, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const now = new Date();
			const year = now.getFullYear();
			const month = String(now.getMonth() + 1).padStart(2, '0');
			const day = String(now.getDate()).padStart(2, '0');
			const hours = String(now.getHours()).padStart(2, '0');
			const minutes = String(now.getMinutes()).padStart(2, '0');
			const seconds = String(now.getSeconds()).padStart(2, '0');

			const filename = `all_posts_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`;

			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		});
	}

	triggerImport() {
		this.fileInput.nativeElement.click();
	}

	private showBanner(type: 'success' | 'error', message: string) {
		this.banner.set({ type, message });
		setTimeout(() => this.banner.set(null), 5000);
	}

	onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		const files = Array.from(input.files);
		const posts: Post[] = [];
		const fileReadPromises: Promise<void>[] = [];

		for (const file of files) {
			fileReadPromises.push(
				new Promise<void>((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => {
						try {
							const data = JSON.parse(reader.result as string);
							if (Array.isArray(data)) {
								// JSON file contains multiple posts
								posts.push(...data);
							} else {
								// JSON file contains a single post
								posts.push(data);
							}
							resolve();
						} catch (e) {
							reject(e);
						}
					};
					reader.onerror = reject;
					reader.readAsText(file);
				}),
			);
		}

		Promise.all(fileReadPromises)
			.then(() => {
				if (posts.length === 0) {
					this.showBanner('error', 'No valid posts found.');
					return;
				}

				if (posts.length === 1) {
					// Single post import
					this.postService.importSinglePost(posts[0]).subscribe(() => {
						this.loadPendingPosts();
						this.showBanner('success', 'Single import successful');
					});
				} else {
					// Multiple posts (bulk import)
					this.postService.importBulkPosts(posts).subscribe(() => {
						this.loadPendingPosts();
						this.loadData();
						this.showBanner(
							'success',
							`Bulk import successful (${posts.length} posts)`,
						);
					});
				}
			})
			.catch(() => {
				this.showBanner('error', 'Invalid JSON file(s)');
			})
			.finally(() => {
				input.value = '';
			});
	}
}
