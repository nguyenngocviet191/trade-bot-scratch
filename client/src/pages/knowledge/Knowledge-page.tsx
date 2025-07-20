import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from "@/components/ui/card";
import { AppWindowIcon, CodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom";
// import QuotePage from "@/pages/knowledge/Quote-page";

const knowledge_items = [
  { item_name: "Quote", item_des: "Quotes list ", item_page: "/knowledge/quote" },
  { item_name: "Network ", item_des: "Network ", item_page: "/knowledge/network" },
  { item_name: "Wiki ", item_des: "Wiki", item_page: "/knowledge/network" },
]
export default function KnowledgePage() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 m-4  min-w-[250px] ">
      {knowledge_items.map((item, index) => (
        <Card className="bg-teal-100 text-teal-900 w-20 h-20 p-2 items-center"
          onClick={() => navigate(item.item_page)}
          key={index}
        >
          <CardHeader>
            <CardTitle>{item.item_name}</CardTitle>
            {/* <CardDescription>{item.item_des}</CardDescription> */}
          </CardHeader>
          <CardContent>
            {/* {item.item_des} */}
          </CardContent>
          {/* <CardFooter className="flex justify-end">
            <Button variant="ghost" className="bg-blue-300">See more</Button>
          </CardFooter> */}
        </Card>
      ))}


      {/* Additional cards can be added here */}
    </div>
  )
}