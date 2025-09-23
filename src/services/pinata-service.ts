'use server';

// IMPORTANT: Add PINATA_API_KEY and PINATA_SECRET_API_KEY to your .env file
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function uploadToPinata(file: File) {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
        console.warn("Pinata API keys not found. Returning placeholder. Please add them to your .env file.");
        return {
            success: true,
            url: `https://picsum.photos/seed/${Math.random()}/200`,
        };
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pinata API responded with status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return {
            success: true,
            url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        };
    } catch (error: any) {
        console.error('Error uploading to Pinata:', error);
        return { success: false, error: error.message || 'Failed to upload to Pinata.' };
    }
}
