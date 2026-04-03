import { pipeline } from '@huggingface/transformers';

export class LocalEmbeddings {
    private pipe: any = null;
    private model: string = 'Xenova/all-MiniLM-L6-v2';

    async init() {
        if (!this.pipe) {
            console.log(`[LocalEmbeddings] Loading model ${this.model}...`);
            this.pipe = await pipeline('feature-extraction', this.model);
            console.log(`[LocalEmbeddings] Model loaded.`);
        }
    }

    async embedQuery(text: string): Promise<number[]> {
        await this.init();
        const output = await this.pipe(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    async embedDocuments(texts: string[]): Promise<number[][]> {
        await this.init();
        const results: number[][] = [];
        for (const text of texts) {
            const output = await this.pipe(text, { pooling: 'mean', normalize: true });
            results.push(Array.from(output.data));
        }
        return results;
    }
}
