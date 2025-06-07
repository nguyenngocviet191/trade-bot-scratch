export default function Header({ username }: { username: string }) {
    return (
      <header className="bg-gray-900 text-white px-6 py-3 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">🌐 Tradehub</h1>
        <div className="text-sm">
          👋 Welcome, <span className="font-semibold">{username}</span>
        </div>
      </header>
    );
  }