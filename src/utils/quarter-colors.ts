export function getQuarterColor(quarter: string) {
  if (quarter === 'Q1') return 'bg-blue-100 text-blue-800';
  if (quarter === 'Q2') return 'bg-green-100 text-green-800';
  if (quarter === 'Q3') return 'bg-yellow-100 text-yellow-800';
  if (quarter === 'Q4') return 'bg-purple-100 text-purple-800';
  return 'bg-purple-100 text-purple-800';
}
