import { Component, OnInit, signal, WritableSignal } from '@angular/core';
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
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  posts: WritableSignal<Post[]> = signal([]);
  editingPostId: WritableSignal<string | null> = signal(null);
  editForm: FormGroup | null = null;
  showDescription: WritableSignal<boolean> = signal(true); // start open

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postService.getApprovedPosts().subscribe((posts) => this.posts.set(posts));
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleDescription(): void {
    this.showDescription.update((v) => !v);
  }

  // -------- EDIT ----------
  startEdit(post: Post): void {
    this.editingPostId.set(post.id!);
    this.editForm = this.fb.group({
      companyName: [post.companyName, Validators.required],
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

    const formVal = this.editForm.value;
    const updated: Post = {
      id: postId,
      companyName: formVal.companyName,
      description: formVal.description,
      sourceLinks: formVal.sourceLinks,
      tags: formVal.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0),
      highlights: formVal.highlights
        ? formVal.highlights
            .split('\n')
            .map((line: string) =>
              line
                .split('|')
                .map((item: string) => item.trim())
                .filter((item: string) => item.length > 0),
            )
            .filter((box: string[]) => box.length > 0)
        : [],
    };

    this.postService.editPost(postId, updated).subscribe(() => {
      this.loadPosts();
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
  deletePost(postId: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(postId).subscribe(() => this.loadPosts());
    }
  }
}
