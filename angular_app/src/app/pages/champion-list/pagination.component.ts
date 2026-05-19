import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination">
      <button
        [disabled]="page === 1"
        (click)="onPageChange(1)"
        class="first-page-btn"
      >
        «
      </button>

      <button
        [disabled]="page === 1"
        (click)="onPageChange(page - 1)"
        class="prev-btn"
      >
        ‹
      </button>

      <span class="pagination-info">
        Page {{ page }} of {{ totalPages }}
      </span>

      <button
        [disabled]="page === totalPages"
        (click)="onPageChange(page + 1)"
        class="next-btn"
      >
        ›
      </button>

      <button
        [disabled]="page === totalPages"
        (click)="onPageChange(totalPages)"
        class="last-page-btn"
      >
        »
      </button>
    </div>
  `,
})
export class PaginationComponent {
  @Input() page: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }
}
