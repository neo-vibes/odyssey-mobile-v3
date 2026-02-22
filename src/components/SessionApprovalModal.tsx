import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { PendingSession } from '../services/sessions';

interface SessionApprovalModalProps {
  visible: boolean;
  session: PendingSession | null;
  onApprove: () => void;
  onDeny: () => void;
  loading: boolean;
}

/**
 * Format lamports to SOL with symbol
 */
function formatAmount(amount: number, decimals: number, symbol: string): string {
  const value = amount / Math.pow(10, decimals);
  // Format with appropriate decimal places (max 4, trim trailing zeros)
  const formatted = value.toFixed(Math.min(decimals, 4)).replace(/\.?0+$/, '');
  return `${formatted} ${symbol}`;
}

/**
 * Format duration from seconds to human readable
 */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Get spending limit display string from session
 */
function getSpendingLimit(session: PendingSession): string {
  // Use limits array if available (V3 format)
  if (session.limits && session.limits.length > 0) {
    const limit = session.limits[0];
    const symbol = limit.mint === 'native' ? 'SOL' : (limit.symbol || 'tokens');
    return formatAmount(limit.amount, limit.decimals, symbol);
  }
  
  // Fallback to legacy fields
  const symbol = session.mint === 'native' ? 'SOL' : 'tokens';
  const decimals = session.mint === 'native' ? 9 : 6; // Assume 6 for unknown tokens
  return formatAmount(session.maxAmount, decimals, symbol);
}

export function SessionApprovalModal({
  visible,
  session,
  onApprove,
  onDeny,
  loading,
}: SessionApprovalModalProps) {
  if (!session) {
    return null;
  }

  const spendingLimit = getSpendingLimit(session);
  const duration = formatDuration(session.durationSeconds);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDeny}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Key emoji for session */}
          <Text style={styles.emoji}>🔑</Text>

          {/* Title */}
          <Text style={styles.title}>Session Request</Text>

          {/* Agent name */}
          <Text style={styles.agentName}>{session.agentName}</Text>

          {/* Session details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Spending Limit:</Text>
              <Text style={styles.detailValue}>{spendingLimit}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{duration}</Text>
            </View>
          </View>

          {/* Warning text */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warning}>
              This agent will be able to spend up to {spendingLimit} autonomously for the next {duration}.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#FFB84D" />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={onApprove}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.approveButtonText}>
                    Approve with Passkey
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.denyButton}
                  onPress={onDeny}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.denyButtonText}>Deny</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  agentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFB84D',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#252542',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFB84D',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 1,
  },
  warning: {
    flex: 1,
    fontSize: 13,
    color: '#ff8888',
    lineHeight: 18,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    minHeight: 110,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#FFB84D',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },
  denyButton: {
    borderWidth: 2,
    borderColor: '#ff4444',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  denyButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SessionApprovalModal;
