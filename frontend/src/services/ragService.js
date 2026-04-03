import apiClient from './apiClient';

/**
 * Service to handle RAG-related operations (Chat, Ingestion, Crawling)
 */
const ragService = {
    /**
     * Send a query to the RAG engine
     */
    async chat(query, sessionId = 'default', companyId = null) {
        const response = await apiClient.post('/rag/chat', {
            query,
            sessionId,
            companyId
        });
        return response.data;
    },

    /**
     * Start a website crawl
     */
    async startCrawl(url, maxDepth = 2, useAdvanced = false) {
        const endpoint = useAdvanced ? '/rag/crawl/advanced' : '/rag/crawl';
        const response = await apiClient.post(endpoint, {
            url,
            maxDepth
        });
        return response.data;
    },

    /**
     * Upload and process a document (PDF, DOCX, etc.)
     */
    async uploadDocument(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/rag/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default ragService;
