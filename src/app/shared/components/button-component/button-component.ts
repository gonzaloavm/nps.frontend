import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button-component.html',
  styleUrl: './button-component.css',
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'submit';
  @Input() disabled = false;
  @Input() isLoading = false;
  @Input() variant: 'primary' | 'danger' | 'ghost' = 'primary';

  get buttonClasses(): string {
    const variants = {
      primary: "bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 disabled:shadow-none",
      danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300",
      ghost: "bg-transparent hover:bg-slate-100 text-slate-600 shadow-none border border-slate-200"
    };

    return `${variants[this.variant]}`;
  }
}
