import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface AgentApprovalModalProps {
  visible: boolean;
  agentName: string;
  onApprove: () => void;
  onDeny: () => void;
  loading: boolean;
}

export function AgentApprovalModal({
  visible,
  agentName,
  onApprove,
  onDeny,
  loading,
}: AgentApprovalModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDeny}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Robot emoji */}
          <Text style={styles.emoji}>🤖</Text>

          {/* Title */}
          <Text style={styles.title}>Agent Pairing Request</Text>

          {/* Agent name */}
          <Text style={styles.agentName}>{agentName}</Text>

          {/* Warning text */}
          <Text style={styles.warning}>
            This agent will be able to request spending sessions.
          </Text>

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
    marginBottom: 16,
    textAlign: 'center',
  },
  warning: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
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

export default AgentApprovalModal;
