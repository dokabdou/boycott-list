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
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PostService } from '../../services/post.service';
import { TagService } from '../../services/tag.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-submit-form',
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
  ],
  templateUrl: './submit-form.component.html',
  styleUrls: ['./submit-form.component.css', '../../../styles.css'],
})
export class SubmitFormComponent implements OnInit {
  submitForm!: FormGroup;
  selectedTags: string[] = [];
  allTags: string[] = [];
  filteredTags!: Observable<string[]>;
  highlightBoxes: string[][] = [];
  allCategories: string[] = [];
  showBanner: WritableSignal<boolean> = signal(false);

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private tagService: TagService,
	private categoryService: CategoryService,
  ) {}

  ngOnInit() {
    this.submitForm = this.fb.group({
      companyName: ['', Validators.required],
      description: ['', Validators.required],
      category: [''],
      sourceLinks: this.fb.array([this.fb.control('', Validators.required)]),
    });

    this.tagService.getTags().subscribe((tags) => {
      this.allTags = tags;
      this.filteredTags = this.submitForm.valueChanges.pipe(
        startWith(''),
        map(() => this.filterTags('')),
      );
    });

    this.categoryService.getCategories().subscribe((categories) => {
      this.allCategories = categories;
    });
  }

  get sourceLinks(): FormArray {
    return this.submitForm.get('sourceLinks') as FormArray;
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

  onSubmit() {
    if (this.submitForm.invalid) return;

    this.postService
      .submitPost(
        this.submitForm.value,
        this.selectedTags,
        this.highlightBoxes,
        false, // isAdmin = false → anonymous submission
      )
      .subscribe(() => {
        this.submitForm.reset();
        this.sourceLinks.clear();
        this.sourceLinks.push(this.fb.control('', Validators.required));
        this.selectedTags = [];
        this.highlightBoxes = [];
        this.showBanner.set(true);
        setTimeout(() => this.showBanner.set(false), 7000);
      });
  }
}
