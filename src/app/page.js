import { CiCirclePlus } from "react-icons/ci";

export default function Home() {
  return (
    <main className="min-h-screen w-[90%] max-w-2xl mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl text-center font-bold mb-4">
        Detect AI-Generated Text
        <br />
        Instantly and Accurately
      </h1>

      <p className="text-gray-700 text-center">
        Paste, type, or upload a PDF to find out if the content was written by
        AI or a human
      </p>

      {/* Text Input Area */}
      <div className="mt-4 py-4 w-full border bg-neutral-100 border-gray-300 rounded-2xl focus-within:outline-2 focus-within:outline-blue-500">
        <form>
          <textarea
            id="inputText"
            className="px-4 h-24 w-full resize-none focus-visible:outline-none"
            placeholder="Paste or type your text here..."
          />
        </form>
        <div className="px-4 flex justify-between items-center">
          <div className="flex items-center cursor-pointer text-gray-500 hover:text-gray-700">
            <CiCirclePlus className="text-lg" />
            <span className="ml-2">Upload PDF</span>
          </div>
          <button className="bg-blue-500 text-white px-4 py-1 rounded-full">
            Detect AI
          </button>
        </div>
      </div>
    </main>
  );
}
