import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  WritableSignal,
  signal,
  inject,
} from '@angular/core';
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
import { HighlightService } from '../../services/highlight.service';

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
  providers: [HighlightService],
})
export class SubmitFormComponent implements OnInit {
  submitForm!: FormGroup;
  selectedTags: string[] = [];
  allTags: string[] = [];
  filteredTags!: Observable<string[]>;
  allCategories: string[] = [];
  showBanner: WritableSignal<boolean> = signal(false);

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private tagService: TagService,
    private categoryService: CategoryService,
    public hs: HighlightService,
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

    this.categoryService.getCategories().subscribe((cats) => {
      this.allCategories = cats;
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

  // Tag chip methods (unchanged)
  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index >= 0) this.selectedTags.splice(index, 1);
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }
    if (this.tagInput) this.tagInput.nativeElement.value = '';
  }

  private filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allTags.filter(
      (tag) => tag.toLowerCase().includes(filterValue) && !this.selectedTags.includes(tag),
    );
  }

  // Enter key navigation (prevents form submission on fields)
  onEnter(event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' && target.getAttribute('type') === 'submit') return;
    event.preventDefault();
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
    ).filter((el) => el.offsetParent !== null);
    const currentIndex = elements.indexOf(target);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= elements.length) nextIndex = 0;
    elements[nextIndex]?.focus();
  }

  onSubmit() {
    if (this.submitForm.invalid) return;

    this.postService
      .submitPost(
        this.submitForm.value,
        this.selectedTags,
        this.hs.highlightBoxes(), // ✅ from the shared service
        false, // anonymous
      )
      .subscribe(() => {
        this.submitForm.reset();
        this.sourceLinks.clear();
        this.sourceLinks.push(this.fb.control('', Validators.required));
        this.selectedTags = [];
        this.hs.highlightBoxes.set([]); // reset highlights
        this.showBanner.set(true);
        setTimeout(() => this.showBanner.set(false), 7000);
      });
  }
}
