import { StudentResultsPanel } from '@/components/student/student-results-panel';

export default function StudentResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading mb-2 text-3xl font-bold">My results</h2>
        <p className="text-muted-foreground">
          Results are locked behind a <strong>result checking PIN</strong> — the same PIN used on the public &quot;Check
          Results&quot; page. Get a PIN from the school office or the{' '}
          <a href="/pin-shop" className="text-primary underline">
            PIN shop
          </a>
          .
        </p>
      </div>
      <StudentResultsPanel />
    </div>
  );
}
