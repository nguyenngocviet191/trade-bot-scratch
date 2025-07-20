import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const quote_list_mock = [
    { short: "The only limit to our realization of tomorrow is our doubts of today.", explain: "abc" },
    { short: "TAsasy.", explain: "abc" },
]

export default function QuotePage() {
    return (
        <div className="flex flex-col w-full/2 max-w-4xl mx-auto p-4 ">
            {quote_list_mock.map((quote, i) => (
                <Accordion type="single" collapsible key={i} className="border-1 corner rounded-md mb-2 p-2">
                    <AccordionItem value={`item-${i}`}>
                        <AccordionTrigger>{quote.short}</AccordionTrigger>
                        <AccordionContent>
                            {quote.explain}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            ))}
        </div>
    );
}  