import { WordpressSite, WordpressCategory } from "../types";

export const fetchWpCategories = async (site: WordpressSite): Promise<WordpressCategory[]> => {
    // Basic Auth Header using App Password
    const authString = btoa(`${site.username}:${site.appPassword}`);
    
    // Normalize URL (ensure no trailing slash)
    const baseUrl = site.url.replace(/\/$/, '');
    
    try {
        const response = await fetch(`${baseUrl}/wp-json/wp/v2/categories?per_page=100&hide_empty=0`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Erro ${response.status}: Falha ao buscar categorias.`);
        }

        const data = await response.json();
        return data as WordpressCategory[];
    } catch (error: any) {
        console.error("WP API Error:", error);
        throw new Error(error.message || "Falha na conexão com o WordPress.");
    }
};
