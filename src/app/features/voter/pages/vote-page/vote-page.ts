import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VoteService } from '../../../../core/services/vote.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivityService } from '../../../../core/services/activity.service';

@Component({
  selector: 'app-vote-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vote-page.html',
})
export class VotePage implements OnInit {

  private voteService = inject(VoteService);
  private authService = inject(AuthService);
  private activityService = inject(ActivityService);

  scores = Array.from({ length: 11 }, (_, i) => i);
  selectedScore = signal<number | null>(null);

  // Estados de control
  isInitialLoading = signal(true);
  isSubmitting = signal(false);
  alreadyVoted = signal(false);
  voteSubmitted = signal(false);

  ngOnInit(): void {
    // Validamos el estado apenas carga el componente
    this.voteService.checkIfVoted().subscribe({
      next: () => {
        this.alreadyVoted.set(this.voteService.hasVoted());
        this.isInitialLoading.set(false); // Liberamos la UI
      },
      error: () => {
        this.alreadyVoted.set(false);
        this.isInitialLoading.set(false);
      }
    });
  }

  selectScore(score: number): void {
    this.selectedScore.set(score);
  }

  submitVote(): void {
    const score = this.selectedScore();
    if (score === null || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const voteRequest = { score }

    this.voteService.createVote(voteRequest).subscribe({
      next: () => {
        this.voteSubmitted.set(true);
        this.alreadyVoted.set(true);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const apiErrors = err?.apiErrors;
        const message = apiErrors?.[0]?.message || 'Error al guardar el voto';
        alert(message);
      }
    });
  }

  logout(): void {
    this.activityService.stop();
    this.authService.logout();
  }
}
