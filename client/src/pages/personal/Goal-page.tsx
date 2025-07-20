import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { Progress } from "@/components/ui/progress"
const stats = 
  {
    
        lvl : 1,
        balance: 100,
        income_passive: 50, // monthly income
        income_active: 200, // monthly income
        ratio_safe: 0.2, // 1 ~ 1 year
        expensive: 100, // monthly expense
        
    lvl_list: [
        {name :"lvl1",
            value : 100,
            balance :1000
        },
        {name :"lvl2",
            value : 500,
            balance :1000,
            income_passive: 100, // monthly income
        },
        {name :"lvl3",
            value : 1000,
        },
        {name :"lvl4",
            value : 1000,
        },
        {name :"lvl5",
            value : 1000,
        },
        ],
    rank: "Bronze",
  }
export default function lvlPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col h-50 md:h-20 bg-blue-100 ml-0 mt-0 shadow-md p-4 mb-4 sticky top-0">
          <div className="text-xl text-bold ">Cash $1000</div>
    
          <div className="text-xl text-bold">Rank {stats.rank}</div>
      </div>
      <div className="flex flex-row  overflow-x-auto scrollbar-hidden max-w-screen h-50 md:h-20  ml-0 mt-0 shadow-md p-4 mb-4">
          {stats.lvl_list.map((lvl, i) => (
                    <Card key={i} className={`w-30 h-30 ${stats.lvl === lvl.name ? 'bg-yellow-200' : 'bg-gray-100'} hover:bg-blue-200`}
                       onClick={() => alert(`You clicked ${lvl.name}`)}>
                      <CardHeader className="flex flex-row  justify-between ">
                        <CardTitle>{lvl.name}</CardTitle>
                        <Button variant="ghost" className=" ml-auto">{'+'}</Button>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm font-bold">{lvl.value}</div>
                        
                      </CardContent>
                    </Card>
                  ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 max-w-250">
         <div>lvl 1</div>
         <Progress value={30}/>
         <div>lvl 2</div>
         <Progress value={60}/>
         <Progress value={90}/>
         <Progress value={30}/>
      </div>
    </div>
  );
}  