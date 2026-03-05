export function formatGpa(gpa: number): string {
  return gpa.toFixed(2);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    interview: "Interview",
    accepted: "Accepted",
    rejected: "Rejected",
  };
  return labels[status] ?? status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    interview: "bg-blue-100 text-blue-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800";
}
