import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const PINATA_API_KEY = "c1c949e84a8c7dccf713";
const PINATA_SECRET_API_KEY = "b39b685fb57cb355e299e84e59fa213d56998b4c94da145bf8e569001859176e";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const targetUrl = url.searchParams.get("url");

      if (!targetUrl) {
        return new Response("Missing URL parameter", { 
          status: 400,
          headers: corsHeaders 
        });
      }

      const response = await fetch(targetUrl);
      const contentType = response.headers.get("content-type");
      
      if (!contentType?.startsWith("image/")) {
        return new Response("Invalid image format", { 
          status: 400,
          headers: corsHeaders 
        });
      }

      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": contentType
        }
      });
    } else if (req.method === "POST") {
      const formData = await req.formData();
      
      // Get file from form data
      const file = formData.get('file');
      if (!file || !(file instanceof Blob)) {
        throw new Error('No file provided');
      }

      // Create Pinata form data
      const pinataFormData = new FormData();
      pinataFormData.append('file', file);

      // Upload to Pinata
      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY
        },
        body: pinataFormData,
      });

      if (!pinataResponse.ok) {
        throw new Error(`Pinata upload failed: ${await pinataResponse.text()}`);
      }

      const pinataData = await pinataResponse.json();
      const ipfsHash = pinataData.IpfsHash;

      // Create metadata
      const metadata = {
        name: formData.get('name'),
        symbol: formData.get('symbol'),
        description: formData.get('description'),
        image: `ipfs://${ipfsHash}`,
      };

      // Optional fields
      ['twitter', 'telegram', 'website'].forEach(field => {
        const value = formData.get(field);
        if (value) metadata[field] = value;
      });

      // Upload metadata to Pinata
      const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY
        },
        body: JSON.stringify(metadata),
      });

      if (!metadataResponse.ok) {
        throw new Error(`Failed to upload metadata: ${await metadataResponse.text()}`);
      }

      const metadataResult = await metadataResponse.json();

      return new Response(
        JSON.stringify({
          success: true,
          metadata,
          metadataUri: `ipfs://${metadataResult.IpfsHash}`,
        }), 
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});