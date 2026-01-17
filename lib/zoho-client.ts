

interface ZohoConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    refreshToken: string;
}

interface ZohoTokenResponse {
    access_token: string;
    expires_in: number;
    api_domain: string;
    token_type: string;
}

interface CustomerInput {
    name: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    code?: string;
    vatNumber?: string;
}

export class ZohoClient {
    private config: ZohoConfig;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        this.config = {
            clientId: process.env.ZOHO_CLIENT_ID || "",
            clientSecret: process.env.ZOHO_CLIENT_SECRET || "",
            redirectUri: process.env.ZOHO_REDIRECT_URI || "",
            refreshToken: process.env.ZOHO_REFRESH_TOKEN || "",
        };
    }

    private async getAccessToken(): Promise<string> {
        // Return existing token if valid
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        if (!this.config.refreshToken) {
            throw new Error("Zoho Refresh Token is missing. Configure ZOHO_REFRESH_TOKEN env var.");
        }

        // Refresh token
        try {
            const url = `https://accounts.zoho.com/oauth/v2/token?refresh_token=${this.config.refreshToken}&client_id=${this.config.clientId}&client_secret=${this.config.clientSecret}&grant_type=refresh_token`;

            const response = await fetch(url, { method: "POST" });
            const data: ZohoTokenResponse = await response.json();

            if (!data.access_token) {
                console.error("Failed to refresh Zoho token:", data);
                throw new Error("Failed to refresh Zoho token");
            }

            this.accessToken = data.access_token;
            // Set expiry slightly before actual expiry (usually 1 hour) to be safe
            this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

            console.log("Zoho access token refreshed successfully");
            return this.accessToken;
        } catch (error) {
            console.error("Error refreshing Zoho token:", error);
            throw error;
        }
    }

    async getContacts(lastModifiedTime?: Date): Promise<Record<string, unknown>[]> {
        const token = await this.getAccessToken();
        const url = "https://www.zohoapis.com/crm/v2/Contacts";

        // Add headers for modified since if provided
        const headers: Record<string, string> = {
            "Authorization": `Zoho-oauthtoken ${token}`,
        };

        if (lastModifiedTime) {
            headers["If-Modified-Since"] = lastModifiedTime.toISOString();
        }

        try {
            const response = await fetch(url, { headers });

            if (response.status === 304) {
                console.log("No contacts modified since last sync");
                return [];
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Zoho API Error: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error("Error fetching Zoho contacts:", error);
            return [];
        }
    }

    async createContact(customer: CustomerInput): Promise<string> {
        const token = await this.getAccessToken();

        const zohoContact = {
            Last_Name: customer.name.split(" ").pop() || customer.name,
            First_Name: customer.name.split(" ").slice(0, -1).join(" ") || "",
            Email: customer.email,
            Phone: customer.phone,
            Mailing_Street: customer.address,
            Account_Name: customer.company ? { name: customer.company } : null,
            // Custom fields mapping
            Customer_Code: customer.code,
            VAT_Number: customer.vatNumber
        };

        const response = await fetch("https://www.zohoapis.com/crm/v2/Contacts", {
            method: "POST",
            headers: {
                "Authorization": `Zoho-oauthtoken ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: [zohoContact] })
        });

        const result = await response.json();
        if (result.data && result.data[0].status === "success") {
            return result.data[0].details.id;
        } else {
            throw new Error(`Failed to create contact in Zoho: ${JSON.stringify(result)}`);
        }
    }

    async updateContact(zohoId: string, customer: CustomerInput): Promise<boolean> {
        const token = await this.getAccessToken();

        const zohoContact = {
            id: zohoId,
            Last_Name: customer.name.split(" ").pop() || customer.name,
            First_Name: customer.name.split(" ").slice(0, -1).join(" ") || "",
            Email: customer.email,
            Phone: customer.phone,
            Mailing_Street: customer.address,
            // Account name typically handled separately if linked
            VAT_Number: customer.vatNumber
        };

        const response = await fetch("https://www.zohoapis.com/crm/v2/Contacts", {
            method: "PUT",
            headers: {
                "Authorization": `Zoho-oauthtoken ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: [zohoContact] })
        });

        const result = await response.json();
        return result.data && result.data[0].status === "success";
    }
}

export const zohoClient = new ZohoClient();
