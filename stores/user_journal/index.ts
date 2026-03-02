import { Base } from "../base";
import { JournalTemplate, JournalTemplateResponse, Journal, UserJournalsResponse, CreateJournalRequest, LocalJournal } from "~/types/user_journal";
import { useSettingsStore } from "~/stores/stores/settings_store";

export class UserJournals extends Base {

    /**
     * Check if user has opted out of data collection (Qdrant indexing).
     * When data_collection is false, journals won't be indexed in Qdrant
     * and RAG-based AI features won't reference them.
     */
    private _shouldSkipAIIndexing(): boolean {
        try {
            const settingsStore = useSettingsStore();
            return !settingsStore.dataCollection;
        } catch {
            return false; // Default to indexing if store unavailable
        }
    }
    async getAllTemplates(): Promise<JournalTemplateResponse> {        
        // Keeping the typo matching the backend
        return this.fetch(`${this.config.base_url}/tempalte-gallary`)
    }

    async getJournalById(journalId: string): Promise<Journal> {
        return this.fetch(`${this.config.base_url}/journal?id=${journalId}`)
    }

    async getJournals(): Promise<UserJournalsResponse> {
        return this.fetch(`${this.config.base_url}/journals`)
    }

    async createJournal(journal: CreateJournalRequest): Promise<Journal> {
        return this.fetch(`${this.config.base_url}/journal`, {
            method: "POST",
            body: JSON.stringify({
                ...journal,
                skip_ai_indexing: this._shouldSkipAIIndexing(),
            })
        })
    }

    async updateJournal(journal: Journal): Promise<Journal> {
        return this.fetch(`${this.config.base_url}/journal`, {
            method: "PUT",
            body: JSON.stringify({
                ...journal,
                skip_ai_indexing: this._shouldSkipAIIndexing(),
            })
        })
    }


    async deleteJournal(journalId: string): Promise<void> {
        return this.fetch(`${this.config.base_url}/journal?id=${journalId}`, {
            method: "DELETE",
        })
    }

    /**
     * Sync local journal with server
     * Handles create/update based on server_id presence and conflict resolution
     * 
     * @param journal - Local journal to sync
     * @returns Server journal with server_id
     */
    async syncJournal(journal: LocalJournal): Promise<Journal> {
        try {
            // Prepare journal data for server (exclude local-only fields)
            const journalData = {
                id: journal.server_id, // Include server_id for updates
                collection_id: journal.collection_id,
                title: journal.title,
                content: journal.content,
                content_html: journal.content_html,
                mood_score: journal.mood_score,
                mood_label: journal.mood_label,
                created_at: journal.created_at,
                updated_at: journal.updated_at,
                skip_ai_indexing: this._shouldSkipAIIndexing(),
            };

            // If has server_id, it's an update
            if (journal.server_id) {
                try {
                    // Try to update existing journal
                    const response = await this.fetch(`${this.config.base_url}/journal`, {
                        method: "PUT",
                        body: JSON.stringify(journalData)
                    }) as Journal;
                    return response;
                } catch (error: any) {
                    // Handle 409 Conflict (concurrent modification)
                    if (error.status === 409 || error.statusCode === 409) {
                        console.log('[SDK] Conflict detected - resolving with last-write-wins');
                        
                        // Fetch current server version
                        const serverJournal = await this.getJournalById(journal.server_id);
                        
                        // Compare timestamps - newer wins
                        const localTime = new Date(journal.updated_at).getTime();
                        const serverTime = new Date(serverJournal.updated_at).getTime();
                        
                        if (localTime > serverTime) {
                            // Local is newer - force update
                            console.log('[SDK] Local version is newer - forcing update');
                            const response = await this.fetch(`${this.config.base_url}/journal`, {
                                method: "PUT",
                                body: JSON.stringify(journalData)
                            }) as Journal;
                            return response;
                        } else {
                            // Server is newer - use server version
                            console.log('[SDK] Server version is newer - accepting server version');
                            return serverJournal;
                        }
                    }
                    
                    // Handle 404 Not Found (journal was deleted on server)
                    if (error.status === 404 || error.statusCode === 404) {
                        console.log('[SDK] Journal not found on server - creating new');
                        // Remove server_id and create as new
                        const createData = {
                            collection_id: journal.collection_id || null,
                            title: journal.title || '',
                            content: journal.content,
                            content_html: journal.content_html || undefined,
                            mood_score: journal.mood_score || undefined,
                            mood_label: journal.mood_label || undefined,
                        };
                        const response = await this.createJournal(createData);
                        return response;
                    }
                    
                    // Re-throw other errors
                    throw error;
                }
            } else {
                // No server_id - create new journal on server
                const createData = {
                    collection_id: journal.collection_id || null,
                    title: journal.title || '',
                    content: journal.content,
                    content_html: journal.content_html || undefined,
                    mood_score: journal.mood_score || undefined,
                    mood_label: journal.mood_label || undefined,
                };
                const response = await this.createJournal(createData);
                return response;
            }
        } catch (error) {
            console.error('[SDK] Error syncing journal:', error);
            throw error;
        }
    }

    /**
     * Batch sync multiple journals
     * Syncs journals sequentially to avoid overwhelming server
     * 
     * @param journals - Array of local journals to sync
     * @returns Array of sync results with success/error status
     */
    async batchSyncJournals(journals: LocalJournal[]): Promise<{
        success: Journal[];
        failed: { journal: LocalJournal; error: string }[];
    }> {
        const results = {
            success: [] as Journal[],
            failed: [] as { journal: LocalJournal; error: string }[],
        };

        for (const journal of journals) {
            try {
                const synced = await this.syncJournal(journal);
                results.success.push(synced);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                results.failed.push({ journal, error: errorMsg });
            }
        }

        return results;
    }

    /**
     * Download all journals from server for initial sync
     * Used after login to populate local database
     * 
     * @returns All user journals from server
     */
    async downloadAllJournals(): Promise<Journal[]> {
        try {
            const response = await this.getJournals();
            return response.user_journals || [];
        } catch (error) {
            console.error('[SDK] Error downloading journals:', error);
            throw error;
        }
    }

}