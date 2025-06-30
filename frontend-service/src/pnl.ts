import { fetchPnLResults } from './db';
import { PnL } from './types';

export async function getPnls(): Promise<Array<PnL>> {
    return await fetchPnLResults();
}