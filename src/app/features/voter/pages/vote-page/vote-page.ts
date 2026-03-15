import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VoteService } from '../../../../core/services/vote.service';

@Component({
  selector: 'app-vote-page',
  imports: [],
  templateUrl: './vote-page.html',
  styleUrl: './vote-page.css',
})
export class VotePage {
  scores = Array.from({ length: 11 }, (_, i) => i); // 0..10
  selectedScore = signal<number | null>(null);
  alreadyVoted = signal(false);
  voteSubmitted = signal(false);

  constructor(private voteService: VoteService, private router: Router) {}

  ngOnInit(): void {
    this.voteService.checkIfVoted().subscribe({
      next: () => this.alreadyVoted.set(this.voteService.hasVoted()),
      error: () => this.alreadyVoted.set(false)
    });
  }

  selectScore(score: number): void {
    this.selectedScore.set(score);
  }

  submitVote(): void {
    const score = this.selectedScore();
    if (score === null) return;

    this.voteService.createVote(score).subscribe({
      next: () => {
        this.voteSubmitted.set(true);
        this.alreadyVoted.set(true);
      },
      error: (err) => {
        const apiErrors = err?.apiErrors ?? err?.original?.error?.errors ?? null;
        const firstMessage = Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors[0].message
          : err?.original?.error?.detail ?? err?.message;
        alert(firstMessage || 'Error al guardar voto');
      }
    });
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}
