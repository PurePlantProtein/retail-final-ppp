
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Copy } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generateSecureOrderReference } from '@/utils/securityUtils';

interface BankTransferInstructionsProps {
  amount: number;
  orderId: string;
}

const BankTransferInstructions: React.FC<BankTransferInstructionsProps> = ({
  amount,
  orderId
}) => {
  const { toast } = useToast();
  const referenceCode = React.useMemo(() => generateSecureOrderReference(), []);

  const bankDetails = {
    accountName: "JMP Foods Pty Ltd",
    bsb: "484-799",
    accountNumber: "611680986",
    bankName: "Suncorp Bank"
  };
  
  const handleCopyReference = () => {
    navigator.clipboard.writeText(referenceCode);
    toast({
      title: "Reference copied",
      description: "The payment reference has been copied to clipboard.",
    });
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> 
              Bank Transfer Payment
            </CardTitle>
            <CardDescription>
              Secure payment via bank transfer
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="font-semibold text-xl">{formatCurrency(amount)}</p>
            <p className="text-sm text-muted-foreground">Order #{orderId}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <Alert className="bg-primary/10">
          <AlertTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Important Instructions
          </AlertTitle>
          <AlertDescription className="mt-2">
            Please use the exact reference code when making your transfer to ensure your payment is properly assigned to your order.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium text-sm mb-1">Bank Name</p>
            <p className="p-2 bg-muted rounded">{bankDetails.bankName}</p>
          </div>
          
          <div>
            <p className="font-medium text-sm mb-1">Account Name</p>
            <p className="p-2 bg-muted rounded">{bankDetails.accountName}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-sm mb-1">BSB</p>
              <p className="p-2 bg-muted rounded">{bankDetails.bsb}</p>
            </div>
            
            <div>
              <p className="font-medium text-sm mb-1">Account Number</p>
              <p className="p-2 bg-muted rounded">{bankDetails.accountNumber}</p>
            </div>
          </div>
          
          <div>
            <p className="font-medium text-sm mb-1">Payment Reference (Required)</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 p-2 bg-primary/10 border border-primary/20 rounded font-mono text-sm">
                {referenceCode}
              </p>
              <Button size="sm" variant="outline" onClick={handleCopyReference}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
            </div>
          </div>
          
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            You'll also receive an invoice from XERO.
          </div>
        </div>
        
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium">Next Steps:</p>
          <ol className="mt-2 text-sm space-y-2 pl-5 list-decimal">
            <li>Make the bank transfer using the details above.</li>
            <li>Include the payment reference in your transfer.</li>
            <li>Your order will be processed once payment is confirmed (typically 1-2 business days).</li>
            <li>You'll receive an email confirmation when your payment is received.</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankTransferInstructions;
