import { mockJobs } from '@/data/mockJobs';
import JobDetailClient from './JobDetailClient';

export function generateStaticParams() {
  return mockJobs.map((job) => ({
    id: job.id,
  }));
}

export default function JobDetailPage() {
  return <JobDetailClient />;
}
