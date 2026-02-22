import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'odyssey_paired_agents';

export interface PairedAgent {
  agentId: string;    // base64 pubkey
  agentName: string;  // display name
  pairedAt: string;   // ISO date
}

/**
 * Get all paired agents from local storage
 */
export async function getPairedAgents(): Promise<PairedAgent[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) {
      return [];
    }
    return JSON.parse(json) as PairedAgent[];
  } catch (error) {
    console.error('[agent-storage] Failed to get paired agents:', error);
    return [];
  }
}

/**
 * Add a new paired agent to local storage
 */
export async function addPairedAgent(agent: PairedAgent): Promise<void> {
  try {
    const agents = await getPairedAgents();
    
    // Check if agent already exists (update if so)
    const existingIndex = agents.findIndex(a => a.agentId === agent.agentId);
    if (existingIndex >= 0) {
      agents[existingIndex] = agent;
    } else {
      agents.push(agent);
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch (error) {
    console.error('[agent-storage] Failed to add paired agent:', error);
    throw error;
  }
}

/**
 * Remove a paired agent by agentId
 */
export async function removePairedAgent(agentId: string): Promise<void> {
  try {
    const agents = await getPairedAgents();
    const filtered = agents.filter(a => a.agentId !== agentId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[agent-storage] Failed to remove paired agent:', error);
    throw error;
  }
}

/**
 * Check if an agent is already paired
 */
export async function isPaired(agentId: string): Promise<boolean> {
  try {
    const agents = await getPairedAgents();
    return agents.some(a => a.agentId === agentId);
  } catch (error) {
    console.error('[agent-storage] Failed to check paired status:', error);
    return false;
  }
}
