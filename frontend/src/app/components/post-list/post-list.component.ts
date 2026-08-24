import { Component, OnInit, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-post-list',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatChipsModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		ReactiveFormsModule,
		RouterLink,
	],
	templateUrl: './post-list.component.html',
	styleUrls: ['./post-list.component.css', '../../../styles.css'],
})
export class PostListComponent implements OnInit {
	posts: WritableSignal<Post[]> = signal([]);
	editingPostId: WritableSignal<string | null> = signal(null);
	editForm: FormGroup | null = null;
	showDescription: WritableSignal<boolean> = signal(true);

	// Banner signal
	banner = signal<{ type: 'success' | 'error'; message: string } | null>(null);

	constructor(
		private postService: PostService,
		private authService: AuthService,
		private searchService: SearchService,
		private fb: FormBuilder,
		private router: Router,
	) {}

	ngOnInit(): void {
		this.loadPosts();
	}

	filteredPosts = computed(() => {
		const term = this.searchService.searchTerm().toLowerCase();
		const allPosts = this.posts();
		if (!term) return allPosts;

		return allPosts.filter(
			(post) =>
				post.companyName?.toLowerCase().includes(term) ||
				post.category?.toLowerCase().includes(term) ||
				post.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
				post.submittedBy?.toLowerCase().includes(term),
		);
	});

	loadPosts(): void {
		this.postService.getApprovedPosts().subscribe((posts) => {
			const sorted = posts.sort((a, b) => {
				const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return dateB - dateA;
			});
			this.posts.set(sorted);
		});
	}

	isLoggedIn(): boolean {
		return this.authService.isLoggedIn();
	}

	toggleDescription(): void {
		this.showDescription.update((v) => !v);
	}

	openPost(postId: string | undefined, event: Event) {
		if (!postId) return;
		if (this.editingPostId()) return;
		const target = event.target as HTMLElement;
		if (target.closest('button, a, mat-icon, input, textarea, mat-chip')) {
			return;
		}
		this.router.navigate(['/post', postId]);
	}

	// -------- EDIT ----------
	startEdit(post: Post): void {
		this.editingPostId.set(post.id!);
		this.editForm = this.fb.group({
			companyName: [post.companyName, Validators.required],
			category: [post.category || ''],
			description: [post.description, Validators.required],
			sourceLinks: this.fb.array(
				post.sourceLinks?.length
					? post.sourceLinks.map((link) => this.fb.control(link, Validators.required))
					: [this.fb.control('', Validators.required)],
			),
			tags: [post.tags?.join(', ') || ''],
			highlights: [post.highlights?.map((box) => box.join('|')).join('\n') || ''],
		});
	}

	cancelEdit(): void {
		this.editingPostId.set(null);
		this.editForm = null;
	}

	saveEdit(postId: string): void {
		if (!this.editForm?.valid) return;
		const updated = this.postService.buildEditPayload(this.editForm.value, postId);
		const companyName = updated.companyName;

		this.postService.editPost(postId, updated).subscribe({
			next: () => {
				this.showBanner('success', `"${updated.companyName}" updated successfully.`);
				this.loadPosts();
				this.cancelEdit();
			},
			error: () => {
				this.showBanner('error', `Failed to update "${updated.companyName}".`);
			},
		});
	}

	get sourceLinksArray(): FormArray {
		return this.editForm?.get('sourceLinks') as FormArray;
	}

	addLink(): void {
		this.sourceLinksArray.push(this.fb.control('', Validators.required));
	}

	removeLink(index: number): void {
		this.sourceLinksArray.removeAt(index);
	}

	deletePost(postId: string): void {
		const post = this.posts().find((p) => p.id === postId);
		const companyName = post?.companyName || 'this post';
		if (confirm('Are you sure you want to delete this post?')) {
			this.postService.deletePost(postId).subscribe({
				next: () => {
					this.showBanner('success', `"${companyName}" deleted successfully.`);
					this.loadPosts();
				},
				error: () => {
					this.showBanner('error', `Failed to delete "${companyName}".`);
				},
			});
		}
	}

	private showBanner(type: 'success' | 'error', message: string) {
		const formattedMessage = message.replace(/"(.*?)"/, '<strong>$1</strong>');
		this.banner.set({ type, message: formattedMessage });
		setTimeout(() => this.banner.set(null), 5000);
	}
}
