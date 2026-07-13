import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, /*RouterLink*/ } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';
import { CommentSectionComponent } from '../comment-section/comment-section.component';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
//import { SuggestionSectionComponent } from '../suggestion-section/suggestion-section.component';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HighlightService } from '../../services/highlight.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    CommentSectionComponent,
    SuggestionSectionComponent,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css', '../../../styles.css'],
  providers: [HighlightService],
})
export class PostDetailComponent implements OnInit {
  post: WritableSignal<Post | null> = signal(null);
  postId: string = '';
  editingPostId: WritableSignal<string | null> = signal(null);
  editForm: FormGroup | null = null;
  banner = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    public hs: HighlightService,
  ) {}

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id')!;
    this.loadPost();
  }

  loadPost() {
    this.postService.getPostById(this.postId).subscribe((post) => {
      this.post.set(post);
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
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
      // highlights textarea removed – we use the builder now
    });

    // Initialise the highlight builder from the post
    this.hs.highlightBoxes.set(post.highlights ? post.highlights.map((box) => [...box]) : []);
  }

  cancelEdit(): void {
    this.editingPostId.set(null);
    this.editForm = null;
    this.hs.highlightBoxes.set([]); // reset
    this.hs.editingHighlight.set(null);
  }

  // saveEdit must use the highlights from the service
  saveEdit(postId: string): void {
    if (!this.editForm?.valid) return;

    const formValue = this.editForm.value;
    const updated: Post = {
      id: postId,
      companyName: formValue.companyName,
      category: formValue.category,
      description: formValue.description,
      sourceLinks: formValue.sourceLinks,
      tags: formValue.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean),
      highlights: this.hs.highlightBoxes().filter((box) => box.length > 0),
    };

    this.postService.editPost(postId, updated).subscribe({
      next: (savedPost) => {
        this.showBanner('success', `"${savedPost.companyName}" updated successfully.`);
        this.loadPost();
        this.cancelEdit();
      },
      error: () => {
        this.showBanner('error', 'Failed to update.');
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

  deletePost(): void {
    const companyName = this.post()?.companyName || 'this post';
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.postService.deletePost(this.postId).subscribe({
      next: () => {
        this.showBanner('success', `"${companyName}" deleted successfully.`);
        setTimeout(() => this.router.navigate(['/']), 800);
      },
      error: () => {
        this.showBanner('error', `Failed to delete "${companyName}".`);
      },
    });
  }

  private showBanner(type: 'success' | 'error', message: string) {
    const formattedMessage = message.replace(/"(.*?)"/, '<strong>$1</strong>');
    this.banner.set({ type, message: formattedMessage });
    setTimeout(() => this.banner.set(null), 5000);
  }
}
