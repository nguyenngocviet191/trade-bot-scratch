import React from 'react';
import { Terminal } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
const Report = () => {
  return (<>
   <div className="p-4 text-xl">📑 Report Page</div>
   <Alert>
      <Terminal className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  </>);
};


export default Report;
