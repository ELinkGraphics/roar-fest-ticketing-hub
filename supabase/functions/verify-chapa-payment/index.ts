import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tx_ref } = await req.json();

    if (!tx_ref) {
      throw new Error("Transaction reference is required");
    }

    console.log(`Verifying payment for transaction: ${tx_ref}`);

    // Verify payment with Chapa API
    const chapaResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer CHASECK_TEST-utAnzSuRpYrY3Of0GuRgFxrrDDs06OU9`,
        "Content-Type": "application/json",
      },
    });

    if (!chapaResponse.ok) {
      throw new Error(`Chapa API error: ${chapaResponse.status}`);
    }

    const chapaData = await chapaResponse.json();
    console.log("Chapa verification response:", chapaData);

    // Initialize Supabase client with service role for database updates
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update purchase record with payment details
    const paymentStatus = chapaData.status === "success" ? "completed" : "failed";
    
    const { data: updateData, error: updateError } = await supabaseService
      .from("purchases")
      .update({
        payment_status: paymentStatus,
        chapa_transaction_id: chapaData.data?.id || null,
      })
      .eq("transaction_reference", tx_ref)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating purchase:", updateError);
      throw new Error("Failed to update purchase record");
    }

    console.log("Updated purchase record:", updateData);

    return new Response(JSON.stringify({
      success: true,
      payment_status: paymentStatus,
      chapa_data: chapaData,
      purchase: updateData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});