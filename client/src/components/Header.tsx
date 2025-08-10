export default function Header({ username }: { username: string }) {
    return (
      <header className="w-full bg-gray-900 text-white h-8  shadow-md flex flex-row p-2 items-center">
        <h1 className="text-xl font-bold">Tradehub</h1>
        
        <div className="text-sm ml-auto ">
          👋 Welcome, <span className="font-semibold">{username}</span>
        </div>
       
      </header>
    );
  }