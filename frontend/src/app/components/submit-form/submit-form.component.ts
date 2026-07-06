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

  editingHighlight: WritableSignal<{ boxIndex: number; itemIndex: number; value: string } | null> =
    signal(null);

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

  startEditHighlightItem(boxIndex: number, itemIndex: number) {
    this.editingHighlight.set({
      boxIndex,
      itemIndex,
      value: this.highlightBoxes[boxIndex][itemIndex],
    });
    // Focus the input after it appears – dynamic ID as before
    setTimeout(() => {
      const el = document.getElementById(
        `highlight-input-${boxIndex}-${itemIndex}`,
      ) as HTMLInputElement;
      el?.focus();
    }, 0);
  }

  saveEditHighlightItem() {
    const highlight = this.editingHighlight();
    if (!highlight) return;
    const { boxIndex, itemIndex, value } = highlight;
    const trimmed = value.trim();
    if (trimmed) {
      this.highlightBoxes[boxIndex][itemIndex] = trimmed;
    } else {
      this.highlightBoxes[boxIndex].splice(itemIndex, 1);
    }
    this.editingHighlight.set(null);
  }

  cancelEditHighlightItem() {
    this.editingHighlight.set(null);
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

  onEnter(event: Event) {
    const keyEvent = event as KeyboardEvent;
    // Only intercept if the target is a normal input/textarea/button, not on the submit button itself
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' && target.getAttribute('type') === 'submit') {
      return; // let the submit happen normally
    }

    // Prevent the form from being submitted
    event.preventDefault();

    // Find all focusable elements inside the form

    const form = target.closest('form');
    if (!form) return;

    const focusableSelectors = [
      'input:not([type=hidden]):not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'button:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    const elements = Array.from(
      form.querySelectorAll<HTMLElement>(focusableSelectors.join(',')),
    ).filter((el) => el.offsetParent !== null); // only visible elements

    const currentIndex = elements.indexOf(target);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= elements.length) {
      nextIndex = 0; // wrap to first
    }
    elements[nextIndex]?.focus();
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
