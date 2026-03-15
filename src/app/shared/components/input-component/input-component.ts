import { CommonModule } from '@angular/common';
import { Component, computed, input, Input, Optional, Self, signal } from '@angular/core';
import { ReactiveFormsModule, ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-component.html',
  styleUrl: './input-component.css',
})
export class InputComponent implements ControlValueAccessor{

  hasErrorSignal() {
    throw new Error('Method not implemented.');
  }
  disabledSignal() {
    throw new Error('Method not implemented.');
  }

  @Input() label = '';
  type = input<string>('text');
  @Input() placeholder = '';
  @Input() id = `input-${Math.random().toString(36).substring(2, 9)}`;
  @Input() hint = ''; // Nuevo Input para el texto de ayuda
  @Input() showErrors = true;
  @Input() customErrors: Record<string, string> = {};

  value: any = '';
  disabled = signal(false);
  passwordVisible = signal(false);

  constructor(@Self() @Optional() public controlDir: NgControl) {
    if (this.controlDir) {
      this.controlDir.valueAccessor = this;
    }
  }

  // Clases de Tailwind puras
  inputClasses = computed(() => {
    return {
      'border-red-500 focus:ring-2 focus:ring-red-500/20': this.hasError(),
      'border-slate-200 focus:ring-2 focus:ring-indigo-500': !this.hasError(),
      'bg-slate-50 text-slate-400 cursor-not-allowed': this.disabled(),
      'bg-white text-slate-900': !this.disabled(),
      'pr-12': this.type() === 'password'
    };
  });

  hasError = computed(() => {
    if (!this.showErrors) return false;
    return !!(this.controlDir?.invalid && (this.controlDir?.dirty || this.controlDir?.touched));
  });

  get errorMessage(): string {
    const errors = this.controlDir?.errors;
    if (!errors) return '';

    const firstError = Object.keys(errors)[0];

    // Prioridad: Mensaje enviado desde el padre específicamente para este input
    if (this.customErrors[firstError]) return this.customErrors[firstError];

    // Fallback: Mensajes genéricos del sistema
    const defaultMessages: Record<string, string> = {
      required: 'Campo obligatorio.',
      email: 'Email inválido.'
    };

    return defaultMessages[firstError] || 'Dato no válido.';
  }

  get currentType(): string {
    if (this.type() !== 'password') return this.type();
    return this.passwordVisible() ? 'text' : 'password';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.set(!this.passwordVisible());
  }

  // --- Implementación CVA ---
  writeValue(val: any): void { this.value = val; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  onChange: any = () => {};
  onTouched: any = () => {};

  handleInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.onChange(val);
  }
}
