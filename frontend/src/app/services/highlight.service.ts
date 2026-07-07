import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable()
export class HighlightService {
  // The main highlight boxes array
  highlightBoxes: WritableSignal<string[][]> = signal([]);

  // Inline editing state
  editingHighlight = signal<{ boxIndex: number; itemIndex: number; value: string } | null>(null);

  // ---------- Box / Item CRUD ----------
  addHighlightBox() {
    if (this.highlightBoxes().length < 3) {
      this.highlightBoxes.update((boxes) => [...boxes, []]);
    }
  }

  removeHighlightBox(index: number) {
    this.highlightBoxes.update((boxes) => {
      const updated = [...boxes];
      updated.splice(index, 1);
      return updated;
    });
  }

  addHighlightItem(boxIndex: number, input: HTMLInputElement) {
    const value = input.value.trim();
    if (value && this.highlightBoxes()[boxIndex].length < 4) {
      this.highlightBoxes.update((boxes) => {
        const updated = boxes.map((box, i) => (i === boxIndex ? [...box, value] : box));
        return updated;
      });
      input.value = '';
    }
  }

  autoResizeTextarea(id: string) {
    setTimeout(() => {
      const el = document.getElementById(id) as HTMLTextAreaElement;
      if (el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      }
    }, 0);
  }

  removeHighlightItem(boxIndex: number, itemIndex: number) {
    this.highlightBoxes.update((boxes) => {
      const updated = boxes.map((box, i) => {
        if (i === boxIndex) {
          const newBox = [...box];
          newBox.splice(itemIndex, 1);
          return newBox;
        }
        return box;
      });
      return updated;
    });
  }

  // ---------- Inline editing ----------
  startEditHighlightItem(boxIndex: number, itemIndex: number) {
    const boxes = this.highlightBoxes();
    if (boxes[boxIndex] && boxes[boxIndex][itemIndex] !== undefined) {
      this.editingHighlight.set({
        boxIndex,
        itemIndex,
        value: boxes[boxIndex][itemIndex],
      });
      setTimeout(() => {
        const id = `highlight-input-${boxIndex}-${itemIndex}`;
        const el = document.getElementById(id) as HTMLTextAreaElement;
        el?.focus();
        this.autoResizeTextarea(id);
      }, 0);
    }
  }

  saveEditHighlightItem() {
    const highlight = this.editingHighlight();
    if (!highlight) return;
    const { boxIndex, itemIndex, value } = highlight;
    const trimmed = value.trim();
    if (trimmed) {
      this.highlightBoxes.update((boxes) => {
        const updated = [...boxes];
        updated[boxIndex] = [...updated[boxIndex]];
        updated[boxIndex][itemIndex] = trimmed;
        return updated;
      });
    } else {
      // empty string → remove the item
      this.removeHighlightItem(boxIndex, itemIndex);
    }
    this.editingHighlight.set(null);
  }

  cancelEditHighlightItem() {
    this.editingHighlight.set(null);
  }

  /* updateHighlightValue(newVal: string) {
    // Update the signal with the new value so the UI reacts
    this.editingHighlight.update((current) => (current ? { ...current, value: newVal } : null));
  } */

  updateHighlightValue(newVal: string) {
    this.editingHighlight.update((current) => (current ? { ...current, value: newVal } : null));
    const highlight = this.editingHighlight();
    if (highlight) {
      const id = `highlight-input-${highlight.boxIndex}-${highlight.itemIndex}`;
      this.autoResizeTextarea(id);
    }
  }
}
