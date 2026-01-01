import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScrollView, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    return (
        <ScrollView style={styles.container}>
            <ThemedView>
                <ThemedText>This is profile screen</ThemedText>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderColor: 'blue',
        borderWidth: 2,
    },
});
