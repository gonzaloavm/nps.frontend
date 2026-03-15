import { Component, signal } from '@angular/core';
import { NpsService } from '../../../../core/services/nps.service';
import { DecimalPipe } from '@angular/common';
import { NpsStatisticsResponse } from '../../../../core/models/nps-model';
import { extractProblemErrors } from '../../../../core/utils/problem-details-utils';

@Component({
  selector: 'app-results-page',
  imports: [DecimalPipe],
  templateUrl: './results-page.html',
  styleUrl: './results-page.css',
})
export class ResultsPage {

  result = signal<NpsStatisticsResponse | null>(null);
  loading = signal(true);

  constructor(private npsService: NpsService) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.loading.set(true);
    this.npsService.getStatistics().subscribe({
      next: (res) => {
        const data = res?.data;
        this.result.set(data ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        const apiErrors = err?.apiErrors ?? err?.original?.error?.errors ?? extractProblemErrors(err?.original?.error);
        console.error(apiErrors || err);
        this.loading.set(false);
      }
    });
  }
}
