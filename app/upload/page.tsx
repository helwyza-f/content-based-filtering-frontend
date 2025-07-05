// app/upload/page.tsx

import UploadClient from "./upload-client";

export default function UploadPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Your Photo</h1>
      <UploadClient />
    </div>
  );
}
