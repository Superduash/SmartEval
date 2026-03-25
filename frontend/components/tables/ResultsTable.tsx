import { ResultItem } from "@/types";
import { Table } from "@/components/ui";

interface ResultsTableProps {
  rows: ResultItem[];
}

export function ResultsTable({ rows }: ResultsTableProps) {
  return (
    <Table headers={["Result ID", "Exam ID", "Student ID", "Marks", "Feedback"]}>
        {rows.map((item) => (
          <tr key={item.id}>
            <td className="px-6 py-4">{item.id}</td>
            <td className="px-6 py-4">{item.exam_id}</td>
            <td className="px-6 py-4">{item.student_id}</td>
            <td className="px-6 py-4">{item.marks}</td>
            <td className="px-6 py-4">{item.feedback.slice(0, 90)}...</td>
          </tr>
        ))}
    </Table>
  );
}
