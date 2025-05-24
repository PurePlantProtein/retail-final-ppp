
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { PricingTier } from '@/types/pricing';

interface TiersTableProps {
  tiers: PricingTier[];
  onEditClick: (tier: PricingTier) => void;
  onDeleteClick: (tier: PricingTier) => void;
}

const TiersTable: React.FC<TiersTableProps> = ({
  tiers,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of pricing tiers in the system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Discount %</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No pricing tiers found. Create your first tier.
              </TableCell>
            </TableRow>
          ) : (
            tiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium">{tier.name}</TableCell>
                <TableCell>{tier.description}</TableCell>
                <TableCell>{tier.discount_percentage}%</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditClick(tier)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClick(tier)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TiersTable;
