import { Component, ElementRef, ViewChild, WritableSignal, signal, OnInit } from '@angular/core';
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
import { Post } from '../../models/post.model';

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
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  pendingPosts: WritableSignal<Post[]> = signal([]); // signal
  adminForm!: FormGroup;

  // Tag management for admin create form
  selectedTags: string[] = [];
  allTags: string[] = [];
  filteredTags!: Observable<string[]>;
  // Highlights: same as submit form
  highlightBoxes: string[][] = [];

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(
    private postService: PostService,
    private tagService: TagService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    console.log('AdminDashboardComponent initialized');
    this.loadPendingPosts();

    this.adminForm = this.fb.group({
      companyName: ['', Validators.required],
      description: ['', Validators.required],
      sourceLinks: this.fb.array([this.fb.control('', Validators.required)]),
    });

    // Load available tags
    this.tagService.getTags().subscribe((tags) => {
      this.allTags = tags;
      this.filteredTags = this.adminForm.valueChanges.pipe(
        startWith(''),
        map(() => this.filterTags('')),
      );
    });
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

  // Tag methods
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

  loadPendingPosts() {
    this.postService.getPendingPosts().subscribe((posts) => {
      this.pendingPosts.set(posts); // ✅ signal update triggers change detection
      console.log('Loaded pending posts:', posts);
    });
  }

  approve(id: string) {
    this.postService.approvePost(id).subscribe(() => this.loadPendingPosts());
  }

  reject(id: string) {
    this.postService.rejectPost(id).subscribe(() => this.loadPendingPosts());
  }

  createAdminPost() {
    console.log('Creating admin post with form values:', this.adminForm.value);
    console.log('is adminForm valid?', this.adminForm.valid);
    if (this.adminForm.invalid) return;

    const post: Post = {
      companyName: this.adminForm.value.companyName,
      description: this.adminForm.value.description,
      sourceLinks: this.adminForm.value.sourceLinks,
      tags: this.selectedTags,
      highlights: this.highlightBoxes.filter((box) => box.length > 0),
    };

    console.log('Submitting admin post:', post);

    this.postService.submitAdminPost(post).subscribe(() => {
      // Reset the form after successful submission
      this.adminForm.reset();
      this.sourceLinks.clear();
      this.sourceLinks.push(this.fb.control('', Validators.required));
      this.selectedTags = [];
      this.highlightBoxes = [];
      // Optionally show a snackbar
    });
  }
}
