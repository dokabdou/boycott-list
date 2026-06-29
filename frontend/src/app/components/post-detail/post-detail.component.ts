import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { CommentSectionComponent } from '../comment-section/comment-section.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    CommentSectionComponent,
    RouterLink,
  ],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css', '../../../styles.css'],
})
export class PostDetailComponent implements OnInit {
  post: WritableSignal<Post | null> = signal(null);
  postId: string = '';

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
  ) {}

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id')!;
    this.postService.getPostById(this.postId).subscribe((post) => {
      this.post.set(post); // signal update triggers change detection
    });
  }
}
