import { render, screen } from "@testing-library/react";

import { StatCard } from "@/components/dashboard/StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Average Marks" value="82%" trend="+2.1" />);

    expect(screen.getByText("Average Marks")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("+2.1")).toBeInTheDocument();
  });
});
