import { fireEvent, render } from "@testing-library/react";

import { UploadDropzone } from "@/components/dashboard/UploadDropzone";

describe("UploadDropzone", () => {
  it("handles file selection", () => {
    const onFileSelect = jest.fn();
    const { container } = render(<UploadDropzone label="Answer Sheet" onFileSelect={onFileSelect} />);

    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["hello"], "answer.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledTimes(1);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
