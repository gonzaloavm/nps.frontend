import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { VoterDto } from '../../../../core/models/nps-model';
import { NpsService } from '../../../../core/services/nps.service';
import { VoterRegistration } from './components/voter-registration/voter-registration';
import { VotersTable } from './components/voters-table/voters-table';

@Component({
  selector: 'app-voter-dashboard-page',
  imports: [CommonModule, VoterRegistration, VotersTable],
  templateUrl: './voter-dashboard-page.html',
  styleUrl: './voter-dashboard-page.css',
})
export class VoterDashboardPage {
  private npsService = inject(NpsService);

  // Estado centralizado para los hijos
  voters = signal<VoterDto[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadVoters();
  }

  loadVoters(): void {
    this.isLoading.set(true);
    this.npsService.getVotersList().subscribe({
      next: (res) => {
        this.voters.set(res.data!);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al sincronizar el censo:', err);
        this.isLoading.set(false);
      }
    });
  }
}
