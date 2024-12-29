import React, {useEffect, useState} from 'react';
import {Image, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GroupsScreen = () => {

    const [groups, setGroups] = useState([
        'Group 1',
        'Group 2',
        'Group 3',
        'Group 3',
        'Group 4',
        'Group 5',

    ]);
    return (
        <SafeAreaView >
            <Text>Groups</Text>
            <ScrollView>
                {groups.map((group, idx) => (
                    <Text key={idx}>{group}</Text>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};


export default GroupsScreen;
