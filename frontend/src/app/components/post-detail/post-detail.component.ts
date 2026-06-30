import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { SuggestionSectionComponent } from '../suggestion-section/suggestion-section.component';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css', '../../../styles.css'],
})
export class PostDetailComponent implements OnInit {
  post: WritableSignal<Post | null> = signal(null);
  postId: string = '';
  editingPostId: WritableSignal<string | null> = signal(null);
  editForm: FormGroup | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
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
    this.postService.editPost(postId, updated).subscribe(() => {
      const currentPost = this.post();
      if (currentPost) {
        this.post.set({ ...currentPost, ...updated });
      }
      this.cancelEdit();
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

  // -------- DELETE ----------
  deletePost(): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(this.postId).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }
}
