import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comment-section',
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
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.css'],
})
export class CommentSectionComponent {
  @Input() postId!: string;

  comments = signal<Comment[]>([]);
  collapsed = signal(false);
  readonly ANON_NAME = 'anon wolf';

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
  ) {}

  newContent = signal('');
  replyTo: string | null = null;
  replyContent = signal('');

  editingCommentId = signal<string | null>(null);
  editCommentContent = '';
  isAdmin: boolean = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.isLoggedIn();
    this.loadComments();
  }

  toggleCollapse() {
    this.collapsed.update((v) => !v);
  }

  loadComments() {
    this.commentService.getComments(this.postId).subscribe((comments) => {
      this.comments.set(comments);
    });
  }

  addTopLevelComment() {
    const content = this.newContent().trim();
    if (!content) return;
    this.commentService
      .addComment(this.postId, { author: this.ANON_NAME, content, parentId: null })
      .subscribe((newComment) => {
        this.comments.update((comments) => [newComment, ...comments]);
        this.newContent.set('');
      });
  }

  startReply(parentId: string) {
    this.replyTo = parentId;
    this.replyContent.set('');
  }

  cancelReply() {
    this.replyTo = null;
  }

  submitReply() {
    const content = this.replyContent().trim();
    if (!content || !this.replyTo) return;
    this.commentService
      .addComment(this.postId, { author: this.ANON_NAME, content, parentId: this.replyTo })
      .subscribe((newComment) => {
        this.comments.update((comments) => [newComment, ...comments]);
        this.replyTo = null;
      });
  }

  getReplies(parentId: string): Comment[] {
    return this.comments().filter((c) => c.parentId === parentId);
  }

  get topLevelComments(): Comment[] {
    return this.comments().filter((c) => !c.parentId);
  }

  // Admin actions
  startEditComment(comment: Comment) {
    this.editingCommentId.set(comment.id);
    this.editCommentContent = comment.content;
  }

  cancelEditComment() {
    this.editingCommentId.set(null);
  }

  saveEditComment(id: string) {
    const newContent = this.editCommentContent.trim();
    if (!newContent) return;
    this.commentService.updateComment(id, newContent).subscribe((updated) => {
      this.comments.update((comments) =>
        comments.map((c) => (c.id === id ? { ...c, content: updated.content } : c)),
      );
      this.editingCommentId.set(null);
    });
  }

  deleteComment(id: string) {
    if (confirm('Delete this comment?')) {
      this.commentService.deleteComment(id).subscribe(() => {
        this.comments.update((comments) => comments.filter((c) => c.id !== id));
      });
    }
  }
}
