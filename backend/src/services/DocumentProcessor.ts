import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { Document as LangChainDocument } from "@langchain/core/documents";

import * as fs from 'fs/promises';
import * as path from 'path';

export class DocumentProcessor {
    async processFile(filePath: string): Promise<LangChainDocument[]> {
        const ext = path.extname(filePath).toLowerCase();

        let loader;
        if (ext === '.pdf') {
            loader = new PDFLoader(filePath);
        } else if (ext === '.docx' || ext === '.doc') {
            loader = new DocxLoader(filePath);
        } else if (ext === '.txt' || ext === '.md') {
            const raw = await fs.readFile(filePath, 'utf8');
            return [
                new LangChainDocument({
                    pageContent: raw,
                    metadata: {
                        source: path.basename(filePath),
                    },
                }),
            ];
        } else {
            throw new Error(`Unsupported file type: ${ext}`);
        }

        try {
            const docs = await loader.load();
            // Ensure source is tracked
            docs.forEach((doc: LangChainDocument) => {
                doc.metadata.source = path.basename(filePath);
            });
            return docs;
        } catch (error) {
            console.error(`Error loading file ${filePath}:`, error);
            throw error;
        }
    }

    async processBuffer(buffer: Buffer, filename: string): Promise<LangChainDocument[]> {
        // Write to a temporary file because many LangChain loaders require a file path
        const tempPath = path.join('/tmp', filename);
        await fs.writeFile(tempPath, buffer);

        try {
            return await this.processFile(tempPath);
        } finally {
            await fs.unlink(tempPath).catch(() => { });
        }
    }
}

export const documentProcessor = new DocumentProcessor();
