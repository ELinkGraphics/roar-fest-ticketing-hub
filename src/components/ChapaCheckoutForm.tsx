import { useRef } from "react";

interface ChapaCheckoutFormProps {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  quantity: number;
  currentTicket: any;
  transactionRef: string;
}

const ChapaCheckoutForm = ({ customerInfo, quantity, currentTicket, transactionRef }: ChapaCheckoutFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  
  const totalAmount = Number(currentTicket.price) * quantity;
  const [firstName, lastName] = customerInfo.name.split(' ');

  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <div className="space-y-4">
      <form 
        ref={formRef}
        method="POST" 
        action="https://api.chapa.co/v1/hosted/pay"
        className="hidden"
      >
        <input type="hidden" name="public_key" value="CHAPUBK_TEST-r6DRMHBCUseMCZJcj5YosaNd2OfzjYRP" />
        <input type="hidden" name="tx_ref" value={transactionRef} />
        <input type="hidden" name="amount" value={totalAmount.toString()} />
        <input type="hidden" name="currency" value="ETB" />
        <input type="hidden" name="email" value={customerInfo.email} />
        <input type="hidden" name="first_name" value={firstName || customerInfo.name} />
        <input type="hidden" name="last_name" value={lastName || ""} />
        <input type="hidden" name="title" value={`${currentTicket.event_name} - Ticket Purchase`} />
        <input type="hidden" name="description" value={`${quantity} ticket(s) for ${currentTicket.event_name}`} />
        <input type="hidden" name="logo" value="https://chapa.link/asset/images/chapa_swirl.svg" />
        <input type="hidden" name="callback_url" value={`${window.location.origin}/payment-callback`} />
        <input type="hidden" name="return_url" value={`${window.location.origin}/payment-success?tx_ref=${transactionRef}`} />
        <input type="hidden" name="meta[ticket_quantity]" value={quantity.toString()} />
        <input type="hidden" name="meta[event_name]" value={currentTicket.event_name} />
      </form>
      
      <button
        onClick={handleSubmit}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Pay {totalAmount} ETB with Chapa
      </button>
    </div>
  );
};

export default ChapaCheckoutForm;