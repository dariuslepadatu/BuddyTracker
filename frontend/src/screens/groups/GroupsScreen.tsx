import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';


const GroupsScreen = () => {
    const tabBarHeight = useBottomTabBarHeight();
    const [groups, setGroups] = useState([
        'Group 1',
        'Group 2',
        'Group 3',
        'Group 4',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
        'Group 55555',
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight}} >
                {groups.map((group, idx) => (
                    <Text key={idx} style={styles.groupText}>
                        {group}
                    </Text>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: '#fff',
    },
    groupText: {
        fontSize: 16,
        margin: 10,
    },
});

export default GroupsScreen;
