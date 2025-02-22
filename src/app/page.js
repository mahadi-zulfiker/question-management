import HomePage from "./homePage/page";

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Constrain content to a max width */}
      <div className="container mx-auto max-w-full">
        <HomePage />
      </div>
    </div>
  );
}