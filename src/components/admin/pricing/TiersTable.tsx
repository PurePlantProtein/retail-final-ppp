
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
import { Card, CardContent } from "@/components/ui/card";
import { PencilIcon, TrashIcon } from "lucide-react";
import { PricingTier } from '@/types/pricing';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {tiers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No pricing tiers found. Create your first tier.</p>
            </CardContent>
          </Card>
        ) : (
          tiers.map((tier) => (
            <Card key={tier.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg">{tier.name}</h3>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditClick(tier)}
                      className="flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteClick(tier)}
                      className="flex items-center gap-2 text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of pricing tiers in the system.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4">
                No pricing tiers found. Create your first tier.
              </TableCell>
            </TableRow>
          ) : (
            tiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium">{tier.name}</TableCell>
                <TableCell>{tier.description}</TableCell>
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
