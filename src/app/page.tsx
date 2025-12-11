import { GetStartedButton } from "@/components/GetStartedButton";

export default function Home() {
  return (
    <div className="p-10 bg-white text-black dark:bg-slate-800 dark:text-white h-full">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        {/* Header */}
        <div className="text-5xl font-bold">Welcome to Docubox</div>
        <div className="text-3xl font-medium">
          Manage, parse, and summarize your documents with ease.
        </div>

        {/* Description */}
        <div className="text-lg text-gray-700 dark:text-gray-300">
          Docubox helps you streamline document management with built-in tools
          for parsing and AI summarization. Upload, organize, and work with your
          files efficiently using our user-friendly platform.
        </div>

        {/* Features */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-md">
            <h3 className="text-xl font-semibold">File Management</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Easily upload, rename, and delete files in a simple interface
              designed for productivity.
            </p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-md">
            <h3 className="text-xl font-semibold">Document Parsing</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automatically parse documents using the Unstructured API to
              extract relevant content.
            </p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-md">
            <h3 className="text-xl font-semibold">AI Summarization</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use AI to generate concise and accurate summaries of your parsed
              documents.
            </p>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-md">
            <h3 className="text-xl font-semibold">More Features Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {`We're working on additional tools to help you prepare for an efficient Retrieval-Augmented Generation (RAG) pipeline.`}
            </p>
          </div>
        </div>

        {/* Get Started Button */}
        <GetStartedButton />
      </div>
    </div>
  );
}
