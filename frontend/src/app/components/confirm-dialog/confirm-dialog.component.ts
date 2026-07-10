import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Confirmar ação');
  message = input<string>('Tem certeza que deseja continuar?');
  confirmLabel = input<string>('Confirmar');
  cancelLabel = input<string>('Cancelar');
  variant = input<'primary' | 'danger'>('primary');
  loading = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    if (this.loading()) return;
    this.cancelled.emit();
  }
}
