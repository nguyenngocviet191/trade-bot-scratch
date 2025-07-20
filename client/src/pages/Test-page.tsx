// app/components/ProgressBarDemo.tsx
// "use client"

import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

// const progress =50
export default function ProgressBarDemo() {
  const [progress, setProgress] = useState(10)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full max-w-md p-6 mx-auto space-y-4">
      <h2 className="text-xl font-bold">Progress Demo</h2>
      <Progress value={30} className="bg-black-500" />
        
      <p>{progress}% completed</p>
    </div>
  )
}
// import {Progress} from "@heroui/react";

// export default function App() {
//   return <Progress aria-label="Loading..." className="max-w-md" value={60} />;
// }
