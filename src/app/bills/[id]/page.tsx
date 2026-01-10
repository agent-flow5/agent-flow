import { mockBills } from '@/data/mockBills';
import BillDetailClient from './BillDetailClient';

export function generateStaticParams() {
  return mockBills.map((bill) => ({
    id: bill.id,
  }));
}

export default function BillDetailPage() {
  return <BillDetailClient />;
}
