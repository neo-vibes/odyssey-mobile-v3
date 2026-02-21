import React from "react";
import { View, Text, Pressable } from "react-native";
import { Button, ButtonText } from "@gluestack-ui/themed";

/**
 * Test component to verify NativeWind and gluestack-ui integration
 */
export function StyleTest() {
  return (
    <View className="flex-1 bg-background-base items-center justify-center p-4">
      {/* NativeWind Test */}
      <View className="bg-background-elevated rounded-2xl p-6 gap-4 w-full max-w-sm">
        <Text className="text-gold text-h2 font-semibold text-center">
          Odyssey Mobile
        </Text>
        <Text className="text-text-primary text-body text-center">
          NativeWind styling works!
        </Text>
        <Text className="text-text-secondary text-caption text-center">
          Dark mode colors active
        </Text>

        {/* Session Card Example */}
        <Pressable className="bg-background-hover rounded-xl p-4 flex-row items-center gap-3">
          <View className="w-10 h-10 bg-gold-900 rounded-full items-center justify-center">
            <Text>🚀</Text>
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-medium">Session Test</Text>
            <Text className="text-text-muted text-sm">0.5 SOL limit</Text>
          </View>
          <View className="items-end">
            <Text className="text-success text-sm">Active</Text>
          </View>
        </Pressable>

        {/* Gluestack Button Test */}
        <Button className="bg-gold rounded-xl">
          <ButtonText className="text-black font-semibold">
            Gluestack Button
          </ButtonText>
        </Button>
      </View>
    </View>
  );
}
