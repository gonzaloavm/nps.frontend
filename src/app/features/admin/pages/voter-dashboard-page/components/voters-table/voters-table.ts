import { Component, computed, input, signal } from '@angular/core';
import { VoterDto } from '../../../../../../core/models/nps-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-voters-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './voters-table.html',
  styleUrl: './voters-table.css',
})
export class VotersTable {

  voters = input.required<VoterDto[]>();
  isLoading = input<boolean>(false);
  searchTerm = signal<string>('');

  filteredVoters = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.voters();

    return this.voters().filter(v =>
      v.username.toLowerCase().includes(term) ||
      v.role.toLowerCase().includes(term)
    );
  });
}
