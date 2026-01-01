import React, { memo } from 'react';
import {
    FlatList,
    TouchableOpacity,
    Image,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    View,
    StyleProp,
    ViewStyle,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface GridItem {
    id: string | number;
    image?: string | null;
    title?: string;
}

interface GridProps<T extends GridItem> {
    data: T[];
    columns?: number;
    bottomSpacing?: number;
    scrollToTop?: boolean;
    showLoadingMoreIndicator?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    onEndReached?: () => void;
    onItemPress?: (item: T) => void;
    loadingColor?: string;
}

function Grid<T extends GridItem>({
    data,
    columns = 2,
    bottomSpacing = 0,
    scrollToTop = false,
    showLoadingMoreIndicator = false,
    containerStyle,
    onEndReached,
    onItemPress,
    loadingColor = '#999',
}: GridProps<T>) {
    const itemWidth = SCREEN_WIDTH / columns;

    const renderItem = ({ item }: { item: T }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onItemPress?.(item)}
            style={[styles.item, { maxWidth: itemWidth }]}>
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
                <View style={[styles.image, styles.placeholder]} />
            )}

            {item.title ? (
                <Text style={styles.text} numberOfLines={3}>
                    {item.title}
                </Text>
            ) : null}
        </TouchableOpacity>
    );

    return (
        <View>
            <FlatList
                data={data}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                numColumns={columns}
                showsVerticalScrollIndicator={false}
                scrollsToTop={scrollToTop}
                onEndReached={onEndReached}
                contentContainerStyle={[styles.container, containerStyle]}
                ListFooterComponent={
                    <View style={{ height: bottomSpacing }}>
                        {showLoadingMoreIndicator && (
                            <ActivityIndicator
                                size='small'
                                color={loadingColor}
                            />
                        )}
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
    },
    item: {
        padding: 4,
        marginBottom: 12,
        flex: 1,
    },
    image: {
        width: '100%',
        aspectRatio: 11 / 16,
        borderRadius: 6,
        backgroundColor: '#2a2a2a',
    },
    placeholder: {
        opacity: 0.4,
    },
    text: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 6,
        minHeight: 34,
    },
});

export default memo(Grid);
