import React from "react";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
const Home = () => {
  return (
    <>
      <h1>🏠 Home Page</h1>
      
      <Button>Button</Button>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
    </>
  );
};

export default Home; // ✅ Đảm bảo có export default