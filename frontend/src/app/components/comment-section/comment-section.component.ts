import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommentService } from '../../services/comment.service';
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
  styleUrls: ['./comment-section.component.css', '../../../styles.css'],
})
export class CommentSectionComponent implements OnInit {
  @Input() postId!: string;

  comments: Comment[] = [];
  newComment = { author: '', content: '' };
  replyTo: string | null = null; // id of parent comment
  replyAuthor = '';
  replyContent = '';

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments() {
    this.commentService.getComments(this.postId).subscribe((comments) => {
      this.comments = comments;
    });
  }

  addTopLevelComment() {
    if (!this.newComment.author.trim() || !this.newComment.content.trim()) return;
    this.commentService
      .addComment(this.postId, {
        author: this.newComment.author,
        content: this.newComment.content,
        parentId: null,
      })
      .subscribe(() => {
        this.newComment = { author: '', content: '' };
        this.loadComments();
      });
  }

  startReply(parentId: string) {
    this.replyTo = parentId;
    this.replyAuthor = '';
    this.replyContent = '';
  }

  cancelReply() {
    this.replyTo = null;
  }

  submitReply() {
    if (!this.replyAuthor.trim() || !this.replyContent.trim()) return;
    this.commentService
      .addComment(this.postId, {
        author: this.replyAuthor,
        content: this.replyContent,
        parentId: this.replyTo,
      })
      .subscribe(() => {
        this.replyTo = null;
        this.loadComments();
      });
  }

  // Helper to get replies for a parent
  getReplies(parentId: string): Comment[] {
    return this.comments.filter((c) => c.parentId === parentId);
  }

  // Top-level comments (parentId == null)
  get topLevelComments(): Comment[] {
    return this.comments.filter((c) => !c.parentId);
  }
}
