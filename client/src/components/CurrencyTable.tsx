import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {  Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {  Input}  from "@/components/ui/input"
interface Currency {
  symbol: string;
  base: string;
  close: number;
  change: number;
  percentChange: number;
}

interface CurrencyTableProps {
  currencies: Currency[];
  onCurrencyClick: (pair: string) => void;
  onAddPair: (symbol: string, base: string) => void;
}

const CurrencyTable: React.FC<CurrencyTableProps> = ({ currencies, onCurrencyClick, onAddPair }) => {
  const [newPair, setNewPair] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const handleAddPair = () => {
    const [symbol, base] = newPair.split("/");
    if (symbol && base) {
      onAddPair(symbol, base);
      setNewPair("");
      setShowPopup(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setShowPopup(true)} className="mb-4">+</Button>
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Currency Pair</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Symbol/Base (e.g., NEO/USDT)"
            value={newPair}
            onChange={(e) => setNewPair(e.target.value)}
            className="mb-4"//
          />
          <div className="flex justify-end">
            <Button onClick={handleAddPair} className="mr-2">Add</Button>
            <Button variant="destructive" onClick={() => setShowPopup(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pair</TableHead>
            <TableHead>Last</TableHead>
            <TableHead>Chg</TableHead>
            <TableHead>Chg%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies.map((currency) => (
            <TableRow key={`${currency.symbol}/${currency.base}`} onClick={() => onCurrencyClick(`${currency.symbol}/${currency.base}`)} className="cursor-pointer hover:bg-gray-200">
              <TableCell>{`${currency.symbol}/${currency.base}`}</TableCell>
              <TableCell>{currency.close.toFixed(2)}</TableCell>
              <TableCell>{currency.change.toFixed(2)}</TableCell>
              <TableCell>{currency.percentChange.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CurrencyTable;
